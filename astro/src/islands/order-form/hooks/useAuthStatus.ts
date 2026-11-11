import { useEffect, useState, useSyncExternalStore } from 'react';
import { authStatus, type AuthStatus } from '@/scripts/auth-status';

export function useAuthStatus(enabled = true, fresh = false): AuthStatus {
  const status = useSyncExternalStore(authStatus.subscribe, authStatus.get, authStatus.get);
  const [wasEnabled, setWasEnabled] = useState(enabled);
  const [refreshed, setRefreshed] = useState(false);
  if (enabled !== wasEnabled) {
    setWasEnabled(enabled);
    setRefreshed(false);
  }

  useEffect(() => {
    if (!enabled) return;
    if (!fresh) {
      void authStatus.ensure();
      return;
    }
    let active = true;
    void authStatus.refresh().then(() => {
      if (active) setRefreshed(true);
    });
    return () => {
      active = false;
    };
  }, [enabled, fresh]);

  if (!enabled) return 'anonymous';
  if (fresh && !refreshed) return 'loading';
  return status;
}
