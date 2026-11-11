import * as amplitude from '@amplitude/analytics-browser';
import i18n from '@/i18n/config';
import { getConsent } from '@/lib/consent';

/**
 * Amplitude wrapper for the landing (www.nius.cz).
 *
 * Privacy rules (see nius/docs/analytics.md — PHI policy):
 * - initialized only after cookie-banner consent (nius-cookie-consent);
 * - US server zone (the project and its API key live in the US region), no IP capture,
 *   no form/element autocapture;
 * - never pass phone/address/name/note or onboarding access tokens as props.
 *
 * The device_id cookie is scoped to `.nius.cz` so the journey continues
 * seamlessly on app.nius.cz (same Amplitude project).
 */

const API_KEY = (import.meta.env.VITE_AMPLITUDE_API_KEY as string | undefined)?.trim();

let initialized = false;

const hasConsent = (): boolean => getConsent() === 'accepted';

const init = () => {
  if (!API_KEY || initialized) return;
  amplitude.init(API_KEY, {
    serverZone: 'US',
    autocapture: {
      pageViews: true,
      sessions: true,
      attribution: true,
      elementInteractions: false,
      formInteractions: false,
      fileDownloads: false,
    },
    trackingOptions: { ipAddress: false },
    cookieOptions: import.meta.env.PROD ? { domain: '.nius.cz' } : undefined,
  });
  initialized = true;
};

/** Call once on app start: initializes only if consent was already given. */
export const initAnalyticsIfConsented = () => {
  if (hasConsent()) init();
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __niusGrantConsent?: () => void;
    __niusLoadGtag?: () => void;
  }
}

const GOOGLE_ADS_ID = (import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined)?.trim();
const GOOGLE_ADS_LEAD_LABEL = (import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL as string | undefined)?.trim();

/** Consent Mode v2: grant Google tags after "Accept" and register the Ads account (if configured). */
const grantGoogleConsent = () => {
  if (typeof window === 'undefined') return;
  window.__niusGrantConsent?.();
  if (GOOGLE_ADS_ID && window.gtag) window.gtag('config', GOOGLE_ADS_ID);
};

/** Consent Mode v2: explicit denial after "Reject". */
const denyGoogleConsent = () => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
};

/**
 * Sends a conversion-style event to Google tags. No-op without consent.
 * Never pass PHI: only service codes, counts and values.
 */
export const trackGoogleEvent = (name: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !window.gtag || !hasConsent()) return;
  window.gtag('event', name, params);
};

/** Lead conversion: an onboarding order was created. */
export const trackLeadConversion = (props?: { value?: number; serviceCodes?: string[] }) => {
  const params = { currency: 'CZK', value: props?.value, service_codes: props?.serviceCodes?.join(',') };
  trackGoogleEvent('generate_lead', params);
  if (GOOGLE_ADS_ID && GOOGLE_ADS_LEAD_LABEL) {
    trackGoogleEvent('conversion', { send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}`, ...params });
  }
};

/** Cookie banner "Accept". */
export const enableAnalytics = () => {
  grantGoogleConsent();
  init();
  if (initialized) amplitude.setOptOut(false);
};

/** Cookie banner "Reject". */
export const disableAnalytics = () => {
  denyGoogleConsent();
  if (initialized) amplitude.setOptOut(true);
};

export const track = (event: string, props?: Record<string, unknown>) => {
  if (!initialized) return;
  amplitude.track(event, { language: i18n.language, ...props });
};

export const identifyUser = (userId: string) => {
  if (!initialized) return;
  amplitude.setUserId(userId);
  const identify = new amplitude.Identify();
  identify.set('language', i18n.language);
  amplitude.identify(identify);
};

export const flushAnalytics = async () => {
  if (!initialized) return;
  await amplitude.flush().promise;
};

export const setAnalyticsOptOut = (optOut: boolean) => {
  if (!initialized) return;
  amplitude.setOptOut(optOut);
};

export type ConversionCta =
  | 'choose_service'
  | 'view_service'
  | 'add_to_cart'
  | 'order_service'
  | 'cart'
  | 'account'
  | 'phone'
  | 'whatsapp';

export type ConversionSource =
  | 'header_navigation'
  | 'header_contact_menu'
  | 'header'
  | 'mobile_header'
  | 'mobile_menu'
  | 'hero'
  | 'mobile_sticky'
  | 'final_cta'
  | 'service_catalog'
  | 'service_modal'
  | 'package_card'
  | 'subscription_card'
  | 'booster'
  | 'footer'
  | 'floating_contact'
  | 'contacts_section'
  | 'order_form'
  | 'page_content';

/**
 * One normalized click event for the public conversion funnel.
 * Extra properties must remain non-PHI (for example service_code or cart_items_count).
 */
export const trackCtaClick = (
  cta: ConversionCta,
  source: ConversionSource,
  props?: Record<string, unknown>,
) => {
  const pagePath = typeof window === 'undefined' ? undefined : window.location.pathname;
  track('cta_clicked', { page_path: pagePath, ...props, cta, source });
  if (cta === 'phone' || cta === 'whatsapp') trackGoogleEvent('contact', { method: cta, source });
};
