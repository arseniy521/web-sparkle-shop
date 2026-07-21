import * as amplitude from '@amplitude/analytics-browser';
import i18n from '@/i18n/config';
import { getConsent } from '@/lib/consent';

/**
 * Amplitude wrapper for the landing (www.nius.cz).
 *
 * Privacy rules (see nius/docs/analytics.md — PHI policy):
 * - initialized only after cookie-banner consent (nius-cookie-consent);
 * - EU server zone, no IP capture, no form/element autocapture;
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
    serverZone: 'EU',
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

/** Cookie banner "Accept". */
export const enableAnalytics = () => {
  init();
  if (initialized) amplitude.setOptOut(false);
};

/** Cookie banner "Reject". */
export const disableAnalytics = () => {
  if (initialized) amplitude.setOptOut(true);
};

export const track = (event: string, props?: Record<string, unknown>) => {
  if (!initialized) return;
  amplitude.track(event, { language: i18n.language, ...props });
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
};
