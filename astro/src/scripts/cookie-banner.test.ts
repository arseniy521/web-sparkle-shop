import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getConsent, setConsent } from '@/scripts/consent';

const analytics = vi.hoisted(() => ({ enableAnalytics: vi.fn(), disableAnalytics: vi.fn() }));
const webVitals = vi.hoisted(() => ({ initWebVitals: vi.fn() }));
vi.mock('@/scripts/analytics', () => analytics);
vi.mock('@/scripts/web-vitals', () => webVitals);

const gaScript = () => document.querySelector('script[src*="googletagmanager"]');
const banner = () => document.querySelector<HTMLElement>('[data-cookie-banner]')!;
const button = (name: 'accept' | 'reject') =>
  document.querySelector<HTMLButtonElement>(`[data-consent="${name}"]`)!;

const start = async () => {
  const { initCookieBanner } = await import('./cookie-banner');
  initCookieBanner();
};

describe('cookie banner', () => {
  beforeEach(() => {
    vi.resetModules();
    document.cookie = 'nius_consent=; max-age=0; path=/';
    localStorage.clear();
    document.head.innerHTML = '';
    delete (window as unknown as Record<string, unknown>)['ga-disable-G-VNMLWF0XZG'];
    document.body.innerHTML = `
      <div data-cookie-banner hidden>
        <button data-consent="reject">Reject</button>
        <button data-consent="accept">Accept</button>
      </div>`;
  });

  it('shows the banner only without a stored choice', async () => {
    await start();
    expect(banner().hidden).toBe(false);

    setConsent('accepted');
    banner().hidden = true;
    await start();
    expect(banner().hidden).toBe(true);
  });

  it('keeps the banner hidden and disables Google for a stored rejection', async () => {
    setConsent('rejected');
    await start();
    expect(banner().hidden).toBe(true);
    expect((window as unknown as Record<string, unknown>)['ga-disable-G-VNMLWF0XZG']).toBe(true);
    expect(gaScript()).toBeNull();
  });

  it('accept stores consent, hides the banner, enables Amplitude and GA', async () => {
    await start();
    button('accept').click();
    expect(getConsent()).toBe('accepted');
    expect(banner().hidden).toBe(true);
    expect(analytics.enableAnalytics).toHaveBeenCalledOnce();
    expect(webVitals.initWebVitals).toHaveBeenCalledOnce();
    expect(gaScript()).not.toBeNull();
  });

  it('reject stores consent, hides the banner, loads nothing', async () => {
    await start();
    button('reject').click();
    expect(getConsent()).toBe('rejected');
    expect(banner().hidden).toBe(true);
    expect(analytics.disableAnalytics).toHaveBeenCalledOnce();
    expect(analytics.enableAnalytics).not.toHaveBeenCalled();
    expect(gaScript()).toBeNull();
    expect((window as unknown as Record<string, unknown>)['ga-disable-G-VNMLWF0XZG']).toBe(true);
  });
});
