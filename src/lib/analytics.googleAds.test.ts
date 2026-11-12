import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dataLayerEntries, resetConsentPage, runInlineConsentScript } from '@/test/consentPage';

vi.mock('@amplitude/analytics-browser', () => ({ init: vi.fn(), setOptOut: vi.fn(), track: vi.fn() }));
vi.mock('@/i18n/config', () => ({ default: { language: 'cs' } }));

const ADS_ID = 'AW-0000000000';
const GA4_ID = 'G-VNMLWF0XZG';

type Stored = 'accepted' | 'rejected' | null;

/** One page load: the inline script of index.html, then the app start (src/App.tsx). */
const loadPage = async (stored: { cookie?: Stored; legacy?: Stored } = {}) => {
  resetConsentPage(stored);
  runInlineConsentScript();
  vi.resetModules();
  const analytics = await import('./analytics');
  const { setConsent } = await import('./consent');
  analytics.initAnalyticsIfConsented();
  return { analytics, setConsent };
};

const configuredIds = () =>
  dataLayerEntries()
    .filter((entry) => entry[0] === 'config')
    .map((entry) => entry[1]);

const indexOfGrantedUpdate = () =>
  dataLayerEntries().findIndex(
    (entry) =>
      entry[0] === 'consent' &&
      entry[1] === 'update' &&
      (entry[2] as Record<string, string>).ad_storage === 'granted',
  );

const indexOfAdsConfig = () =>
  dataLayerEntries().findIndex((entry) => entry[0] === 'config' && entry[1] === ADS_ID);

describe('Google Ads account configuration', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_ADS_ID', ADS_ID);
    vi.stubEnv('VITE_GOOGLE_ADS_LEAD_LABEL', 'synthetic-label');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetConsentPage();
  });

  it('configures the Ads id once on the first Accept, after the consent update', async () => {
    const { analytics, setConsent } = await loadPage();
    expect(configuredIds()).toEqual([]);

    setConsent('accepted');
    analytics.enableAnalytics();

    expect(configuredIds()).toEqual([GA4_ID, ADS_ID]);
    expect(indexOfGrantedUpdate()).toBeGreaterThanOrEqual(0);
    expect(indexOfAdsConfig()).toBeGreaterThan(indexOfGrantedUpdate());
  });

  it.each([
    { name: 'cookie', stored: { cookie: 'accepted' as const } },
    { name: 'legacy localStorage record', stored: { legacy: 'accepted' as const } },
  ])('configures the Ads id on a page load with consent stored in the $name', async ({ stored }) => {
    await loadPage(stored);

    expect(configuredIds()).toEqual([GA4_ID, ADS_ID]);
    expect(indexOfAdsConfig()).toBeGreaterThan(indexOfGrantedUpdate());
  });

  it('configures the Ads id only once per page load', async () => {
    const { analytics } = await loadPage({ cookie: 'accepted' });

    analytics.initAnalyticsIfConsented();
    analytics.enableAnalytics();

    expect(configuredIds().filter((id) => id === ADS_ID)).toHaveLength(1);
  });

  it('does not configure the Ads id before a choice is made', async () => {
    await loadPage();

    expect(configuredIds()).toEqual([]);
    expect(indexOfGrantedUpdate()).toBe(-1);
  });

  it('does not configure the Ads id on Reject', async () => {
    const { analytics, setConsent } = await loadPage();

    setConsent('rejected');
    analytics.disableAnalytics();

    expect(configuredIds()).toEqual([]);
    expect(indexOfGrantedUpdate()).toBe(-1);
  });

  it('does not configure the Ads id on a page load with a stored refusal', async () => {
    await loadPage({ cookie: 'rejected', legacy: 'accepted' });

    expect(configuredIds()).toEqual([]);
  });

  it('configures nothing for Ads when the env id is absent', async () => {
    vi.stubEnv('VITE_GOOGLE_ADS_ID', '');

    const { analytics } = await loadPage({ cookie: 'accepted' });
    analytics.enableAnalytics();

    expect(configuredIds()).toEqual([GA4_ID]);
  });
});
