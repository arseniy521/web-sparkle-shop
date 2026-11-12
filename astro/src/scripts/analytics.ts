import { getConsent } from '@/scripts/consent';
import { sharedCookieDomain } from '@/scripts/cookie-domain';

/**
 * Amplitude wrapper for the landing (www.nius.cz).
 *
 * Privacy rules (see nius/docs/analytics.md — PHI policy):
 * - the SDK is imported and initialized only after cookie-banner consent;
 *   events tracked before that are dropped, never queued;
 * - US server zone (the project and its API key live in the US region), no IP capture,
 *   no form/element autocapture;
 * - never pass phone/address/name/note or onboarding access tokens as props.
 *
 * The device_id cookie is scoped to `.nius.cz` so the journey continues
 * seamlessly on app.nius.cz (same Amplitude project).
 */

type Sdk = typeof import('@amplitude/analytics-browser');

const API_KEY = (import.meta.env.VITE_AMPLITUDE_API_KEY as string | undefined)?.trim();
const MAX_QUEUE = 50;

let state: 'idle' | 'loading' | 'ready' | 'failed' = 'idle';
let sdk: Sdk | undefined;
let loading: Promise<void> | undefined;
let queue: Array<(loaded: Sdk) => void> = [];
let pendingOptOut: boolean | undefined;
let optedOut = false;
let tracked = 0;

const run = (action: (loaded: Sdk) => void) => {
  if (state === 'ready' && sdk) action(sdk);
  else if (state === 'loading' && queue.length < MAX_QUEUE) queue.push(action);
};

const applyOptOut = (optOut: boolean) => {
  if (state === 'ready' && sdk) {
    sdk.setOptOut(optOut);
    optedOut = optOut;
  } else if (state === 'loading') pendingOptOut = optOut;
};

const init = () => {
  if (!API_KEY || state !== 'idle') return;
  state = 'loading';
  loading = import('@amplitude/analytics-browser')
    .then((loaded) => {
      loaded.init(API_KEY, {
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
        // LogLevel.None: a blocker that stops Amplitude's requests must not fill the console with errors.
        logLevel: 0,
        cookieOptions: sharedCookieDomain() ? { domain: '.nius.cz' } : undefined,
      });
      sdk = loaded;
      state = 'ready';
      if (pendingOptOut !== undefined) {
        loaded.setOptOut(pendingOptOut);
        optedOut = pendingOptOut;
      }
      const pending = queue;
      queue = [];
      pending.forEach((action) => action(loaded));
    })
    .catch(() => {
      state = 'failed';
      queue = [];
    });
};

/** Call once on page start: loads Amplitude only if consent was already given. */
export const initAnalyticsIfConsented = (): void => {
  if (getConsent() === 'accepted') init();
};

/** Cookie banner "Accept". */
export const enableAnalytics = (): void => {
  init();
  applyOptOut(false);
};

/** Cookie banner "Reject". */
export const disableAnalytics = (): void => {
  applyOptOut(true);
};

export const track = (event: string, props?: Record<string, unknown>): void => {
  const language = document.documentElement.lang;
  run((loaded) => {
    if (!optedOut) tracked += 1;
    loaded.track(event, { language, ...props });
  });
};

/** How many events the loaded, opted-in SDK has accepted; a click handler compares it to tell a tracked click. */
export const trackedEvents = (): number => tracked;

/**
 * Starts uploading the queued events now. Resolves once they are sent, when the upload fails,
 * or after limitMs, whichever comes first; never rejects. Resolves at once without a loaded SDK.
 */
export const flushAnalyticsWithin = (limitMs: number): Promise<void> =>
  new Promise((resolve) => {
    if (state !== 'ready' || !sdk) return resolve();
    setTimeout(resolve, limitMs);
    try {
      sdk.flush().promise.then(() => resolve(), () => resolve());
    } catch {
      resolve();
    }
  });

export const identifyUser = (userId: string): void => {
  const language = document.documentElement.lang;
  run((loaded) => {
    loaded.setUserId(userId);
    const identify = new loaded.Identify();
    identify.set('language', language);
    loaded.identify(identify);
  });
};

export const flushAnalytics = async (): Promise<void> => {
  await loading;
  if (state === 'ready' && sdk) await sdk.flush().promise;
};

export const setAnalyticsOptOut = (optOut: boolean): void => {
  if (!optOut && getConsent() !== 'accepted') return;
  applyOptOut(optOut);
};

export const cleanPath = (url?: string): string =>
  url === undefined ? window.location.pathname : new URL(url, window.location.origin).pathname;

export const CONVERSION_CTAS = [
  'choose_service',
  'view_service',
  'add_to_cart',
  'order_service',
  'cart',
  'account',
  'phone',
  'whatsapp',
] as const;

export const CONVERSION_SOURCES = [
  'header_navigation',
  'header_contact_menu',
  'header',
  'mobile_header',
  'mobile_menu',
  'hero',
  'mobile_sticky',
  'final_cta',
  'service_catalog',
  'service_modal',
  'package_card',
  'subscription_card',
  'booster',
  'footer',
  'floating_contact',
  'contacts_section',
  'order_form',
  'page_content',
] as const;

export type ConversionCta = (typeof CONVERSION_CTAS)[number];
export type ConversionSource = (typeof CONVERSION_SOURCES)[number];

/**
 * One normalized click event for the public conversion funnel.
 * Extra properties must remain non-PHI (for example service_code or cart_items_count).
 */
export const trackCtaClick = (
  cta: ConversionCta,
  source: ConversionSource,
  props?: Record<string, unknown>,
): void => {
  track('cta_clicked', { page_path: cleanPath(), ...props, cta, source });
};
