import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setConsent } from '@/scripts/consent';

const amplitude = vi.hoisted(() => ({
  init: vi.fn(),
  track: vi.fn(),
  setOptOut: vi.fn(),
  flush: vi.fn(() => ({ promise: Promise.resolve() })),
}));
const cookieScope = vi.hoisted(() => ({ domain: undefined as string | undefined }));

vi.mock('@amplitude/analytics-browser', () => amplitude);
vi.mock('@/scripts/cookie-domain', () => ({ sharedCookieDomain: () => cookieScope.domain }));

const flushPromises = async () => {
  await vi.dynamicImportSettled();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

const clearConsent = () => {
  document.cookie = 'nius_consent=; max-age=0; path=/';
  localStorage.clear();
};

const holdSdk = () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  vi.doMock('@amplitude/analytics-browser', async () => {
    await gate;
    return amplitude;
  });
  return release;
};

const load = () => import('./analytics');

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@amplitude/analytics-browser', () => amplitude);
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'test-key');
    clearConsent();
    cookieScope.domain = undefined;
    document.documentElement.lang = 'en';
    history.pushState({}, '', '/');
  });

  it('does not import Amplitude before consent', async () => {
    const { initAnalyticsIfConsented, track } = await load();
    initAnalyticsIfConsented();
    track('x');
    await flushPromises();
    expect(amplitude.init).not.toHaveBeenCalled();
    expect(amplitude.track).not.toHaveBeenCalled();
  });

  it('initializes with the old options after consent', async () => {
    const { enableAnalytics } = await load();
    setConsent('accepted');
    enableAnalytics();
    await flushPromises();
    expect(amplitude.init).toHaveBeenCalledWith(
      'test-key',
      expect.objectContaining({
        serverZone: 'US',
        autocapture: {
          pageViews: true,
          sessions: true,
          attribution: true,
          elementInteractions: false,
          formInteractions: false,
          fileDownloads: false,
        },
        trackingOptions: { ipAddress: false },
      }),
    );
  });

  it('initializes on load when consent is already stored', async () => {
    const { initAnalyticsIfConsented } = await load();
    setConsent('accepted');
    initAnalyticsIfConsented();
    await flushPromises();
    expect(amplitude.init).toHaveBeenCalledOnce();
  });

  it('scopes the Amplitude cookie to .nius.cz only on www.nius.cz', async () => {
    cookieScope.domain = '.nius.cz';
    const first = await load();
    first.enableAnalytics();
    await flushPromises();
    expect(amplitude.init).toHaveBeenLastCalledWith(
      'test-key',
      expect.objectContaining({ cookieOptions: { domain: '.nius.cz' } }),
    );

    vi.resetModules();
    cookieScope.domain = undefined;
    const second = await load();
    second.enableAnalytics();
    await flushPromises();
    expect(amplitude.init).toHaveBeenLastCalledWith(
      'test-key',
      expect.objectContaining({ cookieOptions: undefined }),
    );
  });

  it('adds the page language from <html lang>', async () => {
    const { enableAnalytics, track } = await load();
    document.documentElement.lang = 'ru';
    enableAnalytics();
    track('order_form_opened', { source: 'header' });
    await flushPromises();
    expect(amplitude.track).toHaveBeenCalledWith('order_form_opened', {
      language: 'ru',
      source: 'header',
    });
  });

  it('delivers events tracked between consent and SDK load, in order', async () => {
    const { enableAnalytics, track } = await load();
    enableAnalytics();
    track('first');
    track('second');
    expect(amplitude.track).not.toHaveBeenCalled();
    await flushPromises();
    expect(amplitude.track.mock.calls.map((call) => call[0])).toEqual(['first', 'second']);
  });

  it('keeps at most 50 events while the SDK loads', async () => {
    const { enableAnalytics, track } = await load();
    enableAnalytics();
    for (let i = 0; i < 60; i += 1) track('e' + i);
    await flushPromises();
    expect(amplitude.track).toHaveBeenCalledTimes(50);
  });

  it('applies an opt-out before queued events even when the queue is full', async () => {
    const release = holdSdk();
    const { enableAnalytics, disableAnalytics, track } = await load();
    enableAnalytics();
    for (let i = 0; i < 50; i += 1) track('e' + i);
    disableAnalytics();
    release();
    await flushPromises();
    expect(amplitude.setOptOut).toHaveBeenCalledWith(true);
    expect(amplitude.setOptOut.mock.invocationCallOrder[0]).toBeLessThan(
      amplitude.track.mock.invocationCallOrder[0],
    );
  });

  it('drops events tracked before consent', async () => {
    const { enableAnalytics, track } = await load();
    track('too_early');
    enableAnalytics();
    await flushPromises();
    expect(amplitude.track).not.toHaveBeenCalled();
  });

  it('survives a blocked SDK without retrying', async () => {
    const attempts = vi.fn();
    vi.doMock('@amplitude/analytics-browser', () => {
      attempts();
      throw new Error('blocked');
    });
    const { enableAnalytics, track, flushAnalytics } = await load();
    enableAnalytics();
    track('x');
    await expect(flushAnalytics()).resolves.toBeUndefined();
    track('y');
    enableAnalytics();
    await flushPromises();
    expect(attempts).toHaveBeenCalledOnce();
    expect(amplitude.init).not.toHaveBeenCalled();
    expect(amplitude.track).not.toHaveBeenCalled();
  });

  it('ends opted out when Accept is followed by Reject while the SDK loads', async () => {
    const release = holdSdk();
    const { enableAnalytics, disableAnalytics, track } = await load();
    enableAnalytics();
    track('queued');
    disableAnalytics();
    release();
    await flushPromises();
    expect(amplitude.setOptOut.mock.calls.at(-1)).toEqual([true]);
    expect(amplitude.setOptOut.mock.invocationCallOrder[0]).toBeLessThan(
      amplitude.track.mock.invocationCallOrder[0] ?? Infinity,
    );
  });

  it('cta_clicked carries page_path without query and hash', async () => {
    const { enableAnalytics, trackCtaClick } = await load();
    history.pushState({}, '', '/en/?ref=A#x');
    enableAnalytics();
    trackCtaClick('phone', 'footer');
    await flushPromises();
    expect(amplitude.track).toHaveBeenCalledWith('cta_clicked', {
      language: 'en',
      page_path: '/en/',
      cta: 'phone',
      source: 'footer',
    });
  });

  it('cleanPath returns the pathname only', async () => {
    const { cleanPath } = await load();
    history.pushState({}, '', '/ru/page/?a=1#b');
    expect(cleanPath()).toBe('/ru/page/');
    expect(cleanPath('https://www.nius.cz/en/?a=1#b')).toBe('/en/');
  });

  it('is a no-op without VITE_AMPLITUDE_API_KEY', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', '  ');
    const { enableAnalytics, track, flushAnalytics } = await load();
    enableAnalytics();
    track('x');
    await flushAnalytics();
    expect(amplitude.init).not.toHaveBeenCalled();
    expect(amplitude.track).not.toHaveBeenCalled();
  });

  it('opts out after reject once the SDK is loaded', async () => {
    const { enableAnalytics, disableAnalytics } = await load();
    enableAnalytics();
    await flushPromises();
    disableAnalytics();
    expect(amplitude.setOptOut).toHaveBeenLastCalledWith(true);
  });

  it('opts back in only with stored consent', async () => {
    const { enableAnalytics, setAnalyticsOptOut } = await load();
    setConsent('accepted');
    enableAnalytics();
    await flushPromises();
    amplitude.setOptOut.mockClear();

    setAnalyticsOptOut(false);
    expect(amplitude.setOptOut).toHaveBeenCalledWith(false);

    amplitude.setOptOut.mockClear();
    setConsent('rejected');
    setAnalyticsOptOut(false);
    expect(amplitude.setOptOut).not.toHaveBeenCalled();
    setAnalyticsOptOut(true);
    expect(amplitude.setOptOut).toHaveBeenCalledWith(true);
  });
});
