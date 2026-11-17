import type { Page } from '@playwright/test';
import cs from '../../../src/i18n/locales/cs.json' with { type: 'json' };
import en from '../../../src/i18n/locales/en.json' with { type: 'json' };
import ru from '../../../src/i18n/locales/ru.json' with { type: 'json' };
import uk from '../../../src/i18n/locales/uk.json' with { type: 'json' };
import stubData from '../../preview/stub-data.json' with { type: 'json' };
import { captureAmplitude, events, type AmplitudeCapture } from '../fixtures/amplitude.ts';
import { installApiStub } from '../fixtures/api-stub.ts';
import { captureGa } from '../fixtures/google.ts';
import { expect, test } from '../fixtures/network-guard.ts';
import { E2E_ORIGIN } from '../fixtures/servers.ts';

// The home page: the catalog web component (public/js/nius-menu.js), the cart and the order form,
// the bottom bar on phones, the hero buttons, four languages and the HTML without JavaScript.
const HOME = '/';
const [LITE, HYDRATE] = stubData.services;
const LOCALES = { cs, en, ru, uk } as const;
const PATHS = { cs: '/', en: '/en/', ru: '/ru/', uk: '/uk/' } as const;
const PHONE = { width: 390, height: 844 };
// The form's entry chunk.
const FORM_ENTRY = /\/_astro\/mount\.[\w-]+\.js$/;

async function prepare(page: Page, consent: 'accepted' | 'rejected' = 'rejected'): Promise<AmplitudeCapture> {
  await page.context().addCookies([{ name: 'nius_consent', value: consent, url: E2E_ORIGIN }]);
  const amplitude = await captureAmplitude(page);
  // With consent the Google tag loads; the stand-in answers it.
  await captureGa(page);
  await installApiStub(page);
  // The service area map, the same lazy Google Maps frame as on the old page.
  await page.route('https://www.google.com/maps/**', (route) => route.fulfill({ contentType: 'text/html', body: '' }));
  return amplitude;
}

// Seeds the draft of the old and new site once per tab, before the site's code runs.
async function withCart(page: Page, codes: string[]) {
  await page.addInitScript((value) => {
    if (sessionStorage.getItem('e2e-seeded')) return;
    sessionStorage.setItem('e2e-seeded', '1');
    sessionStorage.setItem('nius_onboarding_draft_v2', JSON.stringify({ codes: value, data: {}, savedAt: Date.now() }));
  }, codes);
}

const card = (page: Page, code = LITE.code) =>
  page.locator(`nius-menu[section="menu"] [data-cart-control][data-code="${code}"]`);
const counter = (page: Page) => page.locator('[data-open-cart="header"] [data-cart-count]');
const dialog = (page: Page) => page.getByRole('dialog', { name: cs.onboarding.dialogTitle });
const bar = (page: Page) => page.locator('[data-mobile-sticky]');
const barButton = (page: Page) => page.locator('[data-sticky-main]');

/** Whether the element's box is inside the viewport (a sticky bar slid out below it is not). */
const inViewport = (page: Page, selector: string) =>
  page.evaluate((s) => {
    const r = document.querySelector(s)!.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }, selector);

async function scrollToSection(page: Page, selector: string) {
  await page.evaluate((s) => document.querySelector(s)!.scrollIntoView({ block: 'start' }), selector);
}

test('Stepper after adding a service', async ({ page }) => {
  const amplitude = await prepare(page, 'accepted');
  await page.goto(HOME);
  await expect(counter(page)).toBeHidden();

  await card(page).locator('[data-quick-add]').click();

  await expect(card(page).locator('.cart-stepper')).toBeVisible();
  await expect(card(page).locator('.cart-count')).toHaveText('1');
  await expect(card(page).locator('[data-quick-add]')).toHaveCount(0);
  await expect(counter(page)).toHaveText('1');
  await expect(page.locator('nius-menu[section="menu"]')).toHaveAttribute('cart-codes', JSON.stringify([LITE.code]));
  await expect
    .poll(() => events(amplitude, 'cart_service_added'))
    .toEqual([expect.objectContaining({ service_code: LITE.code, source: 'service_catalog', language: 'cs' })]);
  expect(events(amplitude, 'cta_clicked')).toEqual([
    expect.objectContaining({ cta: 'add_to_cart', source: 'service_catalog', service_code: LITE.code, page_path: HOME }),
  ]);
});

