/** The Google Analytics 4 property of www.nius.cz, the same as on the old site. */
export const GA_ID = 'G-VNMLWF0XZG';

/**
 * Google tag with Consent Mode v2, the inline `<head>` script of every page (`BaseLayout.astro`).
 * It is the old site's script (`index.html` of `main` f0d216d), so old and new pages of the wave-1
 * merge behave alike:
 * - every consent signal is denied by default and ads data is redacted;
 * - `window.__niusGrantConsent()` grants the signals and loads gtag.js, at most once per page
 *   (`window.__niusLoadGtag()`); nothing is requested before it is called;
 * - on page load it is called only when the stored choice is `accepted`: the `nius_consent`
 *   cookie wins, the legacy localStorage record counts only without a valid cookie (the rule
 *   of `getConsent()` in `consent.ts`).
 *
 * It runs as a classic script, so `gtag` becomes a global (`window.gtag`) that `ga.ts` uses.
 */
export const GTAG_BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);
window.__niusLoadGtag = function () {
  if (window.__niusGtagLoaded) return;
  window.__niusGtagLoaded = true;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
};
window.__niusGrantConsent = function () {
  gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'denied',
    analytics_storage: 'granted'
  });
  window.__niusLoadGtag();
};
(function () {
  var match = document.cookie.match(/(?:^|;\\s*)nius_consent=([^;]*)/);
  var choice = match ? match[1] : null;
  if (choice !== 'accepted' && choice !== 'rejected') {
    try { choice = localStorage.getItem('nius-cookie-consent'); } catch (e) { choice = null; }
  }
  if (choice === 'accepted') window.__niusGrantConsent();
})();
`;
