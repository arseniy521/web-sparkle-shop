import cs from '../../src/i18n/locales/cs.json' with { type: 'json' };
import en from '../../src/i18n/locales/en.json' with { type: 'json' };
import ru from '../../src/i18n/locales/ru.json' with { type: 'json' };
import uk from '../../src/i18n/locales/uk.json' with { type: 'json' };
import { installApiStub } from '../fixtures/api-stub.ts';
import { expect, test } from '../fixtures/network-guard.ts';
import { PILOT } from '../fixtures/pilot.ts';

test('Privacy policy link of the cookie banner', async ({ page }) => {
  await installApiStub(page);
  await page.goto(PILOT);
  const banner = page.locator('[data-cookie-banner]');
  await expect(banner).toBeVisible();

  // The banner of a Czech page links in Czech (old CookieConsent.tsx, main f0d216d).
  await banner.getByRole('link', { name: 'Zásady ochrany osobních údajů' }).click();

  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeVisible();
});

// Port of old:src/pages/PrivacyPolicy.test.tsx, on the four addresses of the policy.
const POLICY = [
  { path: '/privacy/', label: cs.footerNew.cookieSettings },
  { path: '/en/privacy/', label: en.footerNew.cookieSettings },
  { path: '/ru/privacy/', label: ru.footerNew.cookieSettings },
  { path: '/uk/privacy/', label: uk.footerNew.cookieSettings },
];

for (const { path, label } of POLICY) {
  test(`Privacy policy ${path}: cookie choice and what is sent to Google`, async ({ page }) => {
    await installApiStub(page);
    await page.goto(path);
    const text = (await page.locator('main').textContent()) ?? '';

    // The control is named exactly as in the footer of the same language.
    expect(label).toBeTruthy();
    expect(text).toContain(`click “${label}” in the footer`);
    // Deleting the cookie does not bring the banner back: the legacy record restores it.
    expect(text).not.toMatch(/delete that cookie/i);

    // Matches the payload of the Google Ads conversion of the order form.
    expect(text).toContain(
      'we send Google (Google Ads and Google Analytics) the order value, the currency, ' +
        'the codes of the services you selected and an internal order number',
    );
    expect(text).toContain('we do not send your name, phone number, address or the note you add to the order');
    // Service codes describe a health service, so this claim was not true.
    expect(text).not.toMatch(/We do not send your name, phone number, address or health information/i);
  });
}
