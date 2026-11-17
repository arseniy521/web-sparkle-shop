import { disableAnalytics, enableAnalytics } from '@/scripts/analytics';
import { cart } from '@/scripts/cart-core';
import { getConsent, setConsent } from '@/scripts/consent';
import { denyGoogle, disableGa, grantGoogle } from '@/scripts/ga';
import { initWebVitals } from '@/scripts/web-vitals';

/**
 * The consent banner (old `src/components/CookieConsent.tsx`, main f0d216d):
 * - shown on a page load without a stored choice;
 * - shown again by any "Cookie settings" control (`[data-cookie-settings]`, the footer), so the
 *   choice can be changed; the click is delegated, a control added later works too;
 * - kept hidden while the order form is open, the choice stays pending and the banner comes
 *   back when the form closes.
 */
export function initCookieBanner(): void {
  const banner = document.querySelector<HTMLElement>('[data-cookie-banner]');
  if (!banner) return;

  const consent = getConsent();
  let wanted = consent === null;
  if (consent === 'rejected') disableGa();

  const render = () => {
    banner.hidden = !wanted || cart.getState().open;
  };
  const close = () => {
    wanted = false;
    render();
  };

  banner.querySelector('[data-consent="accept"]')?.addEventListener('click', () => {
    setConsent('accepted');
    enableAnalytics();
    grantGoogle();
    initWebVitals();
    close();
  });

  banner.querySelector('[data-consent="reject"]')?.addEventListener('click', () => {
    setConsent('rejected');
    denyGoogle();
    disableAnalytics();
    close();
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('[data-cookie-settings]')) return;
    wanted = true;
    render();
  });

  cart.subscribe(render);
  render();
}
