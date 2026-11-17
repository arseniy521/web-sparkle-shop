import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dataLayerEntries,
  googleEvents,
  resetConsentPage,
  runInlineConsentScript,
} from '../../../tests/fixtures/consent-page.ts';
import type { CartService } from '@/scripts/cart-catalog';

// Port of the old site's useOnboardingForm.conversion.test.tsx (commit afec6e8).

const api = vi.hoisted(() => ({ createOrder: vi.fn() }));

vi.mock('@amplitude/analytics-browser', () => ({ init: vi.fn(), setOptOut: vi.fn(), track: vi.fn() }));
vi.mock('./api/onboarding', async () => ({
  ...(await vi.importActual<typeof import('./api/onboarding')>('./api/onboarding')),
  createOrder: api.createOrder,
}));

const ADS_ID = 'AW-0000000000';
const LEAD_LABEL = 'synthetic-label';

// Synthetic visitor data: none of it may reach Google.
const PHONE = '+420601000000';
const ADDRESS = 'Synthetic Street 1, Praha';
const FLOOR = 'synthetic-floor-7';
const INTERCOM = 'Synthetic Name';
const NOTE = 'synthetic note about health';
const ACCESS_TOKEN = 'access-token-synthetic';

const service = (code: string, priceCzk: number): CartService => ({
  id: code,
  code,
  serviceUuid: `uuid-${code}`,
  nameKey: `serviceCatalog.${code}.title`,
  displayNameFallback: code,
  hintKey: `serviceCatalog.${code}.description`,
  hintFallback: null,
  priceCzk,
  durationMin: 45,
  iconKey: 'drip',
  kind: 'standard',
});
const CATALOG = [service('immunity_lite', 2900), service('b12_energy_shot', 650)];
const CODES = ['immunity_lite', 'b12_energy_shot'];

const createdOrder = (id: string) => ({
  id,
  status: 'DRAFT',
  phone: PHONE,
  address: ADDRESS,
  addressFloor: FLOOR,
  addressIntercom: INTERCOM,
  desiredTiming: 'ASAP',
  desiredDate: null,
  paymentPreference: null,
  patientNote: NOTE,
  items: [],
  totalHalers: 355000,
  currency: 'CZK',
  accessToken: ACCESS_TOKEN,
  linked: false,
});

const leadPayload = (orderId: string) => ({
  transaction_id: orderId,
  currency: 'CZK',
  value: 3550,
  service_codes: 'immunity_lite,b12_energy_shot',
});
const leadEvents = (orderId: string) => [
  ['event', 'generate_lead', leadPayload(orderId)],
  ['event', 'conversion', { send_to: `${ADS_ID}/${LEAD_LABEL}`, ...leadPayload(orderId) }],
];

let unmountForm: (() => void) | undefined;

/** One page load with consent given, and the order form filled in up to the last step. */
const loadFilledForm = async (phone = PHONE) => {
  resetConsentPage({ cookie: 'accepted' });
  sessionStorage.clear();
  runInlineConsentScript();
  vi.resetModules();

  const { act, cleanup, renderHook } = await import('@testing-library/react');
  const { initGoogleIfConsented } = await import('@/scripts/ga');
  const { OnboardingApiError } = await import('./api/onboarding');
  const { useOnboardingForm } = await import('./useOnboardingForm');

  initGoogleIfConsented();
  const hook = renderHook(() =>
    useOnboardingForm({
      catalog: CATALOG,
      catalogReady: true,
      open: true,
      initialServiceCodes: CODES,
      analyticsSource: 'service_catalog',
    }),
  );
  unmountForm = cleanup;

  await act(async () => {
    hook.result.current.setFields({
      phone,
      address: ADDRESS,
      addressFloor: FLOOR,
      addressIntercom: INTERCOM,
      desiredTiming: 'ASAP',
      patientNote: NOTE,
    });
  });

  const submit = async () => {
    let created = false;
    await act(async () => {
      created = await hook.result.current.submitPhoneAndCreate();
    });
    return created;
  };
  const rerenderForm = async () => {
    hook.rerender();
    await act(async () => {
      hook.result.current.setField('patientNote', `${NOTE} edited`);
    });
    hook.rerender();
  };

  return { hook, submit, rerenderForm, OnboardingApiError };
};

describe('order form: conversion sent to Google', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_ADS_ID', ADS_ID);
    vi.stubEnv('VITE_GOOGLE_ADS_LEAD_LABEL', LEAD_LABEL);
  });

  afterEach(() => {
    unmountForm?.();
    unmountForm = undefined;
    vi.unstubAllEnvs();
    resetConsentPage();
    sessionStorage.clear();
  });

  it('fires once for a created order, with the order id and without any personal data', async () => {
    api.createOrder.mockResolvedValue(createdOrder('order-synthetic-1'));
    const form = await loadFilledForm();

    expect(await form.submit()).toBe(true);

    expect(api.createOrder).toHaveBeenCalledTimes(1);
    expect(api.createOrder.mock.calls[0][0]).toMatchObject({ phone: PHONE, address: ADDRESS, patientNote: NOTE });
    expect(form.hook.result.current.orderId).toBe('order-synthetic-1');
    // The complete list of Google events with their complete payloads.
    expect(googleEvents()).toEqual(leadEvents('order-synthetic-1'));

    await form.rerenderForm();

    expect(googleEvents()).toEqual(leadEvents('order-synthetic-1'));

    const sentToGoogle = JSON.stringify(dataLayerEntries());
    for (const secret of [PHONE, PHONE.slice(1), ADDRESS, FLOOR, INTERCOM, NOTE, ACCESS_TOKEN]) {
      expect(sentToGoogle).not.toContain(secret);
    }
  });

  it('does not fire when the order is not created', async () => {
    const form = await loadFilledForm();
    api.createOrder.mockRejectedValue(new form.OnboardingApiError('server', 500));

    expect(await form.submit()).toBe(false);
    await form.rerenderForm();

    expect(api.createOrder).toHaveBeenCalledTimes(1);
    expect(form.hook.result.current.orderId).toBeNull();
    expect(googleEvents()).toEqual([]);
  });

  it('fires once when the order is created on a retry after a failure', async () => {
    const form = await loadFilledForm();
    api.createOrder
      .mockRejectedValueOnce(new form.OnboardingApiError('network', 0))
      .mockResolvedValueOnce(createdOrder('order-synthetic-2'));

    expect(await form.submit()).toBe(false);
    expect(await form.submit()).toBe(true);
    await form.rerenderForm();

    expect(googleEvents()).toEqual(leadEvents('order-synthetic-2'));
  });

  it('does not fire when the form is not valid and no order request is made', async () => {
    const form = await loadFilledForm('+4206');

    expect(await form.submit()).toBe(false);

    expect(api.createOrder).not.toHaveBeenCalled();
    expect(googleEvents()).toEqual([]);
  });
});
