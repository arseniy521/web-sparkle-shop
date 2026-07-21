import { useEffect } from 'react';
import { trackCtaClick, type ConversionSource } from '@/lib/analytics';

/** Tracks every regular phone/WhatsApp link, including CTAs on SEO landing pages. */
export const ConversionLinkTracker = () => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
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
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
};
