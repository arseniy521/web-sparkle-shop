import { beforeEach, describe, expect, it, vi } from 'vitest';

const init = vi.fn();

vi.mock('@amplitude/analytics-browser', () => ({ init, setOptOut: vi.fn() }));
vi.mock('@/scripts/consent', () => ({ getConsent: () => 'accepted' }));

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'synthetic-key');
  });

  it('sends events to the US server zone of the Amplitude project', async () => {
    const { initAnalyticsIfConsented } = await import('./analytics');

    initAnalyticsIfConsented();

    expect(init).toHaveBeenCalledWith('synthetic-key', expect.objectContaining({ serverZone: 'US' }));
  });
});
