/**
 * "Cookie settings": lets a control anywhere on the page (the footer link) reopen the
 * consent banner, which is mounted once in App.
 */
const COOKIE_SETTINGS_EVENT = 'nius:cookie-settings';

export const openCookieSettings = (): void => {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
};

/** Subscribes the banner to reopen requests; returns the unsubscribe function. */
export const onCookieSettingsRequested = (listener: () => void): (() => void) => {
  window.addEventListener(COOKIE_SETTINGS_EVENT, listener);
  return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, listener);
};
