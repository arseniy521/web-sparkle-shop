import { initAnalyticsIfConsented } from '@/scripts/analytics';
import { initCookieBanner } from '@/scripts/cookie-banner';
import { initDripFilter } from '@/scripts/drip-filter';
import { getConsent } from '@/scripts/consent';
import { installGlobalErrorHandlers } from '@/scripts/client-error';
import { loadGa } from '@/scripts/ga';
import { initLinkTracker } from '@/scripts/link-tracker';
import { authStatus } from '@/scripts/auth-status';
import { installCartBridge } from '@/scripts/cart-core';
import { initFormBridge } from '@/scripts/form-bridge';
import { initHeaderState } from '@/scripts/header-state';
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
installCartBridge();
initHeaderState();
void authStatus.ensure();
initFormBridge();
initDripFilter();
