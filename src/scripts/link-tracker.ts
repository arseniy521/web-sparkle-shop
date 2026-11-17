import {
  CONVERSION_CTAS,
  CONVERSION_SOURCES,
  flushAnalyticsWithin,
  trackCtaClick,
  trackedEvents,
} from '@/scripts/analytics';
import type { ConversionCta, ConversionSource } from '@/scripts/analytics';

/** The longest a tracked link click holds the navigation while its event is uploaded. */
const NAVIGATION_HOLD_MS = 300;

const isCta = (value: string | undefined): value is ConversionCta =>
  CONVERSION_CTAS.some((cta) => cta === value);
const isSource = (value: string | undefined): value is ConversionSource =>
  CONVERSION_SOURCES.some((source) => source === value);

/**
 * Whether the browser's default action for this click replaces the current document in this tab.
 * Modified and non-primary clicks, other targets, downloads, non-web schemes (tel:, mailto:) and
 * fragment links within the same document keep their native behaviour.
 */
function unloadsPage(event: MouseEvent, anchor: HTMLAnchorElement): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if ((anchor.target && anchor.target.toLowerCase() !== '_self') || anchor.hasAttribute('download')) return false;
  // location.assign ignores the link's referrer protection, so such a link must navigate natively.
  if (anchor.relList.contains('noreferrer') || anchor.hasAttribute('referrerpolicy')) return false;
  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  const sameDocument = url.href.split('#')[0] === window.location.href.split('#')[0];
  return !(sameDocument && anchor.href.includes('#'));
}

/**
 * Tracks phone/WhatsApp links and links marked with data-cta, on every page.
 *
 * A click that was tracked (here or by a link's own listener) and leaves the page would lose its
 * event: the SDK uploads on a timer and the page is gone first. Such a click is held until the
 * upload is done, at most NAVIGATION_HOLD_MS, and then followed. Only with a loaded, opted-in SDK.
 */
export function initLinkTracker(navigate: (url: string) => void = (url) => window.location.assign(url)): void {
  let trackedBefore = 0;
  document.addEventListener(
    'click',
    () => {
      trackedBefore = trackedEvents();
    },
    true,
  );

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

    if (trackedEvents() > trackedBefore && unloadsPage(event, anchor)) {
      event.preventDefault();
      const url = anchor.href;
      void flushAnalyticsWithin(NAVIGATION_HOLD_MS).then(() => navigate(url));
    }
  });
}