test('Quantity change', async ({ page }) => {
  const amplitude = await prepare(page, 'accepted');
  await page.goto(HOME);
  await card(page).locator('[data-quick-add]').click();
  await card(page).locator('[data-quantity-action="increase"]').click();
  await expect(card(page).locator('.cart-count')).toHaveText('2');
  await expect(counter(page)).toHaveText('2');

  await card(page).locator('[data-quantity-action="decrease"]').click();
  await expect(card(page).locator('.cart-count')).toHaveText('1');
  await expect(counter(page)).toHaveText('1');
  await card(page).locator('[data-quantity-action="remove"]').click();

  await expect(card(page).locator('[data-quick-add]')).toBeVisible();
  await expect(counter(page)).toBeHidden();
  await expect(page.locator('nius-menu[section="menu"]')).toHaveAttribute('cart-codes', '[]');
  await expect
    .poll(() => events(amplitude, 'cart_service_removed'))
    .toEqual([
      expect.objectContaining({ service_code: LITE.code, source: 'service_catalog' }),
      expect.objectContaining({ service_code: LITE.code, source: 'service_catalog' }),
    ]);
  await page.locator('[data-open-cart="header"]').click();
  await expect(dialog(page).getByText(cs.onboarding.emptyCart.title)).toBeVisible();
});

test('The catalog opens the order form with nius:open-cart', async ({ page }) => {
  const amplitude = await prepare(page, 'accepted');
  await page.goto(HOME);
  await card(page).locator('[data-quick-add]').click();
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent('nius:open-cart', { detail: { source: 'service_catalog' } })),
  );
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).toContainText(cs.serviceCatalog.immunity_lite.title);
  await expect
    .poll(() => events(amplitude, 'cta_clicked').filter((e) => e.cta === 'cart'))
    .toEqual([expect.objectContaining({ source: 'service_catalog', cart_items_count: 1 })]);
});

test('The hero button scrolls to the catalog and is tracked', async ({ page }) => {
  const amplitude = await prepare(page, 'accepted');
  await page.goto(HOME);
  await page.locator('#home a[href="#menu"]').click();
  await expect.poll(() => inViewport(page, '#menu')).toBe(true);
  await expect(page).toHaveURL(HOME);
  await expect
    .poll(() => events(amplitude, 'cta_clicked'))
    .toEqual([expect.objectContaining({ cta: 'choose_service', source: 'hero', page_path: HOME })]);
});

test.describe('on a phone', () => {
  test.use({ viewport: PHONE });

  test('Returning to a page with a cart', async ({ page }) => {
    await prepare(page);
    await withCart(page, [LITE.code, HYDRATE.code]);
    const entry: string[] = [];
    page.on('requestfinished', (request) => {
      if (FORM_ENTRY.test(request.url())) entry.push(request.url());
    });
    await page.goto(HOME);

    // The bar stays below the screen while the hero is in view.
    await expect(bar(page)).toBeAttached();
    expect(await inViewport(page, '[data-mobile-sticky]')).toBe(false);
    // Without any interaction the form code is fetched in the background, with the total.
    await expect.poll(() => entry.length).toBe(1);
    await scrollToSection(page, '#menu');
    await expect.poll(() => inViewport(page, '[data-mobile-sticky]')).toBe(true);
    await expect(barButton(page)).toBeVisible();
    await expect(barButton(page)).toContainText(`${cs.nav.cart} (2) →`);
    const total = (LITE.priceHalers + HYDRATE.priceHalers) / 100;
    await expect(barButton(page)).toContainText(
      new Intl.NumberFormat('cs', { style: 'currency', currency: 'CZK' }).format(total),
    );

    await barButton(page).click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page)).toContainText(cs.serviceCatalog.immunity_lite.title);
    await expect(dialog(page)).toContainText(cs.serviceCatalog.pure_hydrate.title);
    // The bar is not displayed over the open form; the form needed no further code.
    await expect(bar(page)).toBeHidden();
    expect(entry).toHaveLength(1);
  });

  test('With an empty cart the bottom bar leads to the catalog', async ({ page }) => {
    const amplitude = await prepare(page, 'accepted');
    await page.goto(HOME);
    await expect(barButton(page)).toHaveText(cs.heroNew.ctaPrimary);

    // Over the catalog an empty cart has nothing to offer; below it the bar offers the catalog.
    await scrollToSection(page, '#menu');
    await expect.poll(() => inViewport(page, '[data-mobile-sticky]')).toBe(true);
    await expect(barButton(page)).toBeHidden();
    await expect(bar(page).locator('a[href="https://wa.me/420773629123"]')).toBeVisible();
    await scrollToSection(page, '#how-it-works');
    await expect(barButton(page)).toBeVisible();

    await barButton(page).click();
    await expect.poll(() => inViewport(page, '#menu')).toBe(true);
    await expect(barButton(page)).toBeHidden();
    await expect
      .poll(() => events(amplitude, 'cta_clicked'))
      .toEqual([expect.objectContaining({ cta: 'choose_service', source: 'mobile_sticky' })]);
  });

  test('The bottom bar follows the cart filled in the catalog', async ({ page }) => {
    await prepare(page);
    await page.goto(HOME);
    await card(page).locator('[data-quick-add]').click();
    await expect.poll(() => inViewport(page, '[data-mobile-sticky]')).toBe(true);
    await expect(barButton(page)).toContainText(`${cs.nav.cart} (1) →`);
    await expect(barButton(page)).toContainText(
      new Intl.NumberFormat('cs', { style: 'currency', currency: 'CZK' }).format(LITE.priceHalers / 100),
    );
  });

  test('The first story photo is a WebP sized for the card', async ({ page }) => {
    await prepare(page);
    const photos: string[] = [];
    page.on('requestfinished', (request) => {
      if (request.resourceType() === 'image' && /\/(photos|_astro)\/hotel-group/.test(request.url())) photos.push(request.url());
    });
    await page.goto(HOME);
    const first = page.locator('[data-story]').first();
    await expect.poll(() => first.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
    // The old JPEG stays in src (owner decision on question 106) but is not fetched.
    await expect(first).toHaveAttribute('src', '/photos/hotel-group.jpg');
    // On a 390 px phone the 600 w candidate of srcset is the one shown and the only one fetched.
    const { currentSrc, candidates } = await first.evaluate((img: HTMLImageElement) => ({
      currentSrc: new URL(img.currentSrc).pathname,
      candidates: Object.fromEntries(img.srcset.split(', ').map((c) => c.split(' ').reverse())),
    }));
    expect(candidates['600w']).toMatch(/^\/_astro\/hotel-group\.[\w-]+\.webp$/);
    expect(currentSrc).toBe(candidates['600w']);
    expect(photos.map((url) => new URL(url).pathname)).toEqual([candidates['600w']]);
  });

  test('A service dialog of the catalog hides the bottom bar', async ({ page }) => {
    await prepare(page);
    await page.goto(HOME);
    await scrollToSection(page, '#menu');
    await expect.poll(() => inViewport(page, '[data-mobile-sticky]')).toBe(true);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('nius:service-modal', { detail: { open: true } })));
    await expect(bar(page)).toBeHidden();
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('nius:service-modal', { detail: { open: false } })));
    await expect(bar(page)).toBeVisible();
  });
});

