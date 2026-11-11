import type { Page } from '@playwright/test';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import stubData from '../../preview/stub-data.json' with { type: 'json' };
import { captureAmplitude, visitorDataIn, VISITOR, type AmplitudeCapture } from '../fixtures/amplitude.ts';
import { installApiStub } from '../fixtures/api-stub.ts';
import { captureGa, stubGoogleIdentity, type GaCapture } from '../fixtures/google.ts';
import { expect, test } from '../fixtures/network-guard.ts';
import { E2E_ORIGIN } from '../fixtures/servers.ts';
import { PILOT } from '../fixtures/pilot.ts';

const DRAFT_KEY = 'nius_onboarding_draft_v2';
const FORM_CHUNK = /\/_astro\/mount\.[\w-]+\.js$/;
const [LITE, HYDRATE] = stubData.services;

interface Opened {
  amplitude: AmplitudeCapture;
  ga: GaCapture;
}

// Consent is given so that every scenario also checks what reaches analytics.
async function openPilot(page: Page, codes: string[] = [LITE.code]): Promise<Opened> {
  await page.context().addCookies([{ name: 'nius_consent', value: 'accepted', url: E2E_ORIGIN }]);
  const amplitude = await captureAmplitude(page);
  const ga = await captureGa(page);
  await installApiStub(page);
  await page.addInitScript(
    ([key, draftCodes]) => {
      // Seed the cart once per tab, as if it had been filled earlier; later loads keep what the site stored.
      if (sessionStorage.getItem('e2e-seeded')) return;
      sessionStorage.setItem('e2e-seeded', '1');
      if (draftCodes.length > 0) {
        sessionStorage.setItem(key, JSON.stringify({ codes: draftCodes, data: {}, savedAt: Date.now() }));
      }
    },
    [DRAFT_KEY, codes] as const,
  );
  await page.goto(PILOT);
  return { amplitude, ga };
}

const dialog = (page: Page) => page.getByRole('dialog', { name: cs.onboarding.dialogTitle });
const events = (amplitude: AmplitudeCapture, type: string) =>
  amplitude.events().filter((event) => event.event_type === type).map((event) => event.event_properties);
const payloads = ({ amplitude, ga }: Opened) => [
  ...amplitude.requests().map((r) => `${r.url}\n${r.body}`),
  ...ga.hits().map((h) => `${h.url}\n${h.body}`),
];

async function fillOrder(page: Page) {
  const form = dialog(page);
  await page.locator('#onboarding-address').fill(VISITOR.address);
  await page.locator('#onboarding-floor').fill(VISITOR.floor);
  await page.locator('#onboarding-intercom').fill(VISITOR.intercom);
  await form.getByRole('button', { name: cs.onboarding.next }).click();
  await form.locator('button.snap-start').nth(1).click();
  await form.getByRole('button', { name: '10:00', exact: true }).click();
  await form.getByRole('button', { name: cs.onboarding.next }).click();
  await page.locator('#onboarding-phone').fill(VISITOR.phone);
  await form.getByRole('button', { name: cs.onboarding.next }).click();
  await page.locator('#onboarding-note').fill(VISITOR.note);
}

test('Cart icon in the header', async ({ page }) => {
  const { amplitude } = await openPilot(page);
  await page.locator('[data-open-cart="header"]').click();

  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).toContainText(cs.serviceCatalog.immunity_lite.title);
  await expect(page.locator('#onboarding-address')).toBeVisible();
  await expect
    .poll(() => events(amplitude, 'order_form_opened'))
    .toEqual([expect.objectContaining({ source: 'header', services_in_cart: 1, language: 'cs' })]);
});

