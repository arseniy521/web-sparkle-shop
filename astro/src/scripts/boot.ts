import { initAnalyticsIfConsented } from '@/scripts/analytics';
import { initCookieBanner } from '@/scripts/cookie-banner';
import { getConsent } from '@/scripts/consent';
import { installGlobalErrorHandlers } from '@/scripts/client-error';
import { loadGa } from '@/scripts/ga';
import { initLinkTracker } from '@/scripts/link-tracker';
import { captureReferral } from '@/scripts/referral';
import { initWebVitals } from '@/scripts/web-vitals';

captureReferral();
installGlobalErrorHandlers();
initAnalyticsIfConsented();
if (getConsent() === 'accepted') {
  loadGa();
  initWebVitals();
}
initCookieBanner();
initLinkTracker();
