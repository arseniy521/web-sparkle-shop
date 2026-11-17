import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('useAuthStatus fresh checks', () => {
  it.each([
    ['anonymous', 401],
    ['authenticated', 200],
  ] as const)('does not expose stale %s while refetching', async (cachedStatus, cachedHttpStatus) => {
    vi.resetModules();
    const { authStatus } = await import('@/scripts/auth-status');
    const { useAuthStatus } = await import('./useAuthStatus');
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: cachedHttpStatus }));
    expect(await authStatus.ensure()).toBe(cachedStatus);

    let resolveFetch!: (response: Response) => void;
    globalThis.fetch = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    function Status() {
      return <span>{useAuthStatus(true, true)}</span>;
    }

    render(<Status />);

    expect(screen.getByText('loading')).toBeInTheDocument();

    resolveFetch(new Response('{}', { status: 200 }));
    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument());
  });
});