test('Booking link on a service page', async ({ page }) => {
  // The addresses the old site's /sestricka-praha-1/ links to (src/pages/SestrickaPraha1.tsx).
  const OLD_BOOKING = ['https://nurseinprague.setmore.com/book', 'https://nurseinprague.setmore.com/book'];
  const formRequests: string[] = [];
  page.on('request', (request) => {
    if (FORM_CHUNK.test(request.url())) formRequests.push(request.url());
  });
  await page.context().route('https://nurseinprague.setmore.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>Setmore stub</title>' }),
  );
  await openPilot(page, []);

  const booking = page.locator('main a[href*="setmore.com"], main a[href*="wa.me"]');
  await expect(booking).toHaveCount(OLD_BOOKING.length);
  expect(await booking.evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual(OLD_BOOKING);

  const [popup] = await Promise.all([page.waitForEvent('popup'), booking.first().click()]);
  await expect(popup).toHaveURL(OLD_BOOKING[0]);
  await page.waitForTimeout(500);
  await expect(dialog(page)).toHaveCount(0);
  expect(formRequests).toEqual([]);
});

test('Click before the form code is loaded', async ({ page }) => {
  let chunkDelivered = 0;
  await page.route(FORM_CHUNK, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await route.fallback();
    chunkDelivered = Date.now();
  });
  await openPilot(page);

  const cartIcon = page.locator('[data-open-cart="header"]');
  await cartIcon.click();
  const clickedAt = Date.now();

  await expect(dialog(page)).toBeVisible({ timeout: 10_000 });
  expect(chunkDelivered, 'the form code arrived after the click').toBeGreaterThan(clickedAt);
});

test('Form code failed to load', async ({ page }) => {
  await page.route(FORM_CHUNK, (route) => route.abort('internetdisconnected'));
  const { amplitude } = await openPilot(page);

  await page.locator('[data-open-cart="header"]').click();

  const fallback = page.locator('#order-form-fallback');
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute('role', 'alert');
  await expect(fallback).toContainText(cs.onboarding.errors.network);
  await expect(fallback.locator('a[href="tel:+420773629123"]')).toBeVisible();
  await expect(fallback.locator('a[href="https://wa.me/420773629123"]')).toBeVisible();
  await expect(dialog(page)).toHaveCount(0);
  await expect
    .poll(() => events(amplitude, 'client_error'))
    .toEqual([{ language: 'cs', block: 'order_form', error_type: 'TypeError' }].map((p) => expect.objectContaining(p)));
});

test('Visitor with an active order', async ({ page }) => {
  const { amplitude } = await openPilot(page);
  await page.route('**/api/auth/me/public', (route) =>
    route.fulfill({ json: { authenticated: true, id: 'usr_test_1', name: VISITOR.name, picture: null, role: 'PATIENT' } }),
  );
  await page.route('**/api/customers/summary', (route) =>
    route.fulfill({
      json: {
        activeOrder: { id: 'ord_active_1', status: 'NEW', lastEventAt: '2026-11-10T10:00:00.000Z' },
        completedOrdersLast12Months: 0,
        lastCompletedOrderAt: null,
        isFrequentCustomer: false,
      },
    }),
  );

  await page.locator('[data-open-cart="header"]').click();

  await expect(dialog(page).getByText(cs.onboarding.activeOrder.title)).toBeVisible();
  await expect(dialog(page).getByRole('link', { name: cs.onboarding.activeOrder.cta })).toHaveAttribute(
    'href',
    'https://app.nius.cz/cabinet',
  );
  await expect(page.locator('#onboarding-address')).toHaveCount(0);
  await expect(dialog(page).getByRole('button', { name: cs.onboarding.finish })).toHaveCount(0);
  await expect
    .poll(() => events(amplitude, 'active_order_gate_shown'))
    .toEqual([expect.objectContaining({ language: 'cs' })]);
});

test('Order creation failed', async ({ page }) => {
  const opened = await openPilot(page);
  await page.route('**/api/onboarding/order', (route) =>
    route.request().method() === 'POST' ? route.fulfill({ status: 500, json: { message: 'Internal error' } }) : route.fallback(),
  );
  await page.locator('[data-open-cart="header"]').click();
  await fillOrder(page);

  await dialog(page).getByRole('button', { name: cs.onboarding.finish }).click();

  await expect(page.locator('[data-sonner-toast]')).toContainText(cs.onboarding.errors.server);
  await expect(page.locator('#onboarding-note')).toHaveValue(VISITOR.note);
  await expect(dialog(page)).toContainText(VISITOR.address);
  await expect(dialog(page)).toContainText(VISITOR.phone.replace(/\s/g, ''));
  await expect
    .poll(() => events(opened.amplitude, 'order_create_failed'))
    .toEqual([expect.objectContaining({ error_code: 'server', source: 'header', language: 'cs' })]);

  // Visitor data stays inside the form fields: no other DOM attribute and no payload carries it.
  const attributes = await page.evaluate(() =>
    [...document.querySelectorAll('*')].flatMap((el) =>
      [...el.attributes]
        .filter((attr) => !(attr.name === 'value' && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)))
        .map((attr) => `${el.tagName} ${attr.name}=${attr.value}`),
    ),
  );
  expect(visitorDataIn(attributes)).toEqual([]);
  expect(visitorDataIn(payloads(opened))).toEqual([]);
});

