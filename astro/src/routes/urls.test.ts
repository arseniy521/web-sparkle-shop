import { describe, expect, it } from 'vitest';
import { redirects } from './manifest.ts';
import {
  absoluteUrl,
  allPageEntries,
  canonicalPath,
  getPage,
  hasPage,
  hreflangFor,
  pageUrl,
  redirectTarget,
  sitemapEntries,
  switcherTargets,
} from './urls.ts';

const page = (id: string) => getPage(id);

describe('route addresses', () => {
  it('canonical is the page itself, except privacy', () => {
    expect(canonicalPath(page('iv-drips'), 'cs')).toBe('/iv-kapacky-praha/');
    expect(canonicalPath(page('privacy'), 'ru')).toBe('/privacy/');
  });

  it('hreflang of a three-language page', () =>
    expect(hreflangFor(page('birthday-gift'), 'en')).toEqual([
      { hreflang: 'x-default', href: 'https://www.nius.cz/narozeninovy-darek-praha/' },
      { hreflang: 'cs', href: 'https://www.nius.cz/narozeninovy-darek-praha/' },
      { hreflang: 'en', href: 'https://www.nius.cz/en/birthday-gift-prague/' },
      { hreflang: 'ru', href: 'https://www.nius.cz/ru/podatok-k-dnju-rozhdenija-praga/' },
    ]));

  it('hreflang of an English-only page has no x-default', () =>
    expect(hreflangFor(page('iv-drip-hotel'), 'en')).toEqual([
      { hreflang: 'en', href: 'https://www.nius.cz/en/iv-drip-hotel-prague/' },
    ]));

  it('noindex blog versions list only cs, en and x-default', () =>
    expect(hreflangFor(page('blog'), 'ru').map((a) => a.hreflang)).toEqual([
      'x-default',
      'cs',
      'en',
    ]));

  it('prefixed privacy pages have no hreflang; /privacy/ lists itself', () => {
    expect(hreflangFor(page('privacy'), 'ru')).toEqual([]);
    expect(hreflangFor(page('privacy'), 'cs').map((a) => a.hreflang)).toEqual([
      'x-default',
      'cs',
    ]);
  });

  it('every listed alternate lists the same set back', () => {
    const entries = allPageEntries();
    for (const { route, lang } of entries) {
      const set = hreflangFor(route, lang);
      for (const alt of set) {
        if (alt.hreflang === 'x-default') continue;
        expect(hreflangFor(route, alt.hreflang)).toEqual(set);
      }
    }
  });

  it('switcher falls back to the language home page', () => {
    expect(switcherTargets(page('district-vinohrady')).en).toBe('/en/');
    expect(switcherTargets(page('hangover-drip')).cs).toBe('/kapacka-na-kocovinu-praha/');
    expect(switcherTargets(null)).toEqual({ cs: '/', en: '/en/', ru: '/ru/', uk: '/uk/' });
  });

  it('sitemap lists exactly the 47 indexable self-canonical pages with page hreflang', () => {
    expect(sitemapEntries()).toHaveLength(47);
    expect(sitemapEntries().some((e) => e.loc.endsWith('/ru/privacy/'))).toBe(false);
  });

  it('pageUrl throws for a missing language', () =>
    expect(() => pageUrl('district-praha-1', 'en')).toThrow());

  it('getPage throws for an unknown id', () => expect(() => getPage('nope')).toThrow());

  it('hasPage, absoluteUrl and redirectTarget agree with the manifest', () => {
    expect(hasPage('district-praha-1', 'en')).toBe(false);
    expect(hasPage('district-praha-1', 'cs')).toBe(true);
    expect(absoluteUrl('/en/')).toBe('https://www.nius.cz/en/');
    expect(redirectTarget(redirects[0])).toBe('https://www.nius.cz/iv-kapacky-praha/');
  });
});
