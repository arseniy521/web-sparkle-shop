import fs from 'node:fs';
import path from 'node:path';
import type { Page, Request } from '@playwright/test';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import { captureAmplitude } from '../fixtures/amplitude.ts';
import { installApiStub } from '../fixtures/api-stub.ts';
import { captureGa } from '../fixtures/google.ts';
import { expect, serveSiteAt, test } from '../fixtures/network-guard.ts';
import { MERGED_ORIGIN } from '../fixtures/servers.ts';
import { PILOT } from '../fixtures/pilot.ts';
import { OLD_DIST } from './merged-global-setup.ts';

// The merged release (old site + the nine wave-1 pages of the new one) under its real address,
// so both sites keep their production cookie rules: the old build always writes nius_consent for
// .nius.cz with Secure, the new one does so on www.nius.cz.
const SITE = 'https://www.nius.cz';
const OLD_HOME = `${SITE}/`;
const NEW_PAGE = `${SITE}${PILOT}`;
const ANALYTICS_HOST = /(^|\.)(amplitude\.com|googletagmanager\.com|google-analytics\.com)$/;
const SERVICE = cs.serviceCatalog.immunity_lite.title;

async function openMergedSite(page: Page) {
  await serveSiteAt(page, SITE, MERGED_ORIGIN);
  // Both builds call the stub: the old one at https://app.nius.cz/api, the new one at /api.
  await installApiStub(page);
  const amplitude = await captureAmplitude(page);
  const ga = await captureGa(page);
  // Third parties of the old pages that are not analytics: the icon font and the map.
  await page.route('https://cdn.jsdelivr.net/**', (route) => route.fulfill({ contentType: 'text/css', body: '' }));
  await page.route('https://www.google.com/maps/**', (route) => route.fulfill({ contentType: 'text/html', body: '' }));
  const requests: Request[] = [];
  page.on('request', (request) => requests.push(request));
  return { amplitude, ga, requests };
}

const pageViewOf = (hit: { url: string }, pageUrl: string) => {
  const params = new URL(hit.url).searchParams;
  return params.get('en') === 'page_view' && params.get('dl') === pageUrl;
};
const analyticsRequests = (requests: Request[]) =>
  requests.filter((request) => ANALYTICS_HOST.test(new URL(request.url()).hostname)).map((request) => request.url());

// Old pages: the React app replaces the prerendered HTML; its header requests the sign-in status
// in the same commit that shows or hides the cookie banner.
async function gotoOld(page: Page, url: string) {
  const authStatus = page.waitForRequest((request) => request.url().startsWith('https://app.nius.cz/api/'));
  await page.goto(url);
  await authStatus;
  await page.waitForLoadState('networkidle');
}
const oldBanner = (page: Page) => page.getByRole('dialog', { name: 'Cookie consent' });
const oldCartButton = (page: Page) => page.locator(`header[role="banner"] button[aria-label="${cs.nav.cart}"]`).first();

// New pages.
const newBanner = (page: Page) => page.locator('[data-cookie-banner]');
const newCounter = (page: Page) => page.locator('[data-open-cart="header"] [data-cart-count]');
const orderForm = (page: Page) => page.getByRole('dialog', { name: cs.onboarding.dialogTitle });
const isNewPage = (page: Page) => page.locator('[data-open-cart="header"]');

async function rejectedBefore(page: Page) {
  await page.context().addCookies([{ name: 'nius_consent', value: 'rejected', domain: '.nius.cz', path: '/', secure: true }]);
}

test('Cart filled on the old site', async ({ page }) => {
  await rejectedBefore(page);
  await openMergedSite(page);

  // The old home page: the service catalog's own "add to cart" button.
  await gotoOld(page, OLD_HOME);
  await expect(isNewPage(page)).toHaveCount(0);
  await page.locator('nius-menu [data-cart-control][data-code="immunity_lite"] [data-quick-add]').click();
  await expect(oldCartButton(page)).toHaveText('1');

  await page.goto(NEW_PAGE);
  await expect(isNewPage(page)).toHaveCount(1);
  await expect(newCounter(page)).toBeVisible();
  await expect(newCounter(page)).toHaveText('1');
  await page.locator('[data-open-cart="header"]').click();
  await expect(orderForm(page)).toBeVisible();
  await expect(orderForm(page)).toContainText(SERVICE);
  await expect(orderForm(page).getByText(cs.onboarding.emptyCart.title)).toHaveCount(0);
});

test('Cart changed on a new page is the cart of the old site', async ({ page }) => {
  await rejectedBefore(page);
  await openMergedSite(page);
  await gotoOld(page, OLD_HOME);
  await page.locator('nius-menu [data-cart-control][data-code="immunity_lite"] [data-quick-add]').click();
  await expect(oldCartButton(page)).toHaveText('1');

  // No wave-1 page has a catalog; the order form's stepper is the new site's own way to add.
  await page.goto(NEW_PAGE);
  await page.locator('[data-open-cart="header"]').click();
  await orderForm(page)
    .getByRole('button', { name: cs.onboarding.cart.increaseQuantity.replace('{{name}}', SERVICE) })
    .click();
  await expect(newCounter(page)).toHaveText('2');
  await page.keyboard.press('Escape');
  await expect(orderForm(page)).toBeHidden();

  // Back to the old home page by the new header's link to the catalog.
  const authStatus = page.waitForRequest((request) => request.url().startsWith('https://app.nius.cz/api/'));
  await page.locator('header a[data-cta="choose_service"]').filter({ visible: true }).click();
  await authStatus;
  await expect(page).toHaveURL(`${SITE}/#menu`);
  await expect(isNewPage(page)).toHaveCount(0);
  await expect(oldCartButton(page)).toHaveText('2');
  await oldCartButton(page).click();
  await expect(orderForm(page)).toBeVisible();
  await expect(orderForm(page)).toContainText(SERVICE);
  await expect(orderForm(page).getByLabel(cs.onboarding.cart.quantity)).toContainText('2');
});

