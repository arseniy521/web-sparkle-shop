import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FormModule } from './form-bridge';

vi.mock('@/scripts/analytics', () => ({ track: vi.fn(), trackCtaClick: vi.fn() }));
vi.mock('@/scripts/client-error', () => ({ reportClientError: vi.fn() }));

let cart: typeof import('./cart-core').cart;
let initFormBridge: typeof import('./form-bridge').initFormBridge;
let reportClientError: typeof import('./client-error').reportClientError;
let mount: ReturnType<typeof vi.fn<FormModule['mountOrderForm']>>;
let load: ReturnType<typeof vi.fn<() => Promise<FormModule>>>;
let resolveLoad: () => void;
let rejectLoad: (error: Error) => void;
const idle = vi.fn<(cb: () => void) => void>();

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

function fallback() {
  return document.getElementById('order-form-fallback')!;
}

beforeEach(async () => {
  vi.resetModules();
  sessionStorage.clear();
  document.documentElement.lang = 'cs';
  document.body.innerHTML = `
    <button data-open-cart="header"></button>
    <div id="order-form-root"></div>
    <div id="order-form-fallback" role="alert" hidden></div>`;
  ({ cart } = await import('./cart-core'));
  ({ initFormBridge } = await import('./form-bridge'));
  ({ reportClientError } = await import('./client-error'));
  mount = vi.fn<FormModule['mountOrderForm']>().mockResolvedValue(undefined);
  load = vi.fn(
    () =>
      new Promise<FormModule>((resolve, reject) => {
        resolveLoad = () => resolve({ mountOrderForm: mount });
        rejectLoad = reject;
      }),
  );
});

describe('initFormBridge', () => {
  it('does not load the form without intent', () => {
    initFormBridge({ load, idle });
    expect(load).not.toHaveBeenCalled();
  });

  it('preloads on pointerenter, touchstart and focus of a cart button, once', () => {
    initFormBridge({ load, idle });
    const button = document.querySelector('[data-open-cart]')!;
    button.dispatchEvent(new Event('pointerenter'));
    button.dispatchEvent(new Event('touchstart'));
    button.dispatchEvent(new FocusEvent('focus'));
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('preloads when the catalog adds a service', () => {
    initFormBridge({ load, idle });
    window.dispatchEvent(new CustomEvent('nius:add-to-cart', { detail: { code: 'iv-immunity-lite' } }));
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('opens the form after a click that came before the code was loaded', async () => {
    initFormBridge({ load, idle });
    cart.openForm('header');
    expect(mount).not.toHaveBeenCalled();
    resolveLoad();
    await flushPromises();
    expect(mount).toHaveBeenCalledWith(document.getElementById('order-form-root'), 'cs');
    expect(cart.getState().open).toBe(true);
  });

  it('mounts once for a double click', async () => {
    initFormBridge({ load, idle });
    cart.openForm('header');
    cart.openForm('header');
    resolveLoad();
    await flushPromises();
    expect(mount).toHaveBeenCalledTimes(1);
  });

  it('shows the fallback and reports client_error when loading fails, then retries', async () => {
    initFormBridge({ load, idle });
    cart.openForm('header');
    rejectLoad(new Error('net'));
    await flushPromises();
    expect(fallback().hidden).toBe(false);
    expect(reportClientError).toHaveBeenCalledWith('order_form', expect.any(Error));
    expect(cart.getState().open).toBe(false);
    cart.openForm('header');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('loads in idle time when the cart is not empty', () => {
    cart.setCodes(['immunity_lite']);
    initFormBridge({ load, idle: (cb) => cb() });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('does not load in idle time for an empty cart', () => {
    initFormBridge({ load, idle: (cb) => cb() });
    expect(load).not.toHaveBeenCalled();
  });
});
