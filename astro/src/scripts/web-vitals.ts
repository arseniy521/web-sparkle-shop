import { cleanPath, track } from '@/scripts/analytics';
import { getConsent } from '@/scripts/consent';

let started = false;

/** Once per page load, only with consent: Accept may be clicked again after "Cookie settings". */
export function initWebVitals(): void {
  if (started || getConsent() !== 'accepted') return;
  started = true;
  void import('web-vitals')
    .then(({ onCLS, onINP, onLCP }) => {
      const report = ({ name, value, rating }: { name: string; value: number; rating: string }) =>
        track('web_vital', { name, value, rating, page_path: cleanPath() });
      onLCP(report);
      onINP(report);
      onCLS(report);
    })
    .catch(() => {});
}
