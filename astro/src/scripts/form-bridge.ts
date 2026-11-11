import { cart } from '@/scripts/cart-core';
import { reportClientError } from '@/scripts/client-error';
import type { Lang } from '@/routes/types';

export interface FormModule {
  mountOrderForm(root: HTMLElement, lang: Lang): Promise<void>;
}

const loadForm = (): Promise<FormModule> => import('@/islands/order-form/mount');

function whenIdle(cb: () => void): void {
  if ('requestIdleCallback' in window) requestIdleCallback(() => cb());
  else setTimeout(cb, 1500);
}

export function initFormBridge({
  load = loadForm,
  idle = whenIdle,
}: { load?: () => Promise<FormModule>; idle?: (cb: () => void) => void } = {}): void {
  const root = document.getElementById('order-form-root');
  const fallback = document.getElementById('order-form-fallback');
  if (!root) return;

  let loading: Promise<FormModule> | null = null;
  let mounting: Promise<void> | null = null;

  const preload = (): Promise<FormModule> => {
    loading ??= load().catch((error: unknown) => {
      loading = null;
      throw error;
    });
    return loading;
  };

  const preloadQuietly = () => {
    preload().catch(() => undefined);
  };

  const mount = () => {
    if (fallback) fallback.hidden = true;
    mounting = preload()
      .then((form) => form.mountOrderForm(root, document.documentElement.lang as Lang))
      .catch((error: unknown) => {
        mounting = null;
        reportClientError('order_form', error);
        if (fallback) fallback.hidden = false;
        cart.setOpen(false);
      });
  };

  cart.subscribe(() => {
    if (cart.getState().open && !mounting) mount();
  });

  for (const button of document.querySelectorAll('[data-open-cart]')) {
    for (const type of ['pointerenter', 'touchstart', 'focus']) {
      button.addEventListener(type, preloadQuietly, { passive: true });
    }
  }
  window.addEventListener('nius:add-to-cart', preloadQuietly);

  if (cart.getState().codes.length > 0) idle(preloadQuietly);
}
