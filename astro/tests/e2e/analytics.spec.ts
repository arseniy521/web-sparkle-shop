import type { Page } from '@playwright/test';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import stubData from '../../preview/stub-data.json' with { type: 'json' };
import { captureAmplitude, visitorDataIn, VISITOR, type AmplitudeCapture } from '../fixtures/amplitude.ts';
import { installApiStub } from '../fixtures/api-stub.ts';
import { captureGa, stubGoogleIdentity, type GaCapture } from '../fixtures/google.ts';
import { expect, test } from '../fixtures/network-guard.ts';
import { E2E_ORIGIN } from '../fixtures/servers.ts';

const PILOT = '/sestricka-praha-1/';

// Every scenario here runs for a visitor who has accepted analytics.
async function withConsent(page: Page): Promise<{ amplitude: AmplitudeCapture; ga: GaCapture }> {
  await page.context().addCookies([{ name: 'nius_consent', value: 'accepted', url: E2E_ORIGIN }]);
  const amplitude = await captureAmplitude(page);
  const ga = await captureGa(page);
  await installApiStub(page);
  return { amplitude, ga };
}

const events = (amplitude: AmplitudeCapture, type: string) =>
  amplitude.events().filter((event) => event.event_type === type).map((event) => event.event_properties);
const payloads = (amplitude: AmplitudeCapture, ga: GaCapture) => [
  ...amplitude.requests().map((r) => `${r.url}\n${r.body}`),
  ...ga.hits().map((h) => `${h.url}\n${h.body}`),
];

test('Phone link click', async ({ page }) => {
  const { amplitude } = await withConsent(page);
  await page.goto(PILOT);

  await page.locator('footer a[href^="tel:"]').click();

  await expect
    .poll(() => events(amplitude, 'cta_clicked'))
    .toEqual([{ language: 'cs', page_path: PILOT, cta: 'phone', source: 'footer' }].map((p) => expect.objectContaining(p)));
});

test('Navigation between pages', async ({ page }) => {
  const { amplitude } = await withConsent(page);
  await page.goto(PILOT);
  await expect.poll(() => events(amplitude, '[Amplitude] Page Viewed')).toHaveLength(1);

  // The only other page of the slice reachable by a link: the blog, still served by the 404 page.
  await page.locator('footer a[href="/blog/"]').click();
  await expect(page).toHaveURL('/blog/');
  await page.waitForTimeout(2500);

  expect(events(amplitude, '[Amplitude] Page Viewed').map((p) => p['[Amplitude] Page Path'])).toEqual([PILOT, '/blog/']);
});

// Known gap: metrics reported while the tab closes or navigates away are lost before the SDK
// stores them (Amplitude handles each event in a later task, which a closing page never runs).
// Owner decision pending: design.md, "Вопросы владельцу по итогам среза", item 10. This scenario
// checks the path the site performs reliably: the tab is hidden and stays alive.
test('Metrics of a page view', async ({ page }) => {
  test.info().annotations.push({
    type: 'known gap',
    description:
      'Metrics reported while the tab closes or navigates away are lost before the SDK stores them; ' +
      'owner decision pending (design.md, "Вопросы владельцу по итогам среза", item 10).',
  });
  const { amplitude, ga } = await withConsent(page);
  await page.goto(PILOT);
  await page.waitForLoadState('networkidle');
  // The visitor has seen the page: LCP and CLS exist only once it has painted. The first paint
  // of a fresh browser can come after 'networkidle'.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        new PerformanceObserver((_, observer) => {
          observer.disconnect();
          resolve();
        }).observe({ type: 'largest-contentful-paint', buffered: true }),
      ),
  );

  // The visitor presses a key, then switches to another tab. Headless Chromium has no real
  // visibility change (another tab in front, a minimized window and CDP leave the page
  // 'visible'), so the switch is a synthetic 'visibilitychange' with the page reporting
  // 'hidden'. web-vitals finalizes LCP only on a trusted event, hence the real key press first.
  await page.keyboard.press('Shift');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
  });

  // The hidden page is still alive: its SDK stores and uploads the metrics itself.
  await expect
    .poll(() => events(amplitude, 'web_vital'))
    .toEqual(
      expect.arrayContaining(
        ['LCP', 'CLS'].map((name) => expect.objectContaining({ language: 'cs', page_path: PILOT, name })),
      ),
    );
  expect(visitorDataIn(payloads(amplitude, ga))).toEqual([]);
});

