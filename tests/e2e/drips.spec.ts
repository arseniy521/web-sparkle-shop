import type { Page } from '@playwright/test';
import cs from '../../src/i18n/locales/cs.json' with { type: 'json' };
import stubData from '../fixtures/api/stub-data.json' with { type: 'json' };
import { installApiStub } from '../fixtures/api-stub.ts';
import { expect, test } from '../fixtures/network-guard.ts';
import { E2E_ORIGIN } from '../fixtures/servers.ts';
import { pageUrl } from '../../src/routes/urls.ts';

const DRIPS = pageUrl('iv-drips', 'cs');
const REHYDRATION = pageUrl('rehydration-drip', 'cs');
const BLOG_EN = pageUrl('blog', 'en');
// The page since PR #14 of the old site: the shared catalog of the home page instead of its own
// list of drips, then a text guide of the nine drips in three groups; eight FAQ items.
const [LITE, HYDRATE] = stubData.services;
const FAQ_COUNT = 8;
const GUIDE_DRIPS = 9;
const PHONE = { width: 390, height: 844 };

const card = (page: Page, code = LITE.code) =>
  page.locator(`nius-menu[section="menu"] [data-cart-control][data-code="${code}"]`);
const dialog = (page: Page) => page.getByRole('dialog', { name: cs.onboarding.dialogTitle });
// The hero and closing-call buttons; the drip guide's buttons carry a service code.
const booking = (page: Page) => page.locator('main a[data-open-form]:not([data-service-code])');
const guideDrip = (page: Page, code = LITE.code) => page.locator(`#drip-guide [data-drip="${code}"]`);

/** Whether the element's box is inside the viewport (a bar slid out below it is not). */
const inViewport = (page: Page, selector: string) =>
  page.evaluate((s) => {
    const r = document.querySelector(s)!.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }, selector);

async function open(page: Page, path = DRIPS) {
  await page.context().addCookies([{ name: 'nius_consent', value: 'rejected', url: E2E_ORIGIN }]);
  await installApiStub(page);
  await page.goto(path);
}

test('The drips page shows the shared service menu', async ({ page }) => {
  await open(page);

  // The catalog of the home page, with the services the API answers ...
  await expect(card(page)).toBeVisible();
  await expect(card(page, HYDRATE.code)).toBeVisible();
  // ... under the page's own heading; the section holds the catalog, not the page's old cards
  // with their own WhatsApp buttons.
  await expect(page.locator('#menu-intro h2')).toHaveText(cs.ivDripTherapy.menu.title);
  await expect(page.locator('#menu nius-menu[section="menu"]')).toHaveCount(1);
  await expect(page.locator('#menu a[href^="https://wa.me/"]')).toHaveCount(0);

  // A service is added on this page as on the home page.
  await card(page).locator('[data-quick-add]').click();
  await expect(page.locator('[data-open-cart="header"] [data-cart-count]')).toHaveText('1');
});

test('Booking buttons of the drips page lead to the menu, and to the order form with a cart', async ({ page }) => {
  await open(page);
  await expect(page.locator('main a[href*="setmore.com"]')).toHaveCount(0);
  await expect(booking(page)).toHaveCount(2);
  for (const link of await booking(page).all()) {
    await expect(link).toHaveAttribute('href', 'https://app.nius.cz/form');
    await expect(link).toHaveAttribute('data-menu-href', `${pageUrl('home', 'cs')}#menu`);
    await expect(link).not.toHaveAttribute('target', /.+/);
  }
  await expect(booking(page).first()).toHaveAttribute('data-open-form', 'hero');
  await expect(booking(page).last()).toHaveAttribute('data-open-form', 'page_content');

  // Empty cart: the button scrolls to the menu of this page instead of opening an empty form.
  expect(await inViewport(page, '#menu')).toBe(false);
  await booking(page).first().click();
  await expect.poll(() => inViewport(page, '#menu')).toBe(true);
  await expect(dialog(page)).toHaveCount(0);
  await expect(page).toHaveURL(DRIPS);

  // With a service in the cart the same button opens the order form.
  await card(page).locator('[data-quick-add]').click();
  await booking(page).first().click();
  await expect(dialog(page)).toBeVisible();
});

