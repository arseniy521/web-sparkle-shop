import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ALL_DENIED,
  GRANTED,
  GTAG_LOADER_SELECTOR,
  configuredIds,
  consentUpdates,
  resetConsentPage,
  runInlineConsentScript,
  type StoredChoice,
} from '../../tests/fixtures/consent-page.ts';

const analytics = vi.hoisted(() => ({
  enableAnalytics: vi.fn(),
  disableAnalytics: vi.fn(),
  track: vi.fn(),
  trackCtaClick: vi.fn(),
}));
const webVitals = vi.hoisted(() => ({ initWebVitals: vi.fn() }));
vi.mock('@/scripts/analytics', () => analytics);
vi.mock('@/scripts/web-vitals', () => webVitals);

const ADS_ID = 'AW-0000000000';
const GA4_ID = 'G-VNMLWF0XZG';
const gaDisabled = () => (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_ID}`];
const banner = () => document.querySelector<HTMLElement>('[data-cookie-banner]')!;
const click = (selector: string) => document.querySelector<HTMLElement>(selector)!.click();
const accept = () => click('[data-consent="accept"]');
const reject = () => click('[data-consent="reject"]');
const cookieSettings = () => click('[data-cookie-settings] span');
const storedCookie = () => document.cookie.match(/(?:^|; )nius_consent=([^;]*)/)?.[1];

/** One page load: the inline <head> script, the page with the banner and a footer control, the start. */
async function loadPage(stored: { cookie?: StoredChoice; legacy?: StoredChoice } = {}) {
  resetConsentPage(stored);
  sessionStorage.clear();
  document.body.innerHTML = `
    <div data-cookie-banner hidden>
      <button data-consent="reject">Odmítnout</button>
      <button data-consent="accept">Souhlasím</button>
    </div>
    <footer><button type="button" data-cookie-settings><span>Nastavení cookies</span></button></footer>`;
  runInlineConsentScript();
  vi.resetModules();
  const { cart } = await import('./cart-core');
  const { initGoogleIfConsented } = await import('./ga');
  const { initCookieBanner } = await import('./cookie-banner');
  initGoogleIfConsented();
  initCookieBanner();
  return { cart };
}

describe('cookie banner', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_ADS_ID', ADS_ID);
    vi.stubEnv('VITE_GOOGLE_ADS_LEAD_LABEL', 'synthetic-label');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetConsentPage();
  });

  it('shows the banner only without a stored choice', async () => {
    await loadPage();
    expect(banner().hidden).toBe(false);

    await loadPage({ cookie: 'accepted' });
    expect(banner().hidden).toBe(true);
  });

  it('keeps the banner hidden and disables Google for a stored rejection', async () => {
    await loadPage({ cookie: 'rejected' });
    expect(banner().hidden).toBe(true);
    expect(gaDisabled()).toBe(true);
    expect(document.querySelector(GTAG_LOADER_SELECTOR)).toBeNull();
  });

  it('Accept stores consent, hides the banner, grants Consent Mode and starts the tags', async () => {
    await loadPage();
    accept();
    expect(storedCookie()).toBe('accepted');
    expect(banner().hidden).toBe(true);
    expect(analytics.enableAnalytics).toHaveBeenCalledOnce();
    expect(webVitals.initWebVitals).toHaveBeenCalledOnce();
    expect(consentUpdates()).toEqual([GRANTED]);
    expect(configuredIds()).toEqual([GA4_ID, ADS_ID]);
    expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(1);
  });

  it('Reject stores the refusal, hides the banner, denies Consent Mode and loads nothing', async () => {
    await loadPage();
    reject();
    expect(storedCookie()).toBe('rejected');
    expect(banner().hidden).toBe(true);
    expect(analytics.disableAnalytics).toHaveBeenCalledOnce();
    expect(analytics.enableAnalytics).not.toHaveBeenCalled();
    expect(consentUpdates()).toEqual([ALL_DENIED]);
    expect(configuredIds()).toEqual([]);
    expect(document.querySelector(GTAG_LOADER_SELECTOR)).toBeNull();
    expect(gaDisabled()).toBe(true);
  });

  describe('"Cookie settings" control', () => {
    it.each(['accepted', 'rejected'] as const)('reopens the banner after a stored choice (%s)', async (cookie) => {
      await loadPage({ cookie, legacy: cookie });
      expect(banner().hidden).toBe(true);

      cookieSettings();

      expect(banner().hidden).toBe(false);
    });

    it('works for a control added after the start', async () => {
      await loadPage({ cookie: 'accepted' });
      document.body.insertAdjacentHTML('beforeend', '<a href="#" id="late" data-cookie-settings>Cookies</a>');

      click('#late');

      expect(banner().hidden).toBe(false);
    });

    it('reopen, then Reject after Accept: stores the refusal and pushes the denied signals', async () => {
      await loadPage({ cookie: 'accepted', legacy: 'accepted' });
      expect(consentUpdates()).toEqual([GRANTED]);

      cookieSettings();
      reject();

      expect(banner().hidden).toBe(true);
      expect(storedCookie()).toBe('rejected');
      expect(localStorage.getItem('nius-cookie-consent')).toBe('rejected');
      expect(consentUpdates()).toEqual([GRANTED, ALL_DENIED]);
      expect(gaDisabled()).toBe(true);
      expect(analytics.disableAnalytics).toHaveBeenCalledOnce();
    });

    it('reopen, then Accept after Reject: stores the consent, grants and starts the tags', async () => {
      await loadPage({ cookie: 'rejected', legacy: 'rejected' });
      expect(gaDisabled()).toBe(true);

      cookieSettings();
      accept();

      expect(banner().hidden).toBe(true);
      expect(storedCookie()).toBe('accepted');
      expect(localStorage.getItem('nius-cookie-consent')).toBe('accepted');
      expect(consentUpdates()).toEqual([GRANTED]);
      expect(configuredIds()).toEqual([GA4_ID, ADS_ID]);
      expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(1);
      expect(gaDisabled()).toBe(false);
      expect(analytics.enableAnalytics).toHaveBeenCalledOnce();
    });

    it('Accept, Reject, Accept on one page load loads and configures the Google tag once', async () => {
      await loadPage();

      accept();
      cookieSettings();
      reject();
      cookieSettings();
      accept();

      expect(consentUpdates()).toEqual([GRANTED, ALL_DENIED, GRANTED]);
      expect(configuredIds()).toEqual([GA4_ID, ADS_ID]);
      expect(document.querySelectorAll(GTAG_LOADER_SELECTOR)).toHaveLength(1);
      expect(gaDisabled()).toBe(false);
      expect(storedCookie()).toBe('accepted');
    });
  });

  describe('while the order form is open', () => {
    it('hides the banner and keeps the choice pending, then shows it again', async () => {
      const { cart } = await loadPage();
      expect(banner().hidden).toBe(false);

      cart.openForm('header');
      expect(banner().hidden).toBe(true);
      expect(storedCookie()).toBeUndefined();
      expect(analytics.enableAnalytics).not.toHaveBeenCalled();
      expect(analytics.disableAnalytics).not.toHaveBeenCalled();

      cart.setOpen(false);
      expect(banner().hidden).toBe(false);
    });

    it('a reopen request waits until the form closes', async () => {
      const { cart } = await loadPage({ cookie: 'accepted' });
      cart.openForm('header');

      cookieSettings();
      expect(banner().hidden).toBe(true);

      cart.setOpen(false);
      expect(banner().hidden).toBe(false);
    });

    it('does not bring back a banner that was answered', async () => {
      const { cart } = await loadPage();
      accept();

      cart.openForm('header');
      cart.setOpen(false);

      expect(banner().hidden).toBe(true);
    });
  });
});
