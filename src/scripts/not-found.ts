import { cleanPath, initAnalyticsIfConsented, track } from '@/scripts/analytics';

initAnalyticsIfConsented();

const referrer = document.referrer;
const sameOrigin = referrer !== '' && new URL(referrer).origin === window.location.origin;

track('page_not_found', {
  page_path: cleanPath(),
  ...(sameOrigin ? { referrer_path: cleanPath(referrer) } : {}),
});
