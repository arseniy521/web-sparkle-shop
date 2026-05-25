import { useEffect, useState } from 'react';
import type { CartService } from '@/components/OnboardingForm/cartCatalog';
import { fetchServicesCatalog } from '@/api/services';

export interface UseServicesResult {
  catalog: CartService[];
  loading: boolean;
  errorKey: string | null;
}

/**
 * Loads the catalog when the dialog opens (refreshes from the backend whenever open=true).
 */
export function useServices(open: boolean): UseServicesResult {
  const [catalog, setCatalog] = useState<CartService[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    setLoading(true);
    setErrorKey(null);

    fetchServicesCatalog()
      .then((rows) => {
        if (cancelled) return;
        setCatalog(rows);
        setErrorKey(null);
      })
      .catch(() => {
        if (cancelled) return;
        setCatalog([]);
        setErrorKey('onboarding.catalogLoadFailed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  return { catalog, loading, errorKey };
}
