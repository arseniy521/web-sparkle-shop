import { useQuery } from '@tanstack/react-query';
import { getCustomerSummary, type CustomerSummary } from '@/api/onboarding';

export const CUSTOMER_SUMMARY_QUERY_KEY = ['customer-summary'] as const;

export function useCustomerSummary(enabled = false) {
  return useQuery<CustomerSummary>({
    queryKey: CUSTOMER_SUMMARY_QUERY_KEY,
    queryFn: getCustomerSummary,
    enabled,
    staleTime: 15_000,
    retry: false,
  });
}
