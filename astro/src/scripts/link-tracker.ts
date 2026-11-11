import { trackCtaClick } from '@/scripts/analytics';
import type { ConversionCta, ConversionSource } from '@/scripts/analytics';

/** Tracks phone/WhatsApp links and links marked with data-cta, on every page. */
export function initLinkTracker(): void {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const href = anchor.getAttribute('href')?.trim() ?? '';
    const source = (anchor.dataset.analyticsSource || 'page_content') as ConversionSource;

    if (href.toLowerCase().startsWith('tel:')) {
      trackCtaClick('phone', source);
    } else if (/^https?:\/\/(?:www\.)?wa\.me\//i.test(href)) {
      trackCtaClick('whatsapp', source);
    } else if (anchor.dataset.cta) {
      trackCtaClick(anchor.dataset.cta as ConversionCta, source);
    }
  });
}
