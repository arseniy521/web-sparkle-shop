import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '@/scripts/env';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';
type ResolvedAuthStatus = Exclude<AuthStatus, 'loading'>;


export const AUTH_STATUS_QUERY_KEY = ['auth-status'] as const;

export async function fetchAuthStatus(): Promise<Exclude<ResolvedAuthStatus, 'error'>> {
  const response = await fetch(`${API_BASE}/auth/me/public`, {
    credentials: 'include',
  });
  if (response.ok) return 'authenticated';
  if (response.status === 401 || response.status === 403) return 'anonymous';
  throw new Error(`auth_status_${response.status}`);
}

export function useAuthStatus(enabled = true, fresh = false): AuthStatus {
  const query = useQuery({
    queryKey: AUTH_STATUS_QUERY_KEY,
    queryFn: fetchAuthStatus,
    enabled,
    staleTime: fresh ? 0 : 30_000,
    refetchOnMount: fresh ? 'always' : true,
    retry: false,
  });

  if (!enabled) return 'anonymous';
  if (fresh && query.isFetching) return 'loading';
  if (query.isPending) return 'loading';
  if (query.isError) return 'error';
  return query.data;
}
