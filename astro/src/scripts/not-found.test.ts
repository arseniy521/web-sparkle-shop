import { beforeEach, describe, expect, it, vi } from 'vitest';

const analytics = vi.hoisted(() => ({ track: vi.fn(), initAnalyticsIfConsented: vi.fn() }));
vi.mock('@/scripts/analytics', async () => {
  const actual = await vi.importActual<typeof import('./analytics')>('./analytics');
  return { ...analytics, cleanPath: actual.cleanPath };
});

const setLocation = (path: string) => history.pushState({}, '', path);
const setReferrer = (value: string) =>
  Object.defineProperty(document, 'referrer', { value, configurable: true });

describe('not found', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('sends page_not_found with clean paths', async () => {
    setLocation('/old-page/?utm_source=x');
    setReferrer(`${window.location.origin}/en/?a=1#b`);
    await import('./not-found');
    expect(analytics.initAnalyticsIfConsented).toHaveBeenCalledOnce();
    expect(analytics.track).toHaveBeenCalledWith('page_not_found', {
      page_path: '/old-page/',
      referrer_path: '/en/',
    });
  });

  it('omits referrer_path for another origin', async () => {
    setLocation('/old-page/');
    setReferrer('https://google.com/search?q=nius');
    await import('./not-found');
    expect(analytics.track).toHaveBeenCalledWith('page_not_found', { page_path: '/old-page/' });
  });

  it('omits referrer_path without a referrer', async () => {
    setLocation('/old-page/');
    setReferrer('');
    await import('./not-found');
    expect(analytics.track).toHaveBeenCalledWith('page_not_found', { page_path: '/old-page/' });
  });
});
