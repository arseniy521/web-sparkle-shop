import { track, trackCtaClick, type ConversionSource } from '@/scripts/analytics';
import { accountHref, authStatus } from '@/scripts/auth-status';
import { cart } from '@/scripts/cart-core';

function renderCartCount() {
  const count = cart.getState().codes.length;
  for (const badge of document.querySelectorAll<HTMLElement>('[data-cart-count]')) {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }
}

// The static HTML has the anonymous sign-in link; it stays until the status is known.
function renderAccountLinks() {
  const href = accountHref(authStatus.get(), window.location);
  if (href === null) return;
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-account-link]')) {
    link.setAttribute('href', href);
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
