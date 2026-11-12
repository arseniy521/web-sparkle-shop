import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import i18n from '@/i18n/config';
import PrivacyPolicy from './PrivacyPolicy';

vi.mock('@/components/NavBar', () => ({ NavBar: () => null }));
vi.mock('@/components/FooterNew', () => ({ FooterNew: () => null }));
vi.mock('@/components/SEO', () => ({ SEO: () => null }));

const policyText = async (language: string) => {
  await i18n.changeLanguage(language);
  const { container } = render(<PrivacyPolicy />);
  return container.textContent ?? '';
};

describe('privacy policy', () => {
  it.each(['cs', 'en', 'ru', 'uk'])(
    'points to the footer control for changing the cookie choice (%s)',
    async (language) => {
      const text = await policyText(language);

      // The control is named exactly as in the footer of the same page.
      const label = i18n.t('footerNew.cookieSettings');
      expect(label).not.toBe('footerNew.cookieSettings');
      expect(text).toContain(`click “${label}” in the footer`);
      // Deleting the cookie does not bring the banner back: the legacy record restores it.
      expect(text).not.toMatch(/delete that cookie/i);
    },
  );

  it.each(['cs', 'en', 'ru', 'uk'])(
    'says what is sent to Google with an order and does not deny health-related data (%s)',
    async (language) => {
      const text = await policyText(language);

      // Matches the payload asserted in useOnboardingForm.conversion.test.tsx.
      expect(text).toContain(
        'we send Google (Google Ads and Google Analytics) the order value, the currency, ' +
          'the codes of the services you selected and an internal order number',
      );
      expect(text).toContain('we do not send your name, phone number, address or the note you add to the order');
      // Service codes describe a health service, so this claim was not true.
      expect(text).not.toMatch(/We do not send your name, phone number, address or health information/i);
    },
  );
});
