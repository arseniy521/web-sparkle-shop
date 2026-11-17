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
import { pages, redirects } from '../../src/routes/manifest.ts';
import { pageUrl } from '../../src/routes/urls.ts';
import releasePaths from '../../checks/wave1-paths.json' with { type: 'json' };
import { OLD_DIST } from './merged-global-setup.ts';

// The release as it is published (owner's decision of 2026-11-17: every page at once): every page
// and redirect stub of the new build merged into the old build, which still gives the site-wide
// files and the 404 page. It is served under its real address so that the production cookie rules
// hold: the old site wrote nius_consent for .nius.cz with Secure, the new one does so on www.nius.cz.
const SITE = 'https://www.nius.cz';
const NEW_HOME = `${SITE}/`;
const NEW_PAGE = `${SITE}${PILOT}`;
const ANALYTICS_HOST = /(^|\.)(amplitude\.com|googletagmanager\.com|google-analytics\.com)$/;
const SERVICE = cs.serviceCatalog.immunity_lite.title;

async function openMergedSite(page: Page) {
  await serveSiteAt(page, SITE, MERGED_ORIGIN);
  await installApiStub(page);
  const amplitude = await captureAmplitude(page);
  const ga = await captureGa(page);
  // Third parties of the pages that are not analytics: the map frame.
  await page.route('https://www.google.com/maps/**', (route) => route.fulfill({ contentType: 'text/html', body: '' }));
  const requests: Request[] = [];
  page.on('request', (request) => requests.push(request));
  return { amplitude, ga, requests };
}

const pageViewOf = (hit: { url: string }, url: string) => {
  const params = new URL(hit.url).searchParams;
  return params.get('en') === 'page_view' && params.get('dl') === url;
};
const analyticsRequests = (requests: Request[]) =>
  requests.filter((request) => ANALYTICS_HOST.test(new URL(request.url()).hostname)).map((request) => request.url());

const newBanner = (page: Page) => page.locator('[data-cookie-banner]');
const newCounter = (page: Page) => page.locator('[data-open-cart="header"] [data-cart-count]');
const orderForm = (page: Page) => page.getByRole('dialog', { name: cs.onboarding.dialogTitle });
// The new header's cart button: the new site's markup has it, the old app's never did.
const isNewPage = (page: Page) => page.locator('[data-open-cart="header"]');

async function rejectedBefore(page: Page) {
  await page.context().addCookies([{ name: 'nius_consent', value: 'rejected', domain: '.nius.cz', path: '/', secure: true }]);
}

test('The release list is every page and every redirect stub of the manifest', () => {
  const expected = [...pages.flatMap((p) => Object.values(p.paths)), ...redirects.map((r) => r.from)];
  expect([...releasePaths].sort()).toEqual(expected.sort());
});

test('Every page of the release is the new one', async ({ page }) => {
  await rejectedBefore(page);
  await openMergedSite(page);
  for (const address of pages.flatMap((p) => Object.values(p.paths))) {
    const response = await page.goto(`${SITE}${address}`);
    expect(response?.status(), address).toBe(200);
    await expect(isNewPage(page), address).toHaveCount(1);
  }
});

test('Every redirect stub of the release leads to its page and keeps the query and the hash', async ({ page }) => {
  await rejectedBefore(page);
  await openMergedSite(page);
  for (const redirect of redirects) {
    await page.goto(`${SITE}${redirect.from}?ref=K7M2QX#faq`);
    await expect(page, redirect.from).toHaveURL(`${SITE}${pageUrl(redirect.to.id, redirect.to.lang)}?ref=K7M2QX#faq`);
    await expect(isNewPage(page), redirect.from).toHaveCount(1);
  }
});

test('Cart filled on the home page is the cart of another page', async ({ page }) => {
  await rejectedBefore(page);
  await openMergedSite(page);
  await page.goto(NEW_HOME);
  await page.locator('nius-menu[section="menu"] [data-cart-control][data-code="immunity_lite"] [data-quick-add]').click();
  await expect(newCounter(page)).toHaveText('1');

  await page.locator('footer a[href="/iv-kapacky-praha/"]').click();
  await expect(page).toHaveURL(`${SITE}/iv-kapacky-praha/`);
  await expect(isNewPage(page)).toHaveCount(1);
  await expect(newCounter(page)).toHaveText('1');
  await page.locator('[data-open-cart="header"]').click();
  await expect(orderForm(page)).toBeVisible();
  await expect(orderForm(page)).toContainText(SERVICE);
});

for (const choice of ['Accept', 'Reject'] as const) {
  // A returning visitor of the old site: its consent cookie (.nius.cz, Secure) holds on the new pages.
  test(`Consent stored by the old site holds on the new pages: ${choice}`, async ({ page, context }) => {
    const value = choice === 'Accept' ? 'accepted' : 'rejected';
    await context.addCookies([{ name: 'nius_consent', value, domain: '.nius.cz', path: '/', secure: true }]);
    const { amplitude, ga, requests } = await openMergedSite(page);
    await page.goto(NEW_PAGE);
    await page.waitForLoadState('networkidle');
    await expect(isNewPage(page)).toHaveCount(1);
    await expect(newBanner(page)).toBeHidden();
    if (choice === 'Accept') {
      await expect
        .poll(() => amplitude.events().filter((e) => e.event_type === '[Amplitude] Page Viewed').map((e) => e.event_properties['[Amplitude] Page Path']))
        .toEqual([PILOT]);
      await expect.poll(() => ga.hits().filter((hit) => pageViewOf(hit, NEW_PAGE)).length).toBe(1);
    } else {
      expect(analyticsRequests(requests)).toEqual([]);
      expect(amplitude.events()).toEqual([]);
      expect(await page.evaluate(() => (window as unknown as Record<string, unknown>)['ga-disable-G-VNMLWF0XZG'])).toBe(true);
    }
  });
}

test('An unknown address answers with the old 404 page', async ({ page }) => {
  await openMergedSite(page);
  const response = await page.goto(`${SITE}/no-such-page/`);
  expect(response?.status()).toBe(404);
  // The new 404 page has the same title and heading, so the file itself is compared.
  expect(await response?.text()).toBe(fs.readFileSync(path.join(OLD_DIST, '404.html'), 'utf8'));
  await expect(page).toHaveTitle('Page Not Found - Nurse in Prague');
  await expect(page.locator('h1')).toHaveText('404');
});