test('The drip guide books the chosen drip', async ({ page }) => {
  await open(page);
  const guide = page.locator('#drip-guide');
  await expect(guide.locator('h2')).toHaveText(cs.ivDripTherapy.menu.guideTitle);
  await expect(guide.locator('[data-drip-group]')).toHaveCount(3);
  await expect(guide.locator('[data-drip]')).toHaveCount(GUIDE_DRIPS);
  await expect(guideDrip(page)).toContainText(cs.ivDripTherapy.menu.categories.immunity.items.immunityLite.short);
  await expect(guideDrip(page)).toContainText(/2\s900\sKč/);

  // Each drip's button orders that drip, even with an empty cart.
  const button = guideDrip(page).locator('a[data-open-form]');
  await expect(button).toHaveAttribute('data-service-code', LITE.code);
  await button.click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).toContainText(cs.serviceCatalog.immunity_lite.title);
  await expect(page.locator('[data-open-cart="header"] [data-cart-count]')).toHaveText('1');
});

test('A booking button on a page without the menu goes to the home page menu', async ({ page }) => {
  await open(page, BLOG_EN);
  await expect(page.locator('#menu')).toHaveCount(0);

  await booking(page).first().click();

  await expect(page).toHaveURL(`${pageUrl('home', 'en')}#menu`);
  await expect.poll(() => inViewport(page, '#menu')).toBe(true);
  await expect(dialog(page)).toHaveCount(0);
});

test.describe('on a phone', () => {
  test.use({ viewport: PHONE });

  test('Bottom bar of the drips page', async ({ page }) => {
    await open(page);
    const bar = page.locator('[data-mobile-sticky]');
    const button = page.locator('[data-sticky-main]');

    // The bar replaces the floating WhatsApp button and stays below the screen over the hero.
    await expect(page.locator('[data-floating-whatsapp]')).toHaveCount(0);
    await expect(bar).toBeAttached();
    expect(await inViewport(page, '[data-mobile-sticky]')).toBe(false);

    // Past the hero and the menu it offers to choose a service and scrolls back to the menu.
    await page.evaluate(() => document.querySelector('[data-faq]')!.scrollIntoView({ block: 'start' }));
    await expect.poll(() => inViewport(page, '[data-mobile-sticky]')).toBe(true);
    await expect(button).toHaveText(cs.heroNew.ctaPrimary);
    await button.click();
    await expect.poll(() => inViewport(page, '#menu')).toBe(true);
    await expect(dialog(page)).toHaveCount(0);
  });
});

test('Floating WhatsApp button follows the scroll', async ({ page }) => {
  // The rehydration page keeps the floating button; the drips page has the bottom bar instead.
  await open(page, REHYDRATION);
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

  test('the page without JavaScript keeps the menu heading, the price list, the drip guide and every FAQ answer', async ({ page }) => {
    await open(page);

    // The catalog itself needs JavaScript; the HTML keeps the heading and the text list of
    // services and prices that MenuSection.astro renders for search engines.
    await expect(page.locator('#menu-intro h2')).toBeVisible();
    await expect(page.locator('#menu li')).toHaveCount(14);
    await expect(page.locator('#menu li').first()).toContainText('Immunity Lite');

    // The guide is visible text: name, price, description and composition of every drip.
    const drips = page.locator('#drip-guide [data-drip]');
    await expect(drips).toHaveCount(GUIDE_DRIPS);
    for (const drip of await drips.all()) {
      await expect(drip).toBeVisible();
      await expect(drip.locator('h4')).not.toHaveText('');
      await expect(drip.locator('li').first()).not.toHaveText('');
    }

    const answers = page.locator('[data-faq] [data-faq-item] [data-faq-answer]');
    await expect(answers).toHaveCount(FAQ_COUNT);
    for (const answer of await answers.all()) {
      await expect(answer).toBeVisible();
      await expect(answer).not.toHaveText('');
    }
  });
});
