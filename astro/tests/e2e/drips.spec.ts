import type { Page } from '@playwright/test';
import { installApiStub } from '../fixtures/api-stub.ts';
import { expect, test } from '../fixtures/network-guard.ts';
import { E2E_ORIGIN } from '../fixtures/servers.ts';
import { pageUrl } from '../../src/routes/urls.ts';

const DRIPS = pageUrl('iv-drips', 'cs');
const CATEGORIES = ['immunity', 'energy', 'hydration', 'specialized'];
// Drips per category on the page: 4 + 3 + 3 + 5.
const DRIP_COUNT = 15;
const FAQ_COUNT = 10;

const group = (page: Page, category: string) => page.locator(`[data-category="${category}"]`);
const filter = (page: Page, key: string) => page.locator(`[data-filter="${key}"]`);
const dripCards = (page: Page) => page.locator('[data-category] a[href^="https://wa.me/"]');

async function open(page: Page) {
  await page.context().addCookies([{ name: 'nius_consent', value: 'rejected', url: E2E_ORIGIN }]);
  await installApiStub(page);
  await page.goto(DRIPS);
}

test('Drip filter', async ({ page }) => {
  await open(page);
  await expect(dripCards(page).filter({ visible: true })).toHaveCount(DRIP_COUNT);

  await filter(page, 'energy').click();

  // Only the drips of the chosen category are shown ...
  await expect(group(page, 'energy')).toBeVisible();
  await expect(dripCards(page).filter({ visible: true })).toHaveCount(3);
  await expect(filter(page, 'energy')).toHaveAttribute('aria-pressed', 'true');
  await expect(filter(page, 'all')).toHaveAttribute('aria-pressed', 'false');
  // ... the others are hidden but stay in the HTML.
  for (const category of CATEGORIES.filter((c) => c !== 'energy')) {
    await expect(group(page, category)).toBeHidden();
    await expect(group(page, category)).toHaveCount(1);
  }
  await expect(dripCards(page)).toHaveCount(DRIP_COUNT);

  await filter(page, 'all').click();
  for (const category of CATEGORIES) await expect(group(page, category)).toBeVisible();
  await expect(dripCards(page).filter({ visible: true })).toHaveCount(DRIP_COUNT);
});

test('Floating WhatsApp button follows the scroll', async ({ page }) => {
  await open(page);
  const button = page.locator('[data-floating-whatsapp]');

  // Playwright counts a transparent element as visible, so the visitor's view is the opacity
  // (the button fades in and out) and the clicks passing through it.
  await expect(button).toHaveCSS('opacity', '0');
  await expect(button).toHaveCSS('pointer-events', 'none');
  // Shown once the visitor has scrolled down ...
  await page.mouse.wheel(0, 1500);
  await expect(button).toHaveCSS('opacity', '1');
  await expect(button).toHaveCSS('pointer-events', 'auto');
  await expect(button).toBeInViewport();
  // ... and hidden again back at the top.
  await page.mouse.wheel(0, -5000);
  await expect(button).toHaveCSS('opacity', '0');
  await expect(button).toHaveCSS('pointer-events', 'none');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the page without JavaScript shows every drip and every FAQ answer', async ({ page }) => {
    await open(page);

    for (const category of CATEGORIES) await expect(group(page, category)).toBeVisible();
    await expect(dripCards(page).filter({ visible: true })).toHaveCount(DRIP_COUNT);

    const answers = page.locator('[data-faq] [data-faq-item] [data-faq-answer]');
    await expect(answers).toHaveCount(FAQ_COUNT);
    for (const answer of await answers.all()) {
      await expect(answer).toBeVisible();
      await expect(answer).not.toHaveText('');
    }
  });
});
