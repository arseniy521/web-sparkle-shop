import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setConsent } from '@/scripts/consent';

const vitals = vi.hoisted(() => ({
  loaded: vi.fn(),
  onLCP: vi.fn(),
  onINP: vi.fn(),
  onCLS: vi.fn(),
}));
const analytics = vi.hoisted(() => ({ track: vi.fn() }));

vi.mock('web-vitals', () => {
  vitals.loaded();
  return { onLCP: vitals.onLCP, onINP: vitals.onINP, onCLS: vitals.onCLS };
});
vi.mock('@/scripts/analytics', async () => ({
  ...(await vi.importActual<typeof import('./analytics')>('./analytics')),
  ...analytics,
}));

const run = async () => {
  const { initWebVitals } = await import('./web-vitals');
  initWebVitals();
  await vi.dynamicImportSettled();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('web vitals', () => {
  beforeEach(() => {
    vi.resetModules();
    document.cookie = 'nius_consent=; max-age=0; path=/';
    localStorage.clear();
    history.pushState({}, '', '/en/?ref=A#x');
  });

  it('registers LCP, INP and CLS after consent and reports with a clean path', async () => {
    setConsent('accepted');
    await run();
    expect(vitals.onLCP).toHaveBeenCalledOnce();
    expect(vitals.onINP).toHaveBeenCalledOnce();
    expect(vitals.onCLS).toHaveBeenCalledOnce();

    const report = vitals.onLCP.mock.calls[0][0];
    report({ name: 'LCP', value: 1234, rating: 'good' });
    expect(analytics.track).toHaveBeenCalledWith('web_vital', {
      name: 'LCP',
      value: 1234,
      rating: 'good',
      page_path: '/en/',
    });
  });

  it.each([[null], ['rejected' as const]])('does not import web-vitals with consent %s', async (consent) => {
    if (consent) setConsent(consent);
    await run();
    expect(vitals.loaded).not.toHaveBeenCalled();
  });
});
