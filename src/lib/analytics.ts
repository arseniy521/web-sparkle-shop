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
