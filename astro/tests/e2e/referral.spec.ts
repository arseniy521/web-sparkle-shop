import type { BrowserContext, Page } from '@playwright/test';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import stubData from '../../preview/stub-data.json' with { type: 'json' };
import { VISITOR } from '../fixtures/amplitude.ts';
import { installApiStub } from '../fixtures/api-stub.ts';
import { expect, test } from '../fixtures/network-guard.ts';
import { E2E_ORIGIN } from '../fixtures/servers.ts';
import { PILOT } from '../fixtures/pilot.ts';

// The spec's example: the visitor arrives with ?ref=k7m2qx (lower case) and the site keeps the code
// in the format ^[A-HJKMNP-Z2-9]{6}$, upper case.
const CODE = 'K7M2QX';
const THIRTY_DAYS = 2_592_000;

// The partner code is kept whatever the analytics choice: the visitor rejected analytics.
async function prepare(page: Page) {
  await page.context().addCookies([{ name: 'nius_consent', value: 'rejected', url: E2E_ORIGIN }]);
  await installApiStub(page);
}

const referralCookie = async (context: BrowserContext) =>
  (await context.cookies()).find((cookie) => cookie.name === 'nius_ref');

test('Entry by a partner link', async ({ page }) => {
  await prepare(page);
  const formRequests: string[] = [];
  page.on('request', (request) => {
    if (/\/_astro\/mount\./.test(request.url())) formRequests.push(request.url());
  });
  const dialogs: string[] = [];
  page.on('dialog', (dialog) => {
    dialogs.push(dialog.message());
    void dialog.dismiss();
  });

  await page.goto(`${PILOT}?ref=${CODE.toLowerCase()}`);
  const enteredAt = Date.now() / 1000;
  await page.goto('/');

  const cookie = await referralCookie(page.context());
  expect(cookie).toMatchObject({ value: CODE, path: '/', sameSite: 'Lax' });
  expect(cookie!.expires).toBeGreaterThan(enteredAt + THIRTY_DAYS - 60);
  expect(cookie!.expires).toBeLessThan(enteredAt + THIRTY_DAYS + 60);
  expect(formRequests).toEqual([]);

  // A value that is not a partner code changes nothing.
  await page.goto(`${PILOT}?ref=${encodeURIComponent('<script>alert(1)</script>')}`);
  expect((await referralCookie(page.context()))?.value).toBe(CODE);
  await expect(page.locator('script:not([src]):not([type])').filter({ hasText: 'alert(1)' })).toHaveCount(0);
  expect(dialogs).toEqual([]);
});

test('Order after a partner visit', async ({ page, context }) => {
  await prepare(page);
  await page.goto(`${PILOT}?ref=${CODE.toLowerCase()}`);
  await page.close();
  // Still valid a week later.
  expect((await referralCookie(context))!.expires).toBeGreaterThan(Date.now() / 1000 + 7 * 86_400);

  // A later visit in a new tab, without ?ref=, with a filled draft.
  const later = await context.newPage();
  await installApiStub(later);
  await later.addInitScript(
    ([code, phone, address]) => {
      const data = {
        phone,
        serviceCode: null,
        address,
        addressGeo: null,
        addressTo: '',
        addressToGeo: null,
        addressFloor: '',
        addressIntercom: '',
        desiredTiming: 'ASAP',
        desiredDate: null,
        paymentPreference: null,
        patientNote: '',
        participantCount: 1,
      };
      sessionStorage.setItem('nius_onboarding_draft_v2', JSON.stringify({ codes: [code], data, savedAt: Date.now() }));
    },
    [stubData.services[0].code, VISITOR.phone.replace(/\s/g, ''), VISITOR.address] as const,
  );
  await later.goto(PILOT);
  const created = later.waitForRequest(
    (request) => request.method() === 'POST' && request.url().endsWith('/api/onboarding/order'),
  );
  await later.locator('[data-open-cart="header"]').click();
  await later.getByRole('dialog').getByRole('button', { name: cs.onboarding.finish }).click();

  expect((await created).postDataJSON()).toMatchObject({ referralCode: CODE });
  await expect(later.getByRole('dialog').getByText(cs.onboarding.final.title)).toBeVisible();
});
