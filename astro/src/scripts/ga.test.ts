import { beforeEach, describe, expect, it, vi } from 'vitest';

const load = () => import('./ga');

describe('ga', () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = '';
    window.dataLayer = undefined;
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
});
