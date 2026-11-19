import { CONVERSION_SOURCES, flushAnalyticsWithin, trackCtaClick, type ConversionSource } from '@/scripts/analytics';
import { cart } from '@/scripts/cart-core';

// As in link-tracker.ts: the click event gets this long to upload before the page is left.
const NAVIGATION_HOLD_MS = 300;

const isSource = (value: string | undefined): value is ConversionSource =>
  CONVERSION_SOURCES.some((source) => source === value);

/**
 * `BookingLink.astro` (old `src/components/BookingLink.tsx`): an unmodified primary click opens
 * the in-site order form instead of the app's form at the link's address; with
 * `data-service-code` it orders that service first. Without a service and with an empty cart the
 * form would be a dead end, so the click leads to the service menu: it scrolls to `#menu` of this
 * page or, on a page without the menu, goes to `data-menu-href` (the home page menu). Modified
 * and non-primary clicks follow the link. Bound once at start, like `[data-open-cart]`: a link
 * created later gets no handler.
 */
export function initBookingLinks(navigate: (url: string) => void = (url) => window.location.assign(url)): void {
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-open-form]')) {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      const source = isSource(link.dataset.openForm) ? link.dataset.openForm : 'page_content';
      const serviceCode = link.dataset.serviceCode?.trim();
      trackCtaClick('choose_service', source, serviceCode ? { service_code: serviceCode } : undefined);
      if (serviceCode) {
        cart.order(serviceCode, source);
        return;
      }
      if (cart.getState().codes.length > 0) {
        cart.openForm(source);
        return;
      }
      const menu = document.getElementById('menu');
      if (menu) {
        menu.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const menuHref = link.dataset.menuHref;
      if (menuHref) void flushAnalyticsWithin(NAVIGATION_HOLD_MS).then(() => navigate(menuHref));
      else cart.openForm(source);
    });
  }
}
