import type { Page, Request } from '@playwright/test';
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
  expect(await page.evaluate(() => (window.dataLayer ?? []).map((args) => [...(args as unknown[])].slice(0, 2)))).toContainEqual([
    'config',
    'G-VNMLWF0XZG',
  ]);
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
  // A visitor who earlier accepted on the old site: GA and Amplitude cookies on .nius.cz.
  const shared = { domain: '.nius.cz', path: '/', secure: true };
  await context.addCookies([
    { name: '_ga', value: 'GA1.1.111.222', ...shared },
    { name: '_ga_VNMLWF0XZG', value: 'GS1.1.333', ...shared },
    { name: 'AMP_test-ampli', value: 'e2e', ...shared },
  ]);
  await serveSiteAt(page, PRODUCTION);
  await installApiStub(page);
  const requests = recordRequests(page);
  await page.goto(`${PRODUCTION}${PILOT}`);
  await expect(banner(page)).toBeVisible();

  await banner(page).locator('[data-consent="reject"]').click();
  await expect(banner(page)).toBeHidden();
  expect((await context.cookies()).filter((cookie) => cookie.name.startsWith('_ga'))).toEqual([]);

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
