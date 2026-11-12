import { disableAnalytics, enableAnalytics } from '@/scripts/analytics';
import { getConsent, setConsent } from '@/scripts/consent';
import { disableGa, loadGa } from '@/scripts/ga';
import { initWebVitals } from '@/scripts/web-vitals';

export function initCookieBanner(): void {
  const banner = document.querySelector<HTMLElement>('[data-cookie-banner]');
  if (!banner) return;

  const consent = getConsent();
  if (consent === null) banner.hidden = false;
  else if (consent === 'rejected') disableGa();

  banner.querySelector('[data-consent="accept"]')?.addEventListener('click', () => {
    setConsent('accepted');
    enableAnalytics();
    loadGa();
    initWebVitals();
    banner.hidden = true;
  });

  banner.querySelector('[data-consent="reject"]')?.addEventListener('click', () => {
    setConsent('rejected');
    disableGa();
    disableAnalytics();
    banner.hidden = true;
  });
}
