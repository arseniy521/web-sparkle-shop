import { devices, type Page } from '@playwright/test';
import { captureAmplitude, type AmplitudeCapture } from '../fixtures/amplitude.ts';
import { installApiStub } from '../fixtures/api-stub.ts';
import { captureGa } from '../fixtures/google.ts';
import { expect, serveSiteAt, test } from '../fixtures/network-guard.ts';
import { E2E_ORIGIN } from '../fixtures/servers.ts';
import { PILOT } from '../fixtures/pilot.ts';

const PRODUCTION = 'https://www.nius.cz';

const events = (amplitude: AmplitudeCapture, type: string) =>
  amplitude.events().filter((event) => event.event_type === type).map((event) => event.event_properties);

async function stubApp(page: Page) {
  await page.route('https://app.nius.cz/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<title>App stub</title>' }),
  );
}

test.describe('on a phone', () => {
  const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['Pixel 7'];
  test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch });

  test('Mobile menu on a slow connection', async ({ page }) => {
    await page.context().addCookies([{ name: 'nius_consent', value: 'rejected', url: E2E_ORIGIN }]);
    await installApiStub(page);
    // Only the HTML (with its inline scripts) and the styles arrive; no script file does.
    const aborted: string[] = [];
    await page.route('**/_astro/*.js', (route) => {
      aborted.push(route.request().url());
      return route.abort('timedout');
    });
    await page.goto(PILOT);
    expect(aborted.length, 'the page asked for its script files').toBeGreaterThan(0);

    const toggle = page.locator('[data-menu-toggle]');
    const menu = page.locator('[data-mobile-menu]');
    await expect(menu).toBeHidden();
    await toggle.tap();
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.tap();
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test('Account link for an anonymous visitor', async ({ page, context }) => {
  await context.addCookies([{ name: 'nius_consent', value: 'accepted', domain: '.nius.cz', path: '/', secure: true }]);
  const amplitude = await captureAmplitude(page);
  await captureGa(page);
  await serveSiteAt(page, PRODUCTION);
  await installApiStub(page);
  await stubApp(page);
  await page.goto(`${PRODUCTION}${PILOT}`);

  const link = page.locator('[data-account-link="header"]');
  const login = `https://app.nius.cz/login?returnTo=${encodeURIComponent(`${PRODUCTION}${PILOT}`)}`;
  await expect(link).toHaveAttribute('href', login);
  await expect(link).not.toHaveAttribute('aria-disabled');
  await link.click();

  await expect(page).toHaveURL(login);
  await expect
    .poll(() => events(amplitude, 'cta_clicked'))
    .toContainEqual(expect.objectContaining({ cta: 'account', source: 'header', authenticated: false }));
});

test('Return address from another origin', async ({ page }) => {
  await page.context().addCookies([{ name: 'nius_consent', value: 'rejected', url: E2E_ORIGIN }]);
  await installApiStub(page);
  await page.goto(PILOT);

  // The header and the mobile menu each have one.
  await expect(page.locator('[data-account-link]')).toHaveCount(2);
  for (const link of await page.locator('[data-account-link]').all()) {
    await expect(link).not.toHaveAttribute('aria-disabled');
    await expect(link).toHaveAttribute('href', 'https://app.nius.cz/login');
  }
});

test('Language switch', async ({ page }) => {
  await page.context().addCookies([{ name: 'nius_consent', value: 'accepted', url: E2E_ORIGIN }]);
  const amplitude = await captureAmplitude(page);
  await captureGa(page);
  await installApiStub(page);
  await page.goto(PILOT);

  await page.locator('[data-dropdown]').filter({ has: page.locator('[data-lang-switch]') }).locator('[data-dropdown-trigger]').click();
  await page.locator('[data-lang-switch="header"][data-lang="en"]').click();

  // The pilot page exists only in Czech, so the switch leads to the English home page.
  await expect(page).toHaveURL('/en/');
  await expect
    .poll(() => events(amplitude, 'language_changed'))
    .toEqual([expect.objectContaining({ from_language: 'cs', to_language: 'en', source: 'header', language: 'cs' })]);
});
