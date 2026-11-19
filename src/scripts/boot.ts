import { initAnalyticsIfConsented } from '@/scripts/analytics';
import { initBookingLinks } from '@/scripts/booking-link';
import { initCookieBanner } from '@/scripts/cookie-banner';
import { initFloatingWhatsApp } from '@/scripts/floating-whatsapp';
import { getConsent } from '@/scripts/consent';
import { installGlobalErrorHandlers } from '@/scripts/client-error';
import { initGoogleIfConsented } from '@/scripts/ga';
import { initLinkTracker } from '@/scripts/link-tracker';
import { authStatus } from '@/scripts/auth-status';
import { installCartBridge } from '@/scripts/cart-core';
import { initFormBridge } from '@/scripts/form-bridge';
import { initHeaderState } from '@/scripts/header-state';
import { initHeroStories } from '@/scripts/hero-stories';
import { captureReferral } from '@/scripts/referral';
import { initSamePageScroll } from '@/scripts/same-page-scroll';
import { initStickyBar } from '@/scripts/sticky-bar';
import { initWebVitals } from '@/scripts/web-vitals';

captureReferral();
installGlobalErrorHandlers();
initAnalyticsIfConsented();
// gtag.js itself is loaded by the inline <head> script (gtag-bootstrap.ts) with stored consent.
if (getConsent() === 'accepted') {
  initGoogleIfConsented();
  initWebVitals();
}
initCookieBanner();
initLinkTracker();
installCartBridge();
initHeaderState();
initBookingLinks();
void authStatus.ensure();
initFloatingWhatsApp();
// Each is a no-op on a page without its markup: the stories are on the home page, the bottom bar
// and the same-page scroll on pages with a hero #home (home, drips).
initHeroStories();
initStickyBar();
initSamePageScroll();
initFormBridge();