test('Visit to a missing page', async ({ page }) => {
  const { amplitude } = await withConsent(page);

  const response = await page.goto('/old-page/?utm_source=x');

  expect(response?.status()).toBe(404);
  await expect.poll(() => events(amplitude, 'page_not_found')).toEqual([{ language: 'en', page_path: '/old-page/' }].map((p) => expect.objectContaining(p)));
  expect(events(amplitude, 'page_not_found')[0]).not.toHaveProperty('referrer_path');

  // The same missing page reached through a link on the pilot page.
  await page.goto(PILOT);
  await page.evaluate(() => {
    const link = document.createElement('a');
    link.href = '/old-page/?utm_source=x';
    link.textContent = 'e2e old link';
    document.body.prepend(link);
  });
  await page.getByRole('link', { name: 'e2e old link' }).click();
  await expect(page).toHaveURL('/old-page/?utm_source=x');
  await expect
    .poll(() => events(amplitude, 'page_not_found'))
    .toEqual([
      expect.objectContaining({ language: 'en', page_path: '/old-page/' }),
      expect.objectContaining({ language: 'en', page_path: '/old-page/', referrer_path: PILOT }),
    ]);
});

test('Analytics blocked by the browser', async ({ page }) => {
  await page.context().addCookies([{ name: 'nius_consent', value: 'accepted', url: E2E_ORIGIN }]);
  const blocked: string[] = [];
  await page.route(/^https:\/\/([^/]+\.)?(amplitude\.com|googletagmanager\.com|google-analytics\.com)\//, (route) => {
    blocked.push(route.request().url());
    return route.abort('blockedbyclient');
  });
  await installApiStub(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    // Chrome logs every blocked or non-2xx request (here: Amplitude, gtag.js and the anonymous
    // 401 of /auth/me/public); those lines are not errors of the site's code.
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) errors.push(message.text());
  });

  await page.goto(PILOT);
  await page.locator('[data-open-cart="header"]').click();

  await expect(page.getByRole('dialog', { name: cs.onboarding.dialogTitle })).toBeVisible();
  await page.waitForTimeout(2000);
  expect(blocked.some((url) => url.includes('googletagmanager.com'))).toBe(true);
  expect(blocked.some((url) => url.includes('amplitude.com'))).toBe(true);

  // A tracked link that leaves the page still leaves it, though its event cannot be uploaded.
  await page.keyboard.press('Escape');
  const uploads = blocked.length;
  await page.locator('header a[data-cta="choose_service"]').first().click();
  await expect(page).toHaveURL('/#menu');
  expect(blocked.slice(uploads).some((url) => url.includes('api2.amplitude.com')), 'the click tried to upload').toBe(true);
  expect(errors).toEqual([]);
});

test('Client errors without visitor data', async ({ page }) => {
  const { amplitude, ga } = await withConsent(page);
  await page.goto(PILOT);

  await page.evaluate(
    ({ phone, address }) => {
      setTimeout(() => {
        throw new Error(`Call ${phone} at ${address}`);
      });
      void Promise.reject(new TypeError(`fetch failed for ${phone}`));
    },
    { phone: VISITOR.phone, address: VISITOR.address },
  );

  await expect
    .poll(() => events(amplitude, 'client_error'))
    .toEqual(
      expect.arrayContaining([
        { language: 'cs', block: 'page', error_type: 'Error' },
        { language: 'cs', block: 'page', error_type: 'TypeError' },
      ].map((p) => expect.objectContaining(p))),
    );
  expect(visitorDataIn(payloads(amplitude, ga))).toEqual([]);
});

test('Superadmin excluded from analytics', async ({ page }) => {
  const { amplitude } = await withConsent(page);
  await installApiStub(page, { authUser: { ...stubData.authUser, role: 'SUPERADMIN' } });
  await stubGoogleIdentity(page, 'e2e-google-code');
  await page.addInitScript(
    ([code, phone, address]) => {
      if (sessionStorage.getItem('e2e-seeded')) return;
      sessionStorage.setItem('e2e-seeded', '1');
      const data = { phone, address, desiredTiming: 'ASAP', addressTo: '', addressFloor: '', addressIntercom: '', patientNote: '' };
      sessionStorage.setItem('nius_onboarding_draft_v2', JSON.stringify({ codes: [code], data, savedAt: Date.now() }));
    },
    [stubData.services[0].code, VISITOR.phone.replace(/\s/g, ''), VISITOR.address] as const,
  );
  await page.goto(PILOT);
  const form = page.getByRole('dialog', { name: cs.onboarding.dialogTitle });
  await page.locator('[data-open-cart="header"]').click();
  await form.getByRole('button', { name: cs.onboarding.finish }).click();
  await expect(form.getByText(cs.onboarding.final.title)).toBeVisible();

  const signedIn = page.waitForResponse((response) => response.url().endsWith('/api/auth/google'));
  await form.getByRole('button', { name: cs.onboarding.final.loginBtn }).click();
  await signedIn;
  const signedInAt = await page.evaluate(() => Date.now());

  // Anything the visitor does from now on is not tracked.
  await expect(form.getByRole('alert')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(form).toBeHidden();
  await page.locator('footer a[href^="tel:"]').click();
  await page.waitForTimeout(2500);

  const tracked = amplitude.events() as unknown as Array<{ event_type: string; time: number }>;
  expect(tracked.filter((event) => event.time < signedInAt).map((e) => e.event_type)).toContain('order_created');
  expect(tracked.filter((event) => event.time >= signedInAt).map((e) => e.event_type)).toEqual([]);
});
