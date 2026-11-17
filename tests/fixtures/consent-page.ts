import vm from 'node:vm';
import { GTAG_BOOTSTRAP } from '../../src/scripts/gtag-bootstrap.ts';

// Unit-test helpers for the Consent Mode bootstrap (jsdom), after the old site's src/test/consentPage.ts.

export const GTAG_LOADER_SELECTOR = 'script[src^="https://www.googletagmanager.com/gtag/js"]';

export type StoredChoice = 'accepted' | 'rejected' | null;

export const DENIED_BY_DEFAULT = [
  'consent',
  'default',
  {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  },
];
export const ALL_DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
};
export const GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'denied',
  analytics_storage: 'granted',
};

/** Puts the jsdom page into the state of a fresh page load with the given stored choices. */
export function resetConsentPage(stored: { cookie?: StoredChoice; legacy?: StoredChoice } = {}): void {
  const page = window as unknown as Record<string, unknown>;
  // `gtag` stays: a function declared by a classic script is a non-configurable global, and the
  // next run of the script declares it again.
  for (const name of ['dataLayer', '__niusGtagLoaded', '__niusLoadGtag', '__niusGrantConsent', 'ga-disable-G-VNMLWF0XZG']) {
    delete page[name];
  }
  document.querySelectorAll(GTAG_LOADER_SELECTOR).forEach((node) => node.remove());
  document.cookie = 'nius_consent=; max-age=0; path=/';
  localStorage.clear();
  if (stored.cookie) document.cookie = `nius_consent=${stored.cookie}; path=/`;
  if (stored.legacy) localStorage.setItem('nius-cookie-consent', stored.legacy);
}

/** Runs the inline <head> script the way the browser does: a classic script in the page's global scope. */
export function runInlineConsentScript(): void {
  vm.runInThisContext(GTAG_BOOTSTRAP, { filename: 'gtag-bootstrap.js' });
}

/** dataLayer entries (gtag pushes `arguments` objects) as plain arrays. */
export function dataLayerEntries(): unknown[][] {
  return (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
}

export const consentUpdates = (): unknown[] =>
  dataLayerEntries()
    .filter((entry) => entry[0] === 'consent' && entry[1] === 'update')
    .map((entry) => entry[2]);
export const configuredIds = (): unknown[] =>
  dataLayerEntries()
    .filter((entry) => entry[0] === 'config')
    .map((entry) => entry[1]);
export const googleEvents = (): unknown[][] => dataLayerEntries().filter((entry) => entry[0] === 'event');
