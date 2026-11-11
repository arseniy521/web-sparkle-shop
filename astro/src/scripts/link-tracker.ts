import { CONVERSION_CTAS, CONVERSION_SOURCES, trackCtaClick } from '@/scripts/analytics';
import type { ConversionCta, ConversionSource } from '@/scripts/analytics';

const isCta = (value: string | undefined): value is ConversionCta =>
  CONVERSION_CTAS.some((cta) => cta === value);
const isSource = (value: string | undefined): value is ConversionSource =>
  CONVERSION_SOURCES.some((source) => source === value);

/** Tracks phone/WhatsApp links and links marked with data-cta, on every page. */
export function initLinkTracker(): void {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;

    const href = anchor.getAttribute('href')?.trim() ?? '';
    const source = isSource(anchor.dataset.analyticsSource)
      ? anchor.dataset.analyticsSource
      : 'page_content';

    if (href.toLowerCase().startsWith('tel:')) {
      trackCtaClick('phone', source);
    } else if (/^https?:\/\/(?:www\.)?wa\.me\//i.test(href)) {
      trackCtaClick('whatsapp', source);
    } else if (isCta(anchor.dataset.cta)) {
      trackCtaClick(anchor.dataset.cta, source);
    }
  });
}