test('Google sign-in after the order', async ({ page }) => {
  const opened = await openPilot(page);
  await stubGoogleIdentity(page, 'e2e-google-code');
  await page.route('https://app.nius.cz/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>App stub</title>' }),
  );
  const googleAuth = page.waitForRequest((request) => request.url().endsWith('/api/auth/google'));
  await page.locator('[data-open-cart="header"]').click();
  await fillOrder(page);
  await dialog(page).getByRole('button', { name: cs.onboarding.finish }).click();
  await expect(dialog(page).getByText(cs.onboarding.final.title)).toBeVisible();

  await dialog(page).getByRole('button', { name: cs.onboarding.final.loginBtn }).click();

  expect((await googleAuth).postDataJSON()).toEqual({
    code: 'e2e-google-code',
    orderId: stubData.order.id,
    orderAccessToken: stubData.order.accessToken,
  });
  // The site calls location.replace twice (after sign-in and after linking); the first is cancelled.
  await expect(page).toHaveURL('https://app.nius.cz/form');
  expect(visitorDataIn(payloads(opened))).toEqual([]);
});

test('Completed order', async ({ page }) => {
  const opened = await openPilot(page, [LITE.code, HYDRATE.code]);
  await stubGoogleIdentity(page, 'e2e-google-code');
  await expect(page.locator('[data-open-cart="header"] [data-cart-count]')).toHaveText('2');
  await page.locator('[data-open-cart="header"]').click();
  await fillOrder(page);
  await dialog(page).getByRole('button', { name: cs.onboarding.finish }).click();
  await expect(dialog(page).getByText(cs.onboarding.final.title)).toBeVisible();

  for (const badge of await page.locator('[data-cart-count]').all()) await expect(badge).toBeHidden();
  expect(await page.evaluate((key) => sessionStorage.getItem(key), DRAFT_KEY)).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('nius_onboarding_draft_v1'))).toBeNull();
  await expect
    .poll(() => events(opened.amplitude, 'order_created'))
    .toEqual([
      expect.objectContaining({
        order_id: stubData.order.id,
        items_count: 2,
        service_codes: [LITE.code, HYDRATE.code],
        source: 'header',
        language: 'cs',
      }),
    ]);

  await page.reload();
  await expect(page.locator('[data-cart-count]').first()).toBeHidden();
  for (const badge of await page.locator('[data-cart-count]').all()) await expect(badge).toBeHidden();
  await page.locator('[data-open-cart="header"]').click();
  await expect(dialog(page).getByText(cs.onboarding.emptyCart.title)).toBeVisible();

  // Analytics defaults: no SDK autocapture beyond page views and sessions, nothing of the visitor.
  const sdkEvents = opened.amplitude.events().map((event) => event.event_type).filter((type) => type.startsWith('[Amplitude]'));
  expect([...new Set(sdkEvents)]).toEqual(['[Amplitude] Page Viewed']);
  // Every event of the site itself carries the page language (the SDK's own events do not).
  const siteEvents = opened.amplitude.events().filter((e) => !/^(\[Amplitude\]|\$identify$|session_)/.test(e.event_type));
  expect(siteEvents.length).toBeGreaterThan(3);
  expect(siteEvents.filter((e) => e.event_properties.language !== 'cs').map((e) => e.event_type)).toEqual([]);
  expect(visitorDataIn(payloads(opened))).toEqual([]);
});
