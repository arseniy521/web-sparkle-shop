import { trackCtaClick } from '@/scripts/analytics';
import { cart } from '@/scripts/cart-core';

/**
 * The bottom bar on phones of the home page and the drips page (port of
 * old:src/components/MobileStickyBar.tsx).
 *
 * It slides in once the hero (#home) leaves the viewport and is not displayed while the order
 * form or a catalog service dialog (`nius:service-modal`) is open. With an empty cart its button
 * scrolls to the catalog and is not shown over the catalog; with a cart it names the cart and the
 * number of services and opens the form. The total under the label is rendered by StickyTotal
 * from the order form code. Whether the bar is displayed at all is CSS (`--sticky-bar-display`).
 */
// The fixed header covers this much of the top of the screen; MenuSection.astro leaves the same
// room above the catalog (scroll-margin-top), so a hero left only under the header counts as gone.
const HEADER_COVER_PX = 88;

export function initStickyBar(): void {
  const bar = document.querySelector<HTMLElement>('[data-mobile-sticky]');
  const button = bar?.querySelector<HTMLButtonElement>('[data-sticky-main]');
  const label = bar?.querySelector<HTMLElement>('[data-sticky-label]');
  const whatsapp = bar?.querySelector<HTMLAnchorElement>('a[href]');
  if (!bar || !button || !label || bar.dataset.stickyReady) return;
  bar.dataset.stickyReady = 'true';

  let visible = false;
  let inCatalog = false;
  let serviceModalOpen = false;

  function render() {
    const { codes, open } = cart.getState();
    bar!.classList.toggle('translate-y-0', visible);
    bar!.classList.toggle('translate-y-full', !visible);
    bar!.style.display = serviceModalOpen || open ? 'none' : 'var(--sticky-bar-display, none)';
    button!.hidden = !(codes.length > 0 || !inCatalog);
    label!.textContent =
      codes.length > 0 ? `${button!.dataset.labelCart} (${codes.length}) →` : (button!.dataset.labelChoose ?? '');
    for (const control of [button!, whatsapp]) {
      if (!control) continue;
      if (visible) control.removeAttribute('tabindex');
      else control.setAttribute('tabindex', '-1');
    }
  }

  const hero = document.querySelector('#home');
  const menu = document.querySelector('#menu');
  if (hero && typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(([entry]) => {
      visible = !entry.isIntersecting;
      render();
    }, { threshold: 0, rootMargin: `-${HEADER_COVER_PX}px 0px 0px 0px` }).observe(hero);
    if (menu) {
      new IntersectionObserver(([entry]) => {
        inCatalog = entry.isIntersecting;
        render();
      }, { threshold: 0 }).observe(menu);
    }
  }

  window.addEventListener('nius:service-modal', (event) => {
    serviceModalOpen = (event as CustomEvent<{ open?: boolean }>).detail?.open === true;
    render();
  });
  cart.subscribe(render);

  button.addEventListener('click', () => {
    const { codes } = cart.getState();
    if (codes.length > 0) {
      trackCtaClick('cart', 'mobile_sticky', { cart_items_count: codes.length });
      cart.openForm('mobile_sticky');
      return;
    }
    trackCtaClick('choose_service', 'mobile_sticky');
    document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
  });

  render();
}
