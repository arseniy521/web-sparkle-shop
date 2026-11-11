import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setConsent } from '@/scripts/consent';
import type { ConsentValue } from '@/scripts/consent';

const calls = vi.hoisted(() => ({
  captureReferral: vi.fn(),
  installGlobalErrorHandlers: vi.fn(),
  initAnalyticsIfConsented: vi.fn(),
  loadGa: vi.fn(),
  initWebVitals: vi.fn(),
  initCookieBanner: vi.fn(),
  initLinkTracker: vi.fn(),
}));

vi.mock('@/scripts/referral', () => ({ captureReferral: calls.captureReferral }));
vi.mock('@/scripts/client-error', () => ({
  installGlobalErrorHandlers: calls.installGlobalErrorHandlers,
}));
vi.mock('@/scripts/analytics', () => ({
  initAnalyticsIfConsented: calls.initAnalyticsIfConsented,
}));
vi.mock('@/scripts/ga', () => ({ loadGa: calls.loadGa }));
vi.mock('@/scripts/web-vitals', () => ({ initWebVitals: calls.initWebVitals }));
vi.mock('@/scripts/cookie-banner', () => ({ initCookieBanner: calls.initCookieBanner }));
vi.mock('@/scripts/link-tracker', () => ({ initLinkTracker: calls.initLinkTracker }));

describe('boot', () => {
  beforeEach(() => {
    vi.resetModules();
    document.cookie = 'nius_consent=; max-age=0; path=/';
    localStorage.clear();
  });

  it('loads Google Analytics and web vitals with consent accepted', async () => {
    setConsent('accepted');
    await import('./boot');
    expect(calls.loadGa).toHaveBeenCalledOnce();
    expect(calls.initWebVitals).toHaveBeenCalledOnce();
  });

  it.each([[null], ['rejected' as ConsentValue]])(
    'loads neither Google Analytics nor web vitals with consent %s',
    async (consent) => {
      if (consent) setConsent(consent);
      await import('./boot');
      expect(calls.loadGa).not.toHaveBeenCalled();
      expect(calls.initWebVitals).not.toHaveBeenCalled();
    },
  );

  it.each([[null], ['rejected' as ConsentValue], ['accepted' as ConsentValue]])(
    'captures the referral before analytics starts with consent %s',
    async (consent) => {
      if (consent) setConsent(consent);
      await import('./boot');
      expect(calls.captureReferral.mock.invocationCallOrder[0]).toBeLessThan(
        calls.initAnalyticsIfConsented.mock.invocationCallOrder[0],
      );
      expect(calls.initCookieBanner).toHaveBeenCalledOnce();
      expect(calls.initLinkTracker).toHaveBeenCalledOnce();
    },
  );
});
