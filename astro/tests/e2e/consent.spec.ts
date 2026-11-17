import type { Page, Request } from '@playwright/test';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import { captureAmplitude } from '../fixtures/amplitude.ts';
import { installApiStub } from '../fixtures/api-stub.ts';
import { captureGa } from '../fixtures/google.ts';
import { expect, serveSiteAt, test } from '../fixtures/network-guard.ts';
import { E2E_ORIGIN, E2E_ORIGIN_IP } from '../fixtures/servers.ts';
import { PILOT } from '../fixtures/pilot.ts';

const PRODUCTION = 'https://www.nius.cz';
const ANALYTICS_HOST = /(^|\.)(amplitude\.com|googletagmanager\.com|google-analytics\.com)$/;
// Strings that only the Amplitude SDK and web-vitals contain.
const ANALYTICS_CODE = ['amplitude-ts', 'largest-contentful-paint'];

const banner = (page: Page) => page.locator('[data-cookie-banner]');
const analyticsRequests = (requests: Request[]) =>
  requests.filter((request) => ANALYTICS_HOST.test(new URL(request.url()).hostname)).map((request) => request.url());
const gaDisabled = (page: Page) =>
  page.evaluate(() => (window as unknown as Record<string, unknown>)['ga-disable-G-VNMLWF0XZG']);

const ADS_ID = 'AW-0000000000';
const DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
const GRANTED = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied', analytics_storage: 'granted' };

/** What the page handed to the Google tag (gtag pushes `arguments` objects), as plain arrays. */
const dataLayer = (page: Page) =>
  page.evaluate(() => (window.dataLayer ?? []).map((args) => JSON.parse(JSON.stringify([...(args as unknown[])])) as unknown[]));
const consentCommands = async (page: Page) =>
  (await dataLayer(page)).filter((entry) => entry[0] === 'consent' || (entry[0] === 'set' && entry[1] === 'ads_data_redaction'));
const configuredIds = async (page: Page) => (await dataLayer(page)).filter((entry) => entry[0] === 'config').map((entry) => entry[1]);

function recordRequests(page: Page): Request[] {
  const requests: Request[] = [];
  page.on('request', (request) => requests.push(request));
  return requests;
}

test('First visit', async ({ page }) => {
  await installApiStub(page);
  const requests = recordRequests(page);
  const thirdPartyScripts = new Set<string>();

  for (const path of [PILOT, '/no-such-page/']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    if (path === PILOT) await expect(banner(page)).toBeVisible();
    if (path === PILOT) {
      // Consent Mode: everything denied by default, nothing granted, no tag configured.
      expect(await consentCommands(page)).toEqual([
        ['consent', 'default', { ...DENIED, wait_for_update: 500 }],
        ['set', 'ads_data_redaction', true],
      ]);
      expect(await configuredIds(page)).toEqual([]);
    }

    // Neither the code that was fetched nor the code the HTML announces contains the SDKs.
    const preloads = await page.locator('link[rel="modulepreload"]').evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href),
    );
    const scripts = requests.filter((request) => request.resourceType() === 'script').map((request) => request.url());
    for (const url of new Set([...scripts, ...preloads])) {
      // Only the site's own code is read back (page.request bypasses the network guard); any
      // third-party script before consent is itself the failure and is never fetched.
      if (new URL(url).host !== new URL(E2E_ORIGIN).host) {
        thirdPartyScripts.add(url);
        continue;
      }
      const code = await (await page.request.get(url)).text();
      for (const marker of ANALYTICS_CODE) expect(code, `${url} contains ${marker}`).not.toContain(marker);
    }
  }

  expect([...thirdPartyScripts], 'third-party scripts before consent').toEqual([]);
  expect(analyticsRequests(requests)).toEqual([]);
  const cookies = (await page.context().cookies()).map((cookie) => cookie.name);
  expect(cookies.filter((name) => /^(AMP_|_ga)/.test(name))).toEqual([]);
});

