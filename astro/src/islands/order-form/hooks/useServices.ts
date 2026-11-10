import { useQuery } from '@tanstack/react-query';
import type { CartService } from '@/components/OnboardingForm/cartCatalog';
import { fetchServicesCatalog } from '@/api/services';

export interface UseServicesResult {
  catalog: CartService[];
  loading: boolean;
  catalogReady: boolean;
  errorKey: string | null;
}

export const SERVICES_CATALOG_QUERY_KEY = ['services-catalog'] as const;

export function useServices(open: boolean): UseServicesResult {
  const query = useQuery<CartService[]>({
    queryKey: SERVICES_CATALOG_QUERY_KEY,
    queryFn: fetchServicesCatalog,
    enabled: open,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });

  return {
    catalog: query.data ?? [],
    // Keep the cached catalog available for rendering, but do not treat it as
    // checkout-safe while the form's refresh is in flight.
    loading: open &&
      (query.isPending || query.isFetching || query.fetchStatus === 'paused'),
    catalogReady: open && query.isSuccess && query.fetchStatus === 'idle',
    errorKey: query.isError ? 'onboarding.catalogLoadFailed' : null,
  };
}
