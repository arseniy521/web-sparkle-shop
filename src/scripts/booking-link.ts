import { CONVERSION_SOURCES, trackCtaClick, type ConversionSource } from '@/scripts/analytics';
import { cart } from '@/scripts/cart-core';

const isSource = (value: string | undefined): value is ConversionSource =>
  CONVERSION_SOURCES.some((source) => source === value);

/**
 * `BookingLink.astro` (old `src/components/BookingLink.tsx`): an unmodified primary click opens
 * the in-site order form instead of the app's form at the link's address; with
 * `data-service-code` it orders that service first. Modified and non-primary clicks follow the
 * link. Bound once at start, like `[data-open-cart]`: a link created later gets no handler.
 */
export function initBookingLinks(): void {
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-open-form]')) {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      const source = isSource(link.dataset.openForm) ? link.dataset.openForm : 'page_content';
      const serviceCode = link.dataset.serviceCode?.trim();
      trackCtaClick('choose_service', source, serviceCode ? { service_code: serviceCode } : undefined);
      if (serviceCode) cart.order(serviceCode, source);
      else cart.openForm(source);
    });
  }
}