test('Accept', async ({ page }, testInfo) => {
  const amplitude = await captureAmplitude(page);
  const ga = await captureGa(page);
  await installApiStub(page);
  await page.goto(`${PILOT}?ref=K7M2QX&utm_source=x`);
  await expect(banner(page)).toBeVisible();
  await page.evaluate(() => ((window as unknown as Record<string, unknown>).e2eSamePage = true));

  await banner(page).locator('[data-consent="accept"]').click();

  await expect(banner(page)).toBeHidden();
  await expect
    .poll(() => amplitude.events().filter((event) => event.event_type === '[Amplitude] Page Viewed').map((event) => event.event_properties['[Amplitude] Page Path']))
    .toEqual([PILOT]);
  await expect.poll(() => ga.hits().filter((hit) => hit.url.includes('en=page_view')).length).toBe(1);
  expect(ga.scripts()).toEqual(['https://www.googletagmanager.com/gtag/js?id=G-VNMLWF0XZG']);
  // Consent Mode is granted first, then GA4 and the Ads account are configured, once each.
  expect(await consentCommands(page)).toEqual([
    ['consent', 'default', { ...DENIED, wait_for_update: 500 }],
    ['set', 'ads_data_redaction', true],
    ['consent', 'update', GRANTED],
  ]);
  expect(await configuredIds(page)).toEqual(['G-VNMLWF0XZG', ADS_ID]);
  expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).e2eSamePage), 'no reload').toBe(true);
  const consent = (await page.context().cookies()).find((cookie) => cookie.name === 'nius_consent');
  expect(consent).toMatchObject({ value: 'accepted', domain: 'localhost', secure: false });

  // Recorded for the owner (finding L1): what the payloads carry of ?ref= and utm_*.
  const amplitudeText = amplitude.requests().map((r) => r.body).join('\n');
  const gaText = ga.hits().map((hit) => decodeURIComponent(hit.url)).join('\n');
  testInfo.annotations.push(
    { type: 'amplitude ref', description: String(amplitudeText.includes('ref=K7M2QX')) },
    { type: 'amplitude utm', description: String(amplitudeText.includes('utm_source')) },
    { type: 'ga ref', description: String(gaText.includes('ref=K7M2QX')) },
    { type: 'ga utm', description: String(gaText.includes('utm_source=x')) },
  );
});

test('Reject', async ({ page, context }, testInfo) => {
  // A visitor who earlier accepted on the old site: GA, Google Ads and Amplitude cookies on .nius.cz.
  const shared = { domain: '.nius.cz', path: '/', secure: true };
  await context.addCookies([
    { name: '_ga', value: 'GA1.1.111.222', ...shared },
    { name: '_ga_VNMLWF0XZG', value: 'GS1.1.333', ...shared },
    { name: '_gcl_au', value: '1.1.444', ...shared },
    { name: '_gcl_aw', value: 'GCL.555.e2e', ...shared },
    { name: 'AMP_test-ampli', value: 'e2e', ...shared },
  ]);
  await serveSiteAt(page, PRODUCTION);
  await installApiStub(page);
  const requests = recordRequests(page);
  await page.goto(`${PRODUCTION}${PILOT}`);
  await expect(banner(page)).toBeVisible();

  await banner(page).locator('[data-consent="reject"]').click();
  await expect(banner(page)).toBeHidden();
  expect((await context.cookies()).filter((cookie) => /^(_ga|_gcl_)/.test(cookie.name))).toEqual([]);
  expect((await consentCommands(page)).at(-1)).toEqual(['consent', 'update', DENIED]);
  expect(await configuredIds(page)).toEqual([]);

  for (const next of ['?page=2', '?page=3', '?page=4']) {
    await page.goto(`${PRODUCTION}${PILOT}${next}`);
    await page.waitForLoadState('networkidle');
    await expect(banner(page)).toBeHidden();
    expect(await gaDisabled(page)).toBe(true);
  }
  expect(analyticsRequests(requests)).toEqual([]);
  const cookies = await context.cookies();
  expect(cookies.find((cookie) => cookie.name === 'nius_consent')).toMatchObject({
    value: 'rejected',
    domain: '.nius.cz',
    secure: true,
  });
  // Recorded for the owner (finding L2): what is left of Amplitude after Reject.
  testInfo.annotations.push({
    type: 'AMP cookies after Reject',
    description: cookies.filter((cookie) => cookie.name.startsWith('AMP_')).map((c) => `${c.name} (${c.domain})`).join(', ') || 'none',
  });
});

