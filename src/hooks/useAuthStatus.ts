import { useEffect, useState } from 'react';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';
type ResolvedAuthStatus = Exclude<AuthStatus, 'loading'>;

const rawEnvUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const BASE_URL = (rawEnvUrl || (import.meta.env.DEV ? '/api' : 'https://app.nius.cz/api')).replace(/\/+$/, '');

let cachedAuthStatus: ResolvedAuthStatus | null = null;
let authStatusPromise: Promise<ResolvedAuthStatus | null> | null = null;

function loadAuthStatus(): Promise<ResolvedAuthStatus | null> {
  if (cachedAuthStatus) return Promise.resolve(cachedAuthStatus);
  if (authStatusPromise) return authStatusPromise;

  authStatusPromise = fetch(`${BASE_URL}/auth/me/public`, {
    credentials: 'include',
  })
    .then<ResolvedAuthStatus>((response) => {
      if (response.ok) return 'authenticated';
      if (response.status === 401 || response.status === 403) return 'anonymous';
      throw new Error(`auth_status_${response.status}`);
    })
    .then((status) => {
      cachedAuthStatus = status;
      return status as ResolvedAuthStatus | null;
    })
    .catch(() => null)
    .finally(() => {
      authStatusPromise = null;
    });

  return authStatusPromise;
}

export function useAuthStatus(enabled = true): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>(() => (enabled ? cachedAuthStatus ?? 'loading' : 'anonymous'));

  useEffect(() => {
    if (!enabled) {
      setStatus('anonymous');
      return;
    }

    if (cachedAuthStatus) {
      setStatus(cachedAuthStatus);
      return;
    }

    setStatus('loading');
    let cancelled = false;
    loadAuthStatus().then((nextStatus) => {
      if (cancelled || !nextStatus) return;
      setStatus(nextStatus);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return status;
}
