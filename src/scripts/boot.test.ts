import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setConsent } from '@/scripts/consent';
import type { ConsentValue } from '@/scripts/consent';

const calls = vi.hoisted(() => ({
  captureReferral: vi.fn(),
  installGlobalErrorHandlers: vi.fn(),
  initAnalyticsIfConsented: vi.fn(),
  initGoogleIfConsented: vi.fn(),
  initWebVitals: vi.fn(),
  initCookieBanner: vi.fn(),
  initLinkTracker: vi.fn(),
  installCartBridge: vi.fn(),
  initHeaderState: vi.fn(),
  ensureAuthStatus: vi.fn(),
  initBookingLinks: vi.fn(),
  initFormBridge: vi.fn(),
  initHeroStories: vi.fn(),
  initStickyBar: vi.fn(),
  initSamePageScroll: vi.fn(),
}));

vi.mock('@/scripts/referral', () => ({ captureReferral: calls.captureReferral }));
vi.mock('@/scripts/client-error', () => ({
  installGlobalErrorHandlers: calls.installGlobalErrorHandlers,
}));
vi.mock('@/scripts/analytics', () => ({
  initAnalyticsIfConsented: calls.initAnalyticsIfConsented,
}));
vi.mock('@/scripts/ga', () => ({ initGoogleIfConsented: calls.initGoogleIfConsented }));
vi.mock('@/scripts/booking-link', () => ({ initBookingLinks: calls.initBookingLinks }));
vi.mock('@/scripts/web-vitals', () => ({ initWebVitals: calls.initWebVitals }));
vi.mock('@/scripts/cookie-banner', () => ({ initCookieBanner: calls.initCookieBanner }));
vi.mock('@/scripts/link-tracker', () => ({ initLinkTracker: calls.initLinkTracker }));
vi.mock('@/scripts/cart-core', () => ({ installCartBridge: calls.installCartBridge }));
vi.mock('@/scripts/header-state', () => ({ initHeaderState: calls.initHeaderState }));
vi.mock('@/scripts/auth-status', () => ({ authStatus: { ensure: calls.ensureAuthStatus } }));
vi.mock('@/scripts/form-bridge', () => ({ initFormBridge: calls.initFormBridge }));
vi.mock('@/scripts/hero-stories', () => ({ initHeroStories: calls.initHeroStories }));
vi.mock('@/scripts/sticky-bar', () => ({ initStickyBar: calls.initStickyBar }));
vi.mock('@/scripts/same-page-scroll', () => ({ initSamePageScroll: calls.initSamePageScroll }));

describe('boot', () => {
  beforeEach(() => {
    vi.resetModules();
    document.cookie = 'nius_consent=; max-age=0; path=/';
    localStorage.clear();
  });

  // gtag.js itself is loaded by the inline <head> script (gtag-bootstrap.test.ts).
  it('registers Google Ads and starts web vitals with consent accepted', async () => {
    setConsent('accepted');
    await import('./boot');
    expect(calls.initGoogleIfConsented).toHaveBeenCalledOnce();
    expect(calls.initWebVitals).toHaveBeenCalledOnce();
  });

  it.each([[null], ['rejected' as ConsentValue]])(
    'starts neither Google Ads nor web vitals with consent %s',
    async (consent) => {
      if (consent) setConsent(consent);
      await import('./boot');
      expect(calls.initGoogleIfConsented).not.toHaveBeenCalled();
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

  it('starts the cart, the header state and the sign-in check, the cart first', async () => {
    await import('./boot');
    expect(calls.installCartBridge).toHaveBeenCalledOnce();
    expect(calls.initHeaderState).toHaveBeenCalledOnce();
    expect(calls.ensureAuthStatus).toHaveBeenCalledOnce();
    expect(calls.installCartBridge.mock.invocationCallOrder[0]).toBeLessThan(
      calls.initHeaderState.mock.invocationCallOrder[0],
    );
  });

  it('binds the booking links after the cart is installed', async () => {
    await import('./boot');
    expect(calls.initBookingLinks).toHaveBeenCalledOnce();
    expect(calls.installCartBridge.mock.invocationCallOrder[0]).toBeLessThan(
      calls.initBookingLinks.mock.invocationCallOrder[0],
    );
  });

  it('starts the home page scripts after the cart is installed', async () => {
    await import('./boot');
    for (const init of [calls.initHeroStories, calls.initStickyBar, calls.initSamePageScroll]) {
      expect(init).toHaveBeenCalledOnce();
      expect(calls.installCartBridge.mock.invocationCallOrder[0]).toBeLessThan(init.mock.invocationCallOrder[0]);
    }
  });

  it('starts the form bridge last', async () => {
    await import('./boot');
    expect(calls.initFormBridge).toHaveBeenCalledOnce();
    const last = Math.max(...Object.values(calls).flatMap((mock) => mock.mock.invocationCallOrder));
    expect(calls.initFormBridge.mock.invocationCallOrder[0]).toBe(last);
  });
});