test('Consent given in the app', async ({ page, context }) => {
  await context.addCookies([{ name: 'nius_consent', value: 'accepted', domain: '.nius.cz', path: '/', secure: true }]);
  await serveSiteAt(page, PRODUCTION);
  const amplitude = await captureAmplitude(page);
  const ga = await captureGa(page);
  await installApiStub(page);

  await page.goto(`${PRODUCTION}${PILOT}`);

  await expect(banner(page)).toBeHidden();
  await expect.poll(() => amplitude.events().map((event) => event.event_type)).toContain('[Amplitude] Page Viewed');
  await expect.poll(() => ga.hits().filter((hit) => hit.url.includes('en=page_view')).length).toBe(1);
  expect((await consentCommands(page)).slice(2)).toEqual([['consent', 'update', GRANTED]]);
  expect(await configuredIds(page)).toEqual(['G-VNMLWF0XZG', ADS_ID]);
  // Amplitude keeps its device id on .nius.cz, shared with the app.
  await expect
    .poll(async () => (await context.cookies()).filter((c) => c.name.startsWith('AMP_')).map((c) => c.domain))
    .toContain('.nius.cz');
});

test('Consent stored by the old site', async ({ page, context }) => {
  const amplitude = await captureAmplitude(page);
  const ga = await captureGa(page);
  await installApiStub(page);
  const requests = recordRequests(page);

  for (const value of ['accepted', 'rejected'] as const) {
    // Only the old site's localStorage record, no cookie. robots.txt runs none of the site's
    // code, so nothing migrates the record or sends analytics before the page under test.
    await page.goto('/robots.txt');
    await page.evaluate((stored) => {
      localStorage.clear();
      localStorage.setItem('nius-cookie-consent', stored);
    }, value);
    await context.clearCookies();
    const before = { requests: requests.length, events: amplitude.events().length };

    await page.goto(PILOT);
    await page.waitForLoadState('networkidle');

    await expect(banner(page), value).toBeHidden();
    const consent = (await context.cookies()).find((cookie) => cookie.name === 'nius_consent');
    expect(consent, value).toMatchObject({ value, domain: 'localhost' });
    if (value === 'accepted') {
      await expect.poll(() => amplitude.events().slice(before.events).map((e) => e.event_type)).toContain('[Amplitude] Page Viewed');
      expect(ga.scripts()).toHaveLength(1);
    } else {
      expect(analyticsRequests(requests.slice(before.requests))).toEqual([]);
      expect(await gaDisabled(page)).toBe(true);
    }
  }
});

test('Preview address', async ({ page, context }) => {
  await installApiStub(page);
  const requests = recordRequests(page);
  await page.goto(`${E2E_ORIGIN_IP}${PILOT}`);
  await banner(page).locator('[data-consent="reject"]').click();
  await expect(banner(page)).toBeHidden();

  await page.goto(`${E2E_ORIGIN_IP}${PILOT}?page=2`);
  await page.waitForLoadState('networkidle');

  await expect(banner(page)).toBeHidden();
  expect(await context.cookies()).toEqual([
    expect.objectContaining({ name: 'nius_consent', value: 'rejected', domain: '127.0.0.1', secure: false }),
  ]);
  expect(analyticsRequests(requests)).toEqual([]);
});

test('Banner texts in the page language', async ({ page }) => {
  await installApiStub(page);
  for (const { path, label, accept, reject, privacy } of [
    { path: PILOT, label: 'Souhlas s cookies', accept: 'Souhlasím', reject: 'Odmítnout', privacy: '/privacy/' },
    { path: '/en/privacy/', label: 'Cookie consent', accept: 'Accept', reject: 'Reject', privacy: '/en/privacy/' },
  ]) {
    await page.goto(path);
    const dialog = page.getByRole('dialog', { name: label });
    await expect(dialog, path).toBeVisible();
    await expect(dialog.getByRole('button', { name: accept, exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: reject, exact: true })).toBeVisible();
    await expect(dialog.locator('a')).toHaveAttribute('href', privacy);
  }
});