test('Home page in four languages', async ({ page }) => {
  await prepare(page);
  for (const [lang, path] of Object.entries(PATHS) as Array<[keyof typeof PATHS, string]>) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page).toHaveTitle(LOCALES[lang].seo.home.title);
    await expect(page.locator('h1')).toHaveText(LOCALES[lang].heroNew.headline);
    for (const section of ['menu', 'packages', 'subscription']) {
      await expect(page.locator(`nius-menu[section="${section}"]`)).toHaveAttribute('locale', lang);
    }
    await expect(page.locator('#testimonials h2')).toHaveText(LOCALES[lang].testimonialsNew.title);
  }
});

test('Visitor who only reads the home page', async ({ page }) => {
  await prepare(page);
  const entry: string[] = [];
  page.on('request', (request) => {
    if (FORM_ENTRY.test(request.url())) entry.push(request.url());
  });
  await page.goto(HOME);
  await page.mouse.move(640, 400);
  for (let i = 0; i < 25; i++) await page.mouse.wheel(0, 600);
  await expect
    .poll(() => page.evaluate(() => window.scrollY + window.innerHeight >= document.body.scrollHeight - 2))
    .toBe(true);
  await page.waitForLoadState('networkidle');
  expect(entry).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the home page shows the first phrase, every testimonial and every FAQ answer', async ({ page }) => {
    await prepare(page);
    await page.goto(HOME);

    await expect(page.locator('h1')).toHaveText(cs.heroNew.headline);
    const captions = page.locator('[data-story-caption]');
    await expect(captions.filter({ visible: true })).toHaveText([cs.heroNew.captions.hotel]);
    await expect(page.locator('[data-story]').first()).toHaveAttribute('alt', /\S/);

    const testimonials = page.locator('#testimonials article');
    await expect(testimonials).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await expect(testimonials.nth(i)).toBeVisible();
      await expect(testimonials.nth(i)).toContainText(cs.testimonialsNew.items[i].name);
    }

    const items = page.locator('[data-faq] [data-faq-item]');
    await expect(items).toHaveCount(cs.faqNew.items.length);
    for (let i = 0; i < cs.faqNew.items.length; i++) {
      const answer = items.nth(i).locator('[data-faq-answer]');
      await expect(answer).toHaveText(cs.faqNew.items[i].a);
      await expect(answer).toBeHidden();
      await items.nth(i).locator('summary').click();
      await expect(answer).toBeVisible();
    }
  });
});
