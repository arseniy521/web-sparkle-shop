import { beforeEach, describe, expect, it, vi } from 'vitest';

type AuthModule = typeof import('./auth-status');

const fetchMock = vi.fn();

async function load(): Promise<AuthModule> {
  vi.resetModules();
  return import('./auth-status');
}

function loc(origin: string, pathname: string, search = '', hash = '') {
  return { origin, pathname, search, hash };
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
});

describe('authStatus', () => {
  it('asks /auth/me/public once for concurrent callers', async () => {
    const { authStatus } = await load();
    await Promise.all([authStatus.ensure(), authStatus.ensure()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me/public', { credentials: 'include' });
  });

  it('does not ask again once the status is known', async () => {
    const { authStatus } = await load();
    await authStatus.ensure();
    await authStatus.ensure();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    [200, 'authenticated'],
    [401, 'anonymous'],
    [403, 'anonymous'],
    [500, 'error'],
  ])('maps HTTP %i to %s', async (status, expected) => {
    fetchMock.mockResolvedValue(new Response(null, { status }));
    const { authStatus } = await load();
    expect(authStatus.get()).toBe('loading');
    expect(await authStatus.ensure()).toBe(expected);
    expect(authStatus.get()).toBe(expected);
  });

  it('maps a network failure to error', async () => {
    fetchMock.mockRejectedValue(new TypeError('offline'));
    const { authStatus } = await load();
    expect(await authStatus.ensure()).toBe('error');
  });

  it('refresh() asks again and notifies subscribers', async () => {
    const { authStatus } = await load();
    await authStatus.ensure();
    const listener = vi.fn();
    authStatus.subscribe(listener);
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    expect(await authStatus.refresh()).toBe('anonymous');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalled();
    expect(authStatus.get()).toBe('anonymous');
  });

  it('stops notifying after unsubscribe', async () => {
    const { authStatus } = await load();
    const listener = vi.fn();
    authStatus.subscribe(listener)();
    await authStatus.ensure();
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('accountHref', () => {
  it('account link: cabinet for a signed-in visitor', async () => {
    const { accountHref } = await load();
    expect(accountHref('authenticated', loc('https://www.nius.cz', '/en/blog/'))).toBe(
      'https://app.nius.cz/cabinet',
    );
  });

  it('account link: login with returnTo for anonymous and error', async () => {
    const { accountHref } = await load();
    const expected =
      'https://app.nius.cz/login?returnTo=' +
      encodeURIComponent('https://www.nius.cz/en/blog/?a=1#x');
    expect(accountHref('anonymous', loc('https://www.nius.cz', '/en/blog/', '?a=1', '#x'))).toBe(expected);
    expect(accountHref('error', loc('https://www.nius.cz', '/en/blog/', '?a=1', '#x'))).toBe(expected);
  });

  it('account link: returnTo from the bare domain', async () => {
    const { accountHref } = await load();
    expect(accountHref('anonymous', loc('https://nius.cz', '/'))).toBe(
      'https://app.nius.cz/login?returnTo=' + encodeURIComponent('https://nius.cz/'),
    );
  });

  it('account link: no returnTo from another origin', async () => {
    const { accountHref } = await load();
    expect(accountHref('error', loc('https://nius-site-preview.pages.dev', '/en/blog/'))).toBe(
      'https://app.nius.cz/login',
    );
  });

  it('account link is null while loading', async () => {
    const { accountHref } = await load();
    expect(accountHref('loading', loc('https://www.nius.cz', '/'))).toBeNull();
  });
});
