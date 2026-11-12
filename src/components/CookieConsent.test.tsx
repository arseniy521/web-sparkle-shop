import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GTAG_LOADER_SELECTOR,
  dataLayerEntries,
  resetConsentPage,
  runInlineConsentScript,
} from '@/test/consentPage';

const amplitude = vi.hoisted(() => ({
  init: vi.fn(),
  setOptOut: vi.fn(),
  track: vi.fn(),
  setUserId: vi.fn(),
  identify: vi.fn(),
}));

vi.mock('@amplitude/analytics-browser', () => ({
  ...amplitude,
  Identify: class {
    set() {
      return this;
    }
  },
}));

const ADS_ID = 'AW-0000000000';
const GA4_ID = 'G-VNMLWF0XZG';
const GA_DISABLE_FLAG = `ga-disable-${GA4_ID}`;

type Stored = 'accepted' | 'rejected' | null;
type Page = Awaited<ReturnType<typeof loadPage>>;

let unmountPage: (() => void) | undefined;

/**
 * One page load: the inline script of index.html, the app start (src/App.tsx) and a page
 * with the banner and the footer. Modules are loaded fresh, as after a real reload.
 */
const loadPage = async (stored: { cookie?: Stored; legacy?: Stored } = {}, language = 'cs') => {
  resetConsentPage(stored);
  runInlineConsentScript();
  vi.resetModules();

  const { cleanup, fireEvent, render, screen } = await import('@testing-library/react');
  const { MemoryRouter } = await import('react-router-dom');
  const { default: i18n } = await import('@/i18n/config');
  const analytics = await import('@/lib/analytics');
  const { CookieConsent } = await import('./CookieConsent');
  const { FooterNew } = await import('./FooterNew');

  await i18n.changeLanguage(language);
  analytics.initAnalyticsIfConsented();
  render(
    <MemoryRouter>
      <CookieConsent />
      <FooterNew />
    </MemoryRouter>,
  );

  unmountPage = cleanup;
  return { analytics, fireEvent, screen };
};

const banner = (p: Page) => p.screen.queryByRole('dialog');
const click = (p: Page, name: string) => p.fireEvent.click(p.screen.getByRole('button', { name }));

const consentUpdates = () =>
  dataLayerEntries()
    .filter((entry) => entry[0] === 'consent' && entry[1] === 'update')
    .map((entry) => entry[2]);
const configuredIds = () =>
  dataLayerEntries()
    .filter((entry) => entry[0] === 'config')
    .map((entry) => entry[1]);
const googleEvents = () => dataLayerEntries().filter((entry) => entry[0] === 'event');
const pageFlag = (name: string) => (window as unknown as Record<string, unknown>)[name];

const ALL_DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
};
const GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'denied',
  analytics_storage: 'granted',
};

