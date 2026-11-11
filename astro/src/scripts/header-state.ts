import { track, trackCtaClick, type ConversionSource } from '@/scripts/analytics';
import { accountHref, authStatus } from '@/scripts/auth-status';
import { cart } from '@/scripts/cart-core';

const ACCOUNT_READY_CLASSES: Record<string, string[]> = {
  header: [
    'hover:bg-[rgba(21,63,77,0.06)]',
    'hover:text-[var(--color-indigo)]',
    'transition-colors',
  ],
  mobile_menu: ['hover:text-[var(--color-indigo)]', 'transition-colors'],
};

function renderCartCount() {
  const count = cart.getState().codes.length;
  for (const badge of document.querySelectorAll<HTMLElement>('[data-cart-count]')) {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }
}

function renderAccountLinks() {
  const href = accountHref(authStatus.get(), window.location);
  if (href === null) return;
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-account-link]')) {
    link.setAttribute('href', href);
    link.removeAttribute('aria-disabled');
    link.classList.remove('opacity-60', 'cursor-wait');
    link.classList.add(...(ACCOUNT_READY_CLASSES[link.dataset.accountLink ?? ''] ?? []));
  }
}

export function initHeaderState(): void {
  renderCartCount();
  cart.subscribe(renderCartCount);

  for (const button of document.querySelectorAll<HTMLElement>('[data-open-cart]')) {
    button.addEventListener('click', () => {
      const source = button.dataset.openCart as ConversionSource;
      trackCtaClick('cart', source, { cart_items_count: cart.getState().codes.length });
      cart.openForm(source);
    });
  }

  renderAccountLinks();
  authStatus.subscribe(renderAccountLinks);
  for (const link of document.querySelectorAll<HTMLElement>('[data-account-link]')) {
    link.addEventListener('click', () => {
      if (link.hasAttribute('aria-disabled')) return;
      trackCtaClick('account', link.dataset.accountLink as ConversionSource, {
        authenticated: authStatus.get() === 'authenticated',
      });
    });
  }

  for (const link of document.querySelectorAll<HTMLElement>('[data-lang-switch]')) {
    link.addEventListener('click', () => {
      const from = document.documentElement.lang;
      const to = link.dataset.lang;
      if (!to || to === from) return;
      track('language_changed', {
        from_language: from,
        to_language: to,
        source: link.dataset.langSwitch,
      });
    });
  }
}
