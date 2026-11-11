import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieScope = vi.hoisted(() => ({ domain: undefined as string | undefined }));
vi.mock('@/scripts/cookie-domain', () => ({ sharedCookieDomain: () => cookieScope.domain }));

const load = () => import('./ga');

describe('ga', () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = '';
    window.dataLayer = undefined;
    cookieScope.domain = undefined;
    delete (window as unknown as Record<string, unknown>)['ga-disable-G-VNMLWF0XZG'];
  });

  it('adds the gtag script once and only on request', async () => {
    const { loadGa } = await load();
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
    loadGa();
    loadGa();
    expect(
      document.querySelectorAll('script[src*="googletagmanager.com/gtag/js?id=G-VNMLWF0XZG"]'),
    ).toHaveLength(1);
  });

  it('configures the same property as the old site', async () => {
    const { loadGa } = await load();
    loadGa();
    const calls = (window.dataLayer as unknown as IArguments[]).map((args) => [...args]);
    expect(calls.map((c) => c[0])).toEqual(['js', 'config']);
    expect(calls[1]).toEqual(['config', 'G-VNMLWF0XZG']);
  });

  it('disables the property and expires the _ga cookies', async () => {
    document.cookie = '_ga=GA1.1.1; path=/';
    document.cookie = '_ga_VNMLWF0XZG=GS1; path=/';
    const { disableGa } = await load();
    disableGa();
    expect((window as unknown as Record<string, unknown>)['ga-disable-G-VNMLWF0XZG']).toBe(true);
    expect(document.cookie).not.toContain('_ga');
  });

  it('expires the cookies on the shared domain as well', async () => {
    const writes = vi.spyOn(document, 'cookie', 'set');
    cookieScope.domain = '.nius.cz';
    const { disableGa } = await load();
    disableGa();
    expect(writes).toHaveBeenCalledTimes(4);
    expect(writes.mock.calls.filter(([value]) => value.includes('domain=.nius.cz'))).toHaveLength(2);
  });

  it('expires only host cookies without a shared domain', async () => {
    const writes = vi.spyOn(document, 'cookie', 'set');
    const { disableGa } = await load();
    disableGa();
    expect(writes).toHaveBeenCalledTimes(2);
    expect(writes.mock.calls.some(([value]) => value.includes('domain='))).toBe(false);
  });
});
