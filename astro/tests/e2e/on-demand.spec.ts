import type { Page } from '@playwright/test';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import stubData from '../../preview/stub-data.json' with { type: 'json' };
import { installApiStub } from '../fixtures/api-stub.ts';
import { expect, test } from '../fixtures/network-guard.ts';
import { E2E_ORIGIN } from '../fixtures/servers.ts';
import { PILOT } from '../fixtures/pilot.ts';

// Loaded only for the form: its entry chunk, React DOM (client.*), the Google sign-in chunk and its texts.
const FORM_CODE = /\/_astro\/(mount|client|GoogleLoginAction|cs|en|ru|uk)\.[\w-]+\.js$/;

function scriptRequests(page: Page) {
  const urls: Array<{ url: string; done?: number }> = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script') urls.push({ url: request.url() });
  });
  page.on('requestfinished', (request) => {
    const entry = urls.find((u) => u.url === request.url() && u.done === undefined);
    if (entry) entry.done = Date.now();
  });
  return urls;
}

test('Visitor who only reads', async ({ page }) => {
  await page.context().addCookies([{ name: 'nius_consent', value: 'rejected', url: E2E_ORIGIN }]);
  await installApiStub(page);
  const scripts = scriptRequests(page);
  await page.goto(PILOT);

  // Scroll to the bottom with the wheel, the pointer resting away from the header.
  await page.mouse.move(640, 400);
  for (let i = 0; i < 20; i++) await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY + window.innerHeight >= document.body.scrollHeight - 2)).toBe(true);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  expect(scripts.length, 'the page loaded its own code').toBeGreaterThan(0);
  expect(scripts.map((s) => s.url).filter((url) => FORM_CODE.test(url))).toEqual([]);
});

test('Returning to a page with a cart', async ({ page }) => {
  await page.context().addCookies([{ name: 'nius_consent', value: 'rejected', url: E2E_ORIGIN }]);
  await installApiStub(page);
  await page.addInitScript((code) => {
    sessionStorage.setItem('nius_onboarding_draft_v2', JSON.stringify({ codes: [code], data: {}, savedAt: Date.now() }));
  }, stubData.services[0].code);
  const scripts = scriptRequests(page);
  await page.goto(PILOT);

  // Without any interaction the form code is fetched in the background...
  await expect.poll(() => scripts.find((s) => /\/_astro\/mount\./.test(s.url))?.done).toBeDefined();
  const loaded = scripts.length;

  // ...so opening the form needs no further code.
  await page.locator('[data-open-cart="header"]').click();
  await expect(page.getByRole('dialog', { name: cs.onboarding.dialogTitle })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText(cs.serviceCatalog.immunity_lite.title);
  expect(scripts.slice(loaded).map((s) => s.url).filter((url) => FORM_CODE.test(url))).toEqual([]);
});