describe('cookie settings', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'synthetic-key');
    vi.stubEnv('VITE_GOOGLE_ADS_ID', ADS_ID);
    vi.stubEnv('VITE_GOOGLE_ADS_LEAD_LABEL', 'synthetic-label');
  });

  afterEach(() => {
    unmountPage?.();
    unmountPage = undefined;
    vi.unstubAllEnvs();
    resetConsentPage();
  });

  it.each([
    { language: 'cs', label: 'Nastavení cookies' },
    { language: 'en', label: 'Cookie settings' },
    { language: 'ru', label: 'Настройки cookie' },
    { language: 'uk', label: 'Налаштування cookie' },
  ])('footer control "$label" reopens the banner ($language)', async ({ language, label }) => {
    const p = await loadPage({ cookie: 'accepted', legacy: 'accepted' }, language);
    expect(banner(p)).toBeNull();

    click(p, label);

    expect(banner(p)).not.toBeNull();
  });

  it('reopen -> Reject after Accept: stores the refusal, pushes denied signals and stops tracking', async () => {
    const p = await loadPage({ cookie: 'accepted', legacy: 'accepted' });
    expect(consentUpdates()).toEqual([GRANTED]);
    expect(amplitude.init).toHaveBeenCalledTimes(1);

    click(p, 'Nastavení cookies');
    click(p, 'Odmítnout');

    expect(banner(p)).toBeNull();
    expect(document.cookie).toContain('nius_consent=rejected');
    expect(document.cookie).not.toContain('nius_consent=accepted');
    expect(localStorage.getItem('nius-cookie-consent')).toBe('rejected');
    expect(consentUpdates()).toEqual([GRANTED, ALL_DENIED]);
    expect(pageFlag(GA_DISABLE_FLAG)).toBe(true);
    expect(amplitude.setOptOut).toHaveBeenLastCalledWith(true);

    // Further tracking calls: nothing reaches Google or Amplitude.
    p.analytics.trackGoogleEvent('contact', { method: 'phone', source: 'footer' });
    p.analytics.trackLeadConversion({ value: 2900, serviceCodes: ['immunity_lite'] });
    p.analytics.trackCtaClick('phone', 'footer');
    p.analytics.track('order_step_completed', { step: 'address' });
    p.analytics.identifyUser('user-synthetic-1');
    p.analytics.setAnalyticsOptOut(false);

    expect(googleEvents()).toEqual([]);
    expect(amplitude.track).not.toHaveBeenCalled();
    expect(amplitude.setUserId).not.toHaveBeenCalled();
    expect(amplitude.identify).not.toHaveBeenCalled();
    expect(amplitude.setOptOut).toHaveBeenLastCalledWith(true);
    expect(amplitude.setOptOut).not.toHaveBeenCalledWith(false);
  });

  it('reopen -> Accept after Reject: stores the consent, pushes granted signals and starts the tags', async () => {
    const p = await loadPage({ cookie: 'rejected', legacy: 'rejected' });
    expect(consentUpdates()).toEqual([]);
    expect(pageFlag(GA_DISABLE_FLAG)).toBe(true);
    expect(amplitude.init).not.toHaveBeenCalled();

    click(p, 'Nastavení cookies');
    click(p, 'Souhlasím');

    expect(banner(p)).toBeNull();
    expect(document.cookie).toContain('nius_consent=accepted');
    expect(document.cookie).not.toContain('nius_consent=rejected');
    expect(localStorage.getItem('nius-cookie-consent')).toBe('accepted');
    expect(consentUpdates()).toEqual([GRANTED]);
    expect(configuredIds()).toEqual([GA4_ID, ADS_ID]);
    expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(1);
    expect(pageFlag(GA_DISABLE_FLAG)).toBe(false);
    expect(amplitude.init).toHaveBeenCalledTimes(1);
    expect(amplitude.setOptOut).toHaveBeenLastCalledWith(false);

    p.analytics.trackGoogleEvent('contact', { method: 'phone', source: 'footer' });
    p.analytics.track('order_step_completed', { step: 'address' });

    expect(googleEvents()).toEqual([['event', 'contact', { method: 'phone', source: 'footer' }]]);
    expect(amplitude.track).toHaveBeenCalledTimes(1);
  });

  it('Accept -> Reject -> Accept on one page load loads and configures the Google tag once', async () => {
    const p = await loadPage();
    expect(banner(p)).not.toBeNull();

    click(p, 'Souhlasím');
    click(p, 'Nastavení cookies');
    click(p, 'Odmítnout');
    click(p, 'Nastavení cookies');
    click(p, 'Souhlasím');

    expect(consentUpdates()).toEqual([GRANTED, ALL_DENIED, GRANTED]);
    expect(configuredIds()).toEqual([GA4_ID, ADS_ID]);
    expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(1);
    expect(pageFlag(GA_DISABLE_FLAG)).toBe(false);
    expect(document.cookie).toContain('nius_consent=accepted');
    expect(amplitude.init).toHaveBeenCalledTimes(1);
    expect(amplitude.setOptOut).toHaveBeenLastCalledWith(false);
  });
});
