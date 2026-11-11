import { API_BASE, APP_URL } from '@/scripts/env';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

const RETURN_ORIGINS = new Set(['https://www.nius.cz', 'https://nius.cz']);

let current: AuthStatus = 'loading';
let inflight: Promise<AuthStatus> | null = null;
const listeners = new Set<() => void>();

async function fetchStatus(): Promise<AuthStatus> {
  try {
    const response = await fetch(`${API_BASE}/auth/me/public`, { credentials: 'include' });
    if (response.ok) return 'authenticated';
    if (response.status === 401 || response.status === 403) return 'anonymous';
    return 'error';
  } catch {
    return 'error';
  }
}

function request(): Promise<AuthStatus> {
  const pending: Promise<AuthStatus> = fetchStatus().then((next) => {
    if (inflight !== pending) return inflight ?? current;
    current = next;
    inflight = null;
    for (const listener of listeners) listener();
    return next;
  });
  inflight = pending;
  return pending;
}

export const authStatus = {
  get: (): AuthStatus => current,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  ensure(): Promise<AuthStatus> {
    if (current !== 'loading') return Promise.resolve(current);
    return inflight ?? request();
  },

  refresh(): Promise<AuthStatus> {
    return request();
  },
};

export function accountHref(
  status: AuthStatus,
  loc: Pick<Location, 'origin' | 'pathname' | 'search' | 'hash'>,
): string | null {
  if (status === 'loading') return null;
  if (status === 'authenticated') return `${APP_URL}/cabinet`;
  const login = `${APP_URL}/login`;
  if (!RETURN_ORIGINS.has(loc.origin)) return login;
  return `${login}?returnTo=${encodeURIComponent(`${loc.origin}${loc.pathname}${loc.search}${loc.hash}`)}`;
}
