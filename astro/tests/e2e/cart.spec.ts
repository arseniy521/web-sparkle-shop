import type { Page } from '@playwright/test';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import stubData from '../../preview/stub-data.json' with { type: 'json' };
import { VISITOR } from '../fixtures/amplitude.ts';
import { installApiStub } from '../fixtures/api-stub.ts';
import { expect, test } from '../fixtures/network-guard.ts';
import { E2E_ORIGIN } from '../fixtures/servers.ts';

const PILOT = '/sestricka-praha-1/';
const DRAFT_KEY = 'nius_onboarding_draft_v2';
const LEGACY_KEY = 'nius_onboarding_draft_v1';
const HOUR = 60 * 60 * 1000;
const [LITE, HYDRATE] = stubData.services;

// What the old site's onboardingPersist.ts stores: codes, form data and a timestamp.
function oldSiteDraft(codes: string[], savedAt: number, data: Partial<typeof EMPTY_DATA> = {}) {
  return JSON.stringify({ codes, data: { ...EMPTY_DATA, ...data }, savedAt });
}
const EMPTY_DATA = {
  phone: '',
  serviceCode: null,
  address: '',
  addressGeo: null,
  addressTo: '',
  addressToGeo: null,
  addressFloor: '',
  addressIntercom: '',
  desiredTiming: null,
  desiredDate: null,
  paymentPreference: null,
  patientNote: '',
  participantCount: 1,
};

async function prepare(page: Page) {
  await page.context().addCookies([{ name: 'nius_consent', value: 'rejected', url: E2E_ORIGIN }]);
  await installApiStub(page);
}

// Seeds browser storage once per tab, before the site's code runs.
async function seed(page: Page, storage: 'session' | 'local', key: string, value: string) {
  await page.addInitScript(
    ([kind, k, v]) => {
      if (sessionStorage.getItem('e2e-seeded')) return;
      sessionStorage.setItem('e2e-seeded', '1');
      (kind === 'session' ? sessionStorage : localStorage).setItem(k, v);
    },
    [storage, key, value] as const,
  );
}

const counter = (page: Page) => page.locator('[data-open-cart="header"] [data-cart-count]');
const dialog = (page: Page) => page.getByRole('dialog', { name: cs.onboarding.dialogTitle });

async function expectFormWith(page: Page, titles: string[]) {
  await page.locator('[data-open-cart="header"]').click();
  await expect(dialog(page)).toBeVisible();
  for (const title of titles) await expect(dialog(page)).toContainText(title);
  await expect(dialog(page).getByText(cs.onboarding.emptyCart.title)).toHaveCount(0);
}

test('Navigating with a filled cart', async ({ page }) => {
  await prepare(page);
  await page.goto(PILOT);
  await expect(counter(page)).toBeHidden();

  // Two services added the way the catalogue (public/js/nius-menu.js, quick add) adds them.
  await page.evaluate((codes) => {
    for (const code of codes) {
      window.dispatchEvent(
        new CustomEvent('nius:add-to-cart', {
          detail: { code, source: 'service_catalog', boosterCodes: [] },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }, [LITE.code, HYDRATE.code]);
  await expect(counter(page)).toHaveText('2');

  // A later page in the same tab gets the cart from the session.
  await page.goto(`${PILOT}?next=1`);
  await expect(counter(page)).toBeVisible();
  await expect(counter(page)).toHaveText('2');
  await expectFormWith(page, [cs.serviceCatalog.immunity_lite.title, cs.serviceCatalog.pure_hydrate.title]);
});

test('Cart filled on the old site', async ({ context }) => {
  // The current old site keeps the draft in sessionStorage, its earlier versions in localStorage;
  // each variant runs in its own tab.
  for (const storage of ['session', 'local'] as const) {
    const page = await context.newPage();
    await prepare(page);
    await seed(page, storage, storage === 'session' ? DRAFT_KEY : LEGACY_KEY, oldSiteDraft([LITE.code], Date.now()));
    await page.goto(PILOT);

    await expect(counter(page), `${storage}Storage draft`).toHaveText('1');
    await expect(counter(page)).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), LEGACY_KEY)).toBeNull();
    await expectFormWith(page, [cs.serviceCatalog.immunity_lite.title]);
    await page.close();
  }
});

test('New tab or expired draft', async ({ page }) => {
  const visitorData = { phone: VISITOR.phone, address: VISITOR.address, patientNote: VISITOR.note };
  const expectNoDraft = async (tab: Page) => {
    await expect(counter(tab)).toBeHidden();
    const stored = await tab.evaluate((key) => sessionStorage.getItem(key) ?? '', DRAFT_KEY);
    for (const value of Object.values(visitorData)) expect(stored).not.toContain(value);
    await tab.locator('[data-open-cart="header"]').click();
    await expect(dialog(tab).getByText(cs.onboarding.emptyCart.title)).toBeVisible();
    for (const value of Object.values(visitorData)) await expect(tab.locator('body')).not.toContainText(value);
  };

  // A draft of the same tab, saved 25 hours ago.
  await prepare(page);
  await seed(page, 'session', DRAFT_KEY, oldSiteDraft([LITE.code], Date.now() - 25 * HOUR, visitorData));
  await page.goto(PILOT);
  await expectNoDraft(page);

  // A fresh draft in one tab is not visible in a new tab.
  const first = await page.context().newPage();
  await installApiStub(first);
  await first.addInitScript(
    ([key, value]) => sessionStorage.setItem(key, value),
    [DRAFT_KEY, oldSiteDraft([LITE.code], Date.now(), visitorData)] as const,
  );
  await first.goto(PILOT);
  await expect(counter(first)).toHaveText('1');
  const second = await page.context().newPage();
  await installApiStub(second);
  await second.goto(PILOT);
  await expectNoDraft(second);
});