// The footer's own "Cookie settings" control (the banner delegates the click).
async function cookieSettingsControl(page: Page) {
  const control = page.locator('footer [data-cookie-settings]');
  await expect(control).toHaveText(cs.footerNew.cookieSettings);
  return control;
}

test('Cookie settings: Reject after an earlier Accept', async ({ page, context }) => {
  await context.addCookies([{ name: 'nius_consent', value: 'accepted', url: E2E_ORIGIN }]);
  const amplitude = await captureAmplitude(page);
  const ga = await captureGa(page);
  await installApiStub(page);
  await page.goto(PILOT);
  await expect.poll(() => ga.scripts()).toHaveLength(1);
  await expect(banner(page)).toBeHidden();

  await (await cookieSettingsControl(page)).click();
  await expect(banner(page)).toBeVisible();
  await banner(page).locator('[data-consent="reject"]').click();

  await expect(banner(page)).toBeHidden();
  expect((await context.cookies()).find((cookie) => cookie.name === 'nius_consent')).toMatchObject({ value: 'rejected' });
  expect((await consentCommands(page)).slice(2)).toEqual([
    ['consent', 'update', GRANTED],
    ['consent', 'update', DENIED],
  ]);
  expect(await gaDisabled(page)).toBe(true);

  // After the refusal a phone click reaches neither Google nor Amplitude.
  const before = { events: (await dataLayer(page)).length, amplitude: amplitude.events().length };
  await page.locator('footer a[href^="tel:"]').click();
  await page.waitForTimeout(1500);
  expect((await dataLayer(page)).slice(before.events)).toEqual([]);
  expect(amplitude.events().slice(before.amplitude).map((event) => event.event_type)).not.toContain('cta_clicked');

  // The next page load grants nothing and loads no tag.
  const requests = recordRequests(page);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(banner(page)).toBeHidden();
  expect(await consentCommands(page)).toHaveLength(2);
  expect(analyticsRequests(requests)).toEqual([]);
});

test('Cookie settings: Accept after an earlier Reject', async ({ page, context }) => {
  await context.addCookies([{ name: 'nius_consent', value: 'rejected', url: E2E_ORIGIN }]);
  const ga = await captureGa(page);
  await captureAmplitude(page);
  await installApiStub(page);
  await page.goto(PILOT);
  await page.waitForLoadState('networkidle');
  expect(ga.scripts()).toEqual([]);

  await (await cookieSettingsControl(page)).click();
  await banner(page).locator('[data-consent="accept"]').click();

  await expect(banner(page)).toBeHidden();
  expect((await context.cookies()).find((cookie) => cookie.name === 'nius_consent')).toMatchObject({ value: 'accepted' });
  await expect.poll(() => ga.hits().filter((hit) => hit.url.includes('en=page_view')).length).toBe(1);
  expect(ga.scripts()).toHaveLength(1);
  expect(await gaDisabled(page)).toBe(false);
  expect(await configuredIds(page)).toEqual(['G-VNMLWF0XZG', ADS_ID]);
});

test('Banner while the order form is open', async ({ page, context }) => {
  await installApiStub(page);
  const requests = recordRequests(page);
  await page.goto(PILOT);
  await expect(banner(page)).toBeVisible();

  await page.locator('[data-open-cart="header"]').click();
  const form = page.getByRole('dialog', { name: cs.onboarding.dialogTitle });
  await expect(form).toBeVisible();
  await expect(banner(page)).toBeHidden();

  await page.keyboard.press('Escape');
  await expect(form).toBeHidden();
  await expect(banner(page)).toBeVisible();
  // The choice is still pending: nothing stored, nothing loaded.
  expect((await context.cookies()).find((cookie) => cookie.name === 'nius_consent')).toBeUndefined();
  expect(analyticsRequests(requests)).toEqual([]);
});
