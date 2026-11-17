import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createOrder } from './onboarding';
import { captureReferral, resetReferralForTests } from '@/scripts/referral';

const orderResponse = {
  id: 'o1', status: 'DRAFT', phone: null, address: null, addressFloor: null,
  addressIntercom: null, desiredTiming: null, desiredDate: null,
  paymentPreference: null, patientNote: null, items: [], totalHalers: 0, currency: 'CZK',
};

describe('createOrder referral', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    resetReferralForTests();
    document.cookie = 'nius_ref=; max-age=0; path=/';
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(JSON.stringify(orderResponse), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const body = () => fetchMock.mock.calls[0][1].body as string;

  it('includes referralCode when present', async () => {
    captureReferral('?ref=K7M2QX');
    await createOrder({ phone: '+420777000000', items: [] });
    expect(body()).toContain('"referralCode":"K7M2QX"');
  });

  it('omits referralCode when absent', async () => {
    await createOrder({ phone: '+420777000000', items: [] });
    expect(body()).not.toContain('referralCode');
  });
});
