import { useOnboardingCart } from './hooks/useOnboardingCart';
import { useServices } from './hooks/useServices';

/**
 * The cart total under the label of the home page's bottom bar (old:src/components/MobileStickyBar.tsx):
 * the sum of the catalog prices of the cart's services, once every service is in the catalog.
 */
export function cartTotal(codes: string[], catalog: Array<{ code: string; priceCzk: number }>): number | null {
  if (codes.length === 0) return null;
  let sum = 0;
  for (const code of codes) {
    const service = catalog.find((item) => item.code === code);
    if (!service) return null;
    sum += service.priceCzk;
  }
  return sum;
}

export function StickyTotal({ lang }: { lang: string }) {
  const { codes } = useOnboardingCart();
  const { catalog } = useServices(codes.length > 0);
  const total = cartTotal(codes, catalog);
  if (total === null) return null;
  const formatted = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 2,
  }).format(total);
  return <span className="text-xs">{formatted}</span>;
}
