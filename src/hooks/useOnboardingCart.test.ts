import { beforeEach, describe, expect, it, vi } from 'vitest';
import { track, trackCtaClick } from '@/lib/analytics';
import { onboardingCart } from './useOnboardingCart';
import { loadDraft } from '@/components/OnboardingForm/onboardingPersist';

vi.mock('@/lib/analytics', () => ({ track: vi.fn(), trackCtaClick: vi.fn() }));

function addFromMenu(detail: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent('nius:add-to-cart', { detail }));
}

function changeQuantity(detail: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent('nius:change-cart-quantity', { detail }));
}

beforeEach(() => {
  onboardingCart.clear();
  vi.clearAllMocks();
});

describe('menu to cart bridge', () => {
  it('persists a quick add without opening the form or doubling the quantity on repeated taps', () => {
    addFromMenu({ code: 'immunity-power', source: 'service_catalog' });
    addFromMenu({ code: 'immunity_power', source: 'service_catalog' });

    expect(onboardingCart.getState()).toMatchObject({ codes: ['immunity_power'], open: false });
    expect(loadDraft()?.codes).toEqual(['immunity_power']);
    expect(trackCtaClick).toHaveBeenCalledExactlyOnceWith('add_to_cart', 'service_catalog', {
      service_code: 'immunity_power', booster_count: 0,
    });
    expect(track).toHaveBeenCalledExactlyOnceWith('cart_service_added', {
      service_code: 'immunity_power', source: 'service_catalog', is_addon: false,
    });
  });

  it('adds a service and its boosters atomically while recording a single CTA click', () => {
    const listener = vi.fn();
    const unsubscribe = onboardingCart.subscribe(listener);
    addFromMenu({
      code: 'immunity_power', source: 'service_modal',
      boosterCodes: ['vitamin-d-shot', 'b12_energy_shot', 'vitamin_d_shot', 'immunity_power', null],
    });
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(onboardingCart.getState().codes).toEqual(['immunity_power', 'vitamin_d_shot', 'b12_energy_shot']);
    expect(trackCtaClick).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('cart_service_added', {
      service_code: 'vitamin_d_shot', source: 'service_modal', is_addon: true,
    });
  });

  it('adds new boosters from a selected service without duplicating the base service', () => {
    onboardingCart.setCodes(['immunity_power']);
    addFromMenu({
      code: 'immunity_power',
      source: 'service_modal',
      boosterCodes: ['vitamin_d_shot', 'vitamin_d_shot', 'immunity_power'],
    });

    expect(onboardingCart.getState().codes).toEqual(['immunity_power', 'vitamin_d_shot']);
    expect(loadDraft()?.codes).toEqual(['immunity_power', 'vitamin_d_shot']);
    expect(trackCtaClick).toHaveBeenCalledExactlyOnceWith('add_to_cart', 'service_modal', {
      service_code: 'immunity_power', booster_count: 1,
    });
    expect(track).toHaveBeenCalledExactlyOnceWith('cart_service_added', {
      service_code: 'vitamin_d_shot', source: 'service_modal', is_addon: true,
    });
  });

  it('opens the existing cart explicitly without adding another service', () => {
    onboardingCart.setCodes(['immunity_power', 'immunity_power']);
    window.dispatchEvent(new CustomEvent('nius:open-cart', { detail: { source: 'service_catalog' } }));

    expect(onboardingCart.getState()).toMatchObject({
      codes: ['immunity_power', 'immunity_power'], open: true, openSource: 'service_catalog',
    });
  });

  it('allows adding a removed service again and preserves explicit quantities from the form', () => {
    addFromMenu({ code: 'immunity_power' });
    onboardingCart.setCodes([]);
    addFromMenu({ code: 'immunity_power' });
    onboardingCart.setCodes(['immunity_power', 'immunity_power']);

    expect(loadDraft()?.codes).toEqual(['immunity_power', 'immunity_power']);
    expect(trackCtaClick).toHaveBeenCalledTimes(2);
  });

  it('increments and decrements from the catalog stepper without opening the form', () => {
    addFromMenu({ code: 'immunity_power', source: 'service_catalog' });
    changeQuantity({ code: 'immunity_power', source: 'service_catalog', delta: 1 });

    expect(onboardingCart.getState()).toMatchObject({
      codes: ['immunity_power', 'immunity_power'],
      open: false,
    });
    expect(loadDraft()?.codes).toEqual(['immunity_power', 'immunity_power']);
    expect(track).toHaveBeenCalledWith('cart_service_added', {
      service_code: 'immunity_power', source: 'service_catalog',
    });

    changeQuantity({ code: 'immunity_power', source: 'service_catalog', delta: -1 });

    expect(onboardingCart.getState().codes).toEqual(['immunity_power']);
    expect(loadDraft()?.codes).toEqual(['immunity_power']);
    expect(track).toHaveBeenCalledWith('cart_service_removed', {
      service_code: 'immunity_power', source: 'service_catalog',
    });
  });

  it('removes the last copy from the catalog stepper and decrements only one matching code', () => {
    onboardingCart.setCodes(['immunity_power', 'pure_hydrate', 'immunity_power']);
    changeQuantity({ code: 'immunity_power', source: 'service_catalog', delta: -1 });
    expect(onboardingCart.getState().codes).toEqual(['immunity_power', 'pure_hydrate']);

    changeQuantity({ code: 'immunity_power', source: 'service_catalog', delta: -1 });
    expect(onboardingCart.getState().codes).toEqual(['pure_hydrate']);
    expect(loadDraft()?.codes).toEqual(['pure_hydrate']);
  });

  it('ignores invalid quantity deltas and does not decrement a missing item', () => {
    addFromMenu({ code: 'immunity_power' });
    changeQuantity({ code: 'immunity_power', delta: 2 });
    changeQuantity({ code: 'immunity_power', delta: 0 });
    changeQuantity({ code: 'immunity_power', delta: '-1' });
    changeQuantity({ code: 'immunity_power' });

    expect(onboardingCart.getState().codes).toEqual(['immunity_power']);

    onboardingCart.setCodes([]);
    vi.clearAllMocks();
    changeQuantity({ code: 'immunity_power', delta: -1 });

    expect(onboardingCart.getState().codes).toEqual([]);
    expect(track).not.toHaveBeenCalled();
  });
});
