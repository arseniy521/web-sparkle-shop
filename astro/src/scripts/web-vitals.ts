import { cleanPath, track } from '@/scripts/analytics';
import { getConsent } from '@/scripts/consent';

export function initWebVitals(): void {
  if (getConsent() !== 'accepted') return;
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
