import { getConsent } from '@/scripts/consent';
import { sharedCookieDomain } from '@/scripts/cookie-domain';
import { GA_ID } from '@/scripts/gtag-bootstrap';

/**
 * Google tags (Analytics 4 and Ads). The Consent Mode bootstrap, the loader of gtag.js and the
 * grant on a page load with stored consent live in the inline `<head>` script
 * (`gtag-bootstrap.ts`); this module reacts to the banner and sends the site's events.
 *
 * Nothing is sent without consent. Never pass PHI: only service codes, counts, sums in CZK and
 * the order id.
 */

export { GA_ID };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __niusGrantConsent?: () => void;
    __niusLoadGtag?: () => void;
    __niusGtagLoaded?: boolean;
  }
}

const GOOGLE_ADS_ID = (import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined)?.trim();
const GOOGLE_ADS_LEAD_LABEL = (import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL as string | undefined)?.trim();

const DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
};

const consented = () => getConsent() === 'accepted';

let adsConfigured = false;
const reportedLeadOrders = new Set<string>();

/**
 * Registers the Ads account with the Google tag, once per page load and only with consent:
 * right after "Accept" and on a page load with stored consent. Without VITE_GOOGLE_ADS_ID, nothing.
 */
function configureGoogleAds(): void {
  if (adsConfigured || !GOOGLE_ADS_ID || !window.gtag || !consented()) return;
  window.gtag('config', GOOGLE_ADS_ID);
  adsConfigured = true;
}

/** Page start: the inline script has already granted Consent Mode; registers the Ads account. */
export function initGoogleIfConsented(): void {
  configureGoogleAds();
}

/** Cookie banner "Accept": grants Consent Mode, loads gtag.js once, registers the Ads account. */
export function grantGoogle(): void {
  // A refusal earlier on this page load switched GA off; switch it back on.
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = false;
  window.__niusGrantConsent?.();
  configureGoogleAds();
}

/** Cookie banner "Reject": denies every Consent Mode signal and switches GA off. */
export function denyGoogle(): void {
  window.gtag?.('consent', 'update', { ...DENIED });
  disableGa();
}

// Cookies the Google tags write with consent: Analytics (_ga*) and Ads (_gcl_*, written once the
// Ads account is configured with ad_storage granted).
const GOOGLE_COOKIES = ['_ga', '_ga_VNMLWF0XZG', '_gcl_au', '_gcl_aw', '_gcl_gs', '_gcl_dc'];

/** "Reject" and a stored rejection: the GA opt-out flag, and the Google cookies expire. */
export function disableGa(): void {
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = true;
  const domain = sharedCookieDomain();
  for (const name of GOOGLE_COOKIES) {
    const expired = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    document.cookie = `${expired};`;
    if (domain) document.cookie = `${expired}; domain=${domain}`;
  }
}

/** Sends an event to the Google tags. No-op without consent. */
export function trackGoogleEvent(name: string, params?: Record<string, unknown>): void {
  if (!window.gtag || !consented()) return;
  window.gtag('event', name, params);
}

/**
 * Lead conversion: an order was created in the form. Reported once per order; the order id goes
 * as `transaction_id` so that Google also drops repeats. The Ads conversion is sent only when both
 * the Ads id and the lead label are configured. Never pass the order access token or contact data.
 */
export function trackLeadConversion(props: { orderId: string; value: number; serviceCodes: string[] }): void {
  if (!window.gtag || !consented()) return;
  if (reportedLeadOrders.has(props.orderId)) return;
  reportedLeadOrders.add(props.orderId);
  const params = {
    transaction_id: props.orderId,
    currency: 'CZK',
    value: props.value,
    service_codes: props.serviceCodes.join(','),
  };
  trackGoogleEvent('generate_lead', params);
  if (GOOGLE_ADS_ID && GOOGLE_ADS_LEAD_LABEL) {
    trackGoogleEvent('conversion', { send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}`, ...params });
  }
}
