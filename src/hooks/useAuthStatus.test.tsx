import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AUTH_STATUS_QUERY_KEY,
  type AuthStatus,
  useAuthStatus,
} from './useAuthStatus';

const originalFetch = globalThis.fetch;

function Status() {
  return <span>{useAuthStatus(true, true)}</span>;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('useAuthStatus fresh checks', () => {
  it.each(['anonymous', 'authenticated'] as const)(
    'does not expose stale %s while refetching',
    async (cachedStatus) => {
      let resolveFetch!: (response: Response) => void;
      globalThis.fetch = vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      );
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      queryClient.setQueryData<AuthStatus>(
        AUTH_STATUS_QUERY_KEY,
        cachedStatus,
      );

      render(
        <QueryClientProvider client={queryClient}>
          <Status />
        </QueryClientProvider>,
      );

      expect(screen.getByText('loading')).toBeInTheDocument();

      resolveFetch(new Response('{}', { status: 200 }));
      await waitFor(() =>
        expect(screen.getByText('authenticated')).toBeInTheDocument(),
      );
    },
  );
});
