import { beforeEach, describe, expect, it, vi } from 'vitest';
import { track, trackCtaClick } from '@/scripts/analytics';
import { cart, installCartBridge } from './cart-core';
import { loadDraft } from './draft';

vi.mock('@/scripts/analytics', () => ({ track: vi.fn(), trackCtaClick: vi.fn() }));

const KEY = 'nius_onboarding_draft_v2';

function addFromMenu(detail: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent('nius:add-to-cart', { detail }));
}

function changeQuantity(detail: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent('nius:change-cart-quantity', { detail }));
}

installCartBridge();

beforeEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  cart.clear();
  vi.clearAllMocks();
});

describe('menu to cart bridge', () => {
  it('persists a quick add without opening the form or doubling the quantity on repeated taps', () => {
    addFromMenu({ code: 'immunity-power', source: 'service_catalog' });
    addFromMenu({ code: 'immunity_power', source: 'service_catalog' });

    expect(cart.getState()).toMatchObject({ codes: ['immunity_power'], open: false });
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
    const unsubscribe = cart.subscribe(listener);
    addFromMenu({
      code: 'immunity_power', source: 'service_modal',
      boosterCodes: ['vitamin-d-shot', 'b12_energy_shot', 'vitamin_d_shot', 'immunity_power', null],
    });
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(cart.getState().codes).toEqual(['immunity_power', 'vitamin_d_shot', 'b12_energy_shot']);
    expect(trackCtaClick).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('cart_service_added', {
      service_code: 'vitamin_d_shot', source: 'service_modal', is_addon: true,
    });
  });

  it('adds new boosters from a selected service without duplicating the base service', () => {
    cart.setCodes(['immunity_power']);
    addFromMenu({
      code: 'immunity_power',
      source: 'service_modal',
      boosterCodes: ['vitamin_d_shot', 'vitamin_d_shot', 'immunity_power'],
    });

    expect(cart.getState().codes).toEqual(['immunity_power', 'vitamin_d_shot']);
    expect(loadDraft()?.codes).toEqual(['immunity_power', 'vitamin_d_shot']);
    expect(trackCtaClick).toHaveBeenCalledExactlyOnceWith('add_to_cart', 'service_modal', {
      service_code: 'immunity_power', booster_count: 1,
    });
    expect(track).toHaveBeenCalledExactlyOnceWith('cart_service_added', {
      service_code: 'vitamin_d_shot', source: 'service_modal', is_addon: true,
    });
  });

  it('opens the existing cart explicitly without adding another service', () => {
    cart.setCodes(['immunity_power', 'immunity_power']);
    window.dispatchEvent(new CustomEvent('nius:open-cart', { detail: { source: 'service_catalog' } }));

    expect(cart.getState()).toMatchObject({
      codes: ['immunity_power', 'immunity_power'], open: true, openSource: 'service_catalog',
    });
  });

  it('allows adding a removed service again and preserves explicit quantities from the form', () => {
    addFromMenu({ code: 'immunity_power' });
    cart.setCodes([]);
    addFromMenu({ code: 'immunity_power' });
    cart.setCodes(['immunity_power', 'immunity_power']);

    expect(loadDraft()?.codes).toEqual(['immunity_power', 'immunity_power']);
    expect(trackCtaClick).toHaveBeenCalledTimes(2);
  });

  it('increments and decrements from the catalog stepper without opening the form', () => {
    addFromMenu({ code: 'immunity_power', source: 'service_catalog' });
    changeQuantity({ code: 'immunity_power', source: 'service_catalog', delta: 1 });

    expect(cart.getState()).toMatchObject({
      codes: ['immunity_power', 'immunity_power'],
      open: false,
    });
    expect(loadDraft()?.codes).toEqual(['immunity_power', 'immunity_power']);
    expect(track).toHaveBeenCalledWith('cart_service_added', {
      service_code: 'immunity_power', source: 'service_catalog',
    });

    changeQuantity({ code: 'immunity_power', source: 'service_catalog', delta: -1 });

    expect(cart.getState().codes).toEqual(['immunity_power']);
    expect(loadDraft()?.codes).toEqual(['immunity_power']);
    expect(track).toHaveBeenCalledWith('cart_service_removed', {
      service_code: 'immunity_power', source: 'service_catalog',
    });
  });

  it('removes the last copy from the catalog stepper and decrements only one matching code', () => {
    cart.setCodes(['immunity_power', 'pure_hydrate', 'immunity_power']);
    changeQuantity({ code: 'immunity_power', source: 'service_catalog', delta: -1 });
    expect(cart.getState().codes).toEqual(['immunity_power', 'pure_hydrate']);

    changeQuantity({ code: 'immunity_power', source: 'service_catalog', delta: -1 });
    expect(cart.getState().codes).toEqual(['pure_hydrate']);
    expect(loadDraft()?.codes).toEqual(['pure_hydrate']);
  });

  it('ignores invalid quantity deltas and does not decrement a missing item', () => {
    addFromMenu({ code: 'immunity_power' });
    changeQuantity({ code: 'immunity_power', delta: 2 });
    changeQuantity({ code: 'immunity_power', delta: 0 });
    changeQuantity({ code: 'immunity_power', delta: '-1' });
    changeQuantity({ code: 'immunity_power' });

    expect(cart.getState().codes).toEqual(['immunity_power']);

    cart.setCodes([]);
    vi.clearAllMocks();
    changeQuantity({ code: 'immunity_power', delta: -1 });

    expect(cart.getState().codes).toEqual([]);
    expect(track).not.toHaveBeenCalled();
  });
});