for (const choice of ['Accept', 'Reject'] as const) {
  test(`Consent given on an old page holds on a new page: ${choice}`, async ({ page, context }) => {
    const { amplitude, ga, requests } = await openMergedSite(page);
    await gotoOld(page, OLD_HOME);
    await expect(oldBanner(page)).toBeVisible();
    await oldBanner(page).getByRole('button', { name: choice, exact: true }).click();
    await expect(oldBanner(page)).toBeHidden();
    const value = choice === 'Accept' ? 'accepted' : 'rejected';
    expect((await context.cookies()).find((c) => c.name === 'nius_consent')).toMatchObject({ value, domain: '.nius.cz' });

    const before = requests.length;
    await page.goto(NEW_PAGE);
    await page.waitForLoadState('networkidle');
    await expect(isNewPage(page)).toHaveCount(1);
    await expect(newBanner(page)).toBeHidden();
    if (choice === 'Accept') {
      await expect
        .poll(() => amplitude.events().filter((e) => e.event_type === '[Amplitude] Page Viewed').map((e) => e.event_properties['[Amplitude] Page Path']))
        .toEqual([PILOT]);
      await expect
        .poll(() => ga.hits().filter((hit) => pageViewOf(hit, NEW_PAGE)).length)
        .toBe(1);
    } else {
      expect(analyticsRequests(requests.slice(before))).toEqual([]);
      expect(amplitude.events()).toEqual([]);
      expect(await page.evaluate(() => (window as unknown as Record<string, unknown>)['ga-disable-G-VNMLWF0XZG'])).toBe(true);
    }
  });

  test(`Consent given on a new page holds on an old page: ${choice}`, async ({ page }) => {
    const { ga, requests } = await openMergedSite(page);
    await page.goto(NEW_PAGE);
    await expect(newBanner(page)).toBeVisible();
    await newBanner(page).locator(`[data-consent="${choice.toLowerCase()}"]`).click();
    await expect(newBanner(page)).toBeHidden();

    const before = requests.length;
    await gotoOld(page, OLD_HOME);
    await expect(isNewPage(page)).toHaveCount(0);
    await expect(oldBanner(page)).toHaveCount(0);
    // The old build has no Amplitude key; Google Analytics is its only analytics. Its prerendered
    // HTML requests gtag.js whatever the consent (see the task report); what consent decides is
    // whether the page configures it and so sends a page view.
    const oldPageViews = () => ga.hits().filter((hit) => pageViewOf(hit, OLD_HOME));
    const gaDisabled = await page.evaluate(() => (window as unknown as Record<string, unknown>)['ga-disable-G-VNMLWF0XZG']);
    if (choice === 'Accept') {
      // The page loads gtag.js twice (prerendered tag and inline loader); the stub answers per copy.
      await expect.poll(() => oldPageViews().length).toBeGreaterThan(0);
      expect(gaDisabled).toBeUndefined();
    } else {
      expect(gaDisabled).toBe(true);
      expect(oldPageViews()).toEqual([]);
      expect(analyticsRequests(requests.slice(before)).filter((url) => !url.includes('/gtag/js'))).toEqual([]);
    }
  });
}

test('Header navigation between a new page and an old page', async ({ page }, testInfo) => {
  await rejectedBefore(page);
  await openMergedSite(page);
  await page.goto(NEW_PAGE);

  // The new header's logo leads to the old home page.
  const authStatus = page.waitForRequest((request) => request.url().startsWith('https://app.nius.cz/api/'));
  await page.locator('header a[href="/"]').filter({ visible: true }).first().click();
  await authStatus;
  await expect(page).toHaveURL(OLD_HOME);
  await expect(isNewPage(page)).toHaveCount(0);
  await expect(oldCartButton(page)).toBeVisible();

  // And back: the browser's back button returns to the new page.
  await page.goBack();
  await expect(page).toHaveURL(NEW_PAGE);
  await expect(isNewPage(page)).toHaveCount(1);

  // The old header links to no wave-1 address; its footer links to /privacy/. The old app routes
  // that click itself, so the visitor gets the right address with the old app's version of the
  // page (design.md, risk of the pilot wave); a reload gets the new one.
  await gotoOld(page, OLD_HOME);
  await page.locator('footer a[href="/privacy/"]').click();
  await expect(page).toHaveURL(`${SITE}/privacy/`);
  await expect(page.locator('h1')).toHaveText('Privacy Policy');
  testInfo.annotations.push({
    type: 'old footer link to /privacy/',
    description: (await isNewPage(page).count()) === 1 ? 'new page' : "old app's version",
  });
  await page.reload();
  await expect(isNewPage(page)).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Privacy Policy');
});

test('An unknown address answers with the old 404 page', async ({ page }) => {
  await openMergedSite(page);
  const response = await page.goto(`${SITE}/no-such-page/`);
  expect(response?.status()).toBe(404);
  // The new 404 page has the same title and heading, so the file itself is compared.
  expect(await response?.text()).toBe(fs.readFileSync(path.join(OLD_DIST, '404.html'), 'utf8'));
  await expect(page).toHaveTitle('Page Not Found - Nurse in Prague');
  await expect(page.locator('h1')).toHaveText('404');
});