describe('draft persistence', () => {
  it('keeps the storage key and shape of the old site', () => {
    cart.setCodes(['iv-immunity-lite']);
    const raw = JSON.parse(sessionStorage.getItem(KEY)!);
    expect(Object.keys(raw).sort()).toEqual(['codes', 'data', 'savedAt']);
  });

  it('reads a draft written by the old site', () => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ codes: ['immunity_power'], data: { phone: '+420 600 000 000' }, savedAt: Date.now() }),
    );
    cart.reloadFromStorage();
    expect(cart.getState().codes).toEqual(['immunity_power']);
  });

  it('drops a draft older than 24 hours', () => {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ codes: ['immunity_power'], data: {}, savedAt: Date.now() - 25 * 60 * 60 * 1000 }),
    );
    cart.reloadFromStorage();
    expect(cart.getState().codes).toEqual([]);
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('ignores a corrupted draft', () => {
    sessionStorage.setItem(KEY, '{"codes":[1,null,"a"],"savedAt":' + Date.now() + ',"x":1}');
    cart.reloadFromStorage();
    expect(cart.getState().codes).toEqual(['a']);
    sessionStorage.setItem(KEY, '{oops');
    cart.reloadFromStorage();
    expect(cart.getState().codes).toEqual([]);
  });

  it('works in memory when storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(() => cart.setCodes(['a'])).not.toThrow();
    expect(cart.getState().codes).toEqual(['a']);
  });

  it('clears cart and draft after a completed order', () => {
    cart.setCodes(['a']);
    cart.clearItems();
    expect(cart.getState().codes).toEqual([]);
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });
});

describe('cart bridge', () => {
  it('writes cart-codes on the menu section of nius-menu at every change', () => {
    document.body.innerHTML = '<nius-menu section="menu"></nius-menu><nius-menu section="packages"></nius-menu>';
    installCartBridge();
    cart.setCodes(['a', 'a']);
    expect(document.querySelector('[section="menu"]')!.getAttribute('cart-codes')).toBe('["a","a"]');
    expect(document.querySelector('[section="packages"]')!.hasAttribute('cart-codes')).toBe(false);
  });

  it('resyncs from storage when the page comes back from bfcache', () => {
    installCartBridge();
    sessionStorage.setItem(KEY, JSON.stringify({ codes: ['a', 'b'], data: {}, savedAt: Date.now() }));
    const event = new Event('pageshow');
    Object.defineProperty(event, 'persisted', { value: true });
    window.dispatchEvent(event);
    expect(cart.getState().codes).toEqual(['a', 'b']);
  });

  it('is safe on a page without nius-menu and can be installed twice', () => {
    expect(() => {
      installCartBridge();
      installCartBridge();
    }).not.toThrow();
    addFromMenu({ code: 'immunity_power' });
    expect(cart.getState().codes).toEqual(['immunity_power']);
  });
});
