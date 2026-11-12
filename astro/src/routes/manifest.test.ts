import { describe, expect, it } from 'vitest';
import { blogPosts } from '../../../src/data/blogPosts.ts';
import { pages, redirects } from './manifest.ts';
import { allPageEntries, isIndexable, isSelfCanonical, pageUrl } from './urls.ts';

describe('route manifest', () => {
  it('has 62 pages', () => expect(allPageEntries()).toHaveLength(62));

  it('has 47 indexable self-canonical pages', () =>
    expect(
      allPageEntries().filter(
        (e) => isIndexable(e.route, e.lang) && isSelfCanonical(e.route, e.lang),
      ),
    ).toHaveLength(47));

  it('has 10 redirects, none chained', () => {
    expect(redirects).toHaveLength(10);
    const pagePaths = new Set(allPageEntries().map((e) => e.path));
    const from = new Set(redirects.map((r) => r.from));
    for (const r of redirects) {
      expect(pagePaths.has(pageUrl(r.to.id, r.to.lang))).toBe(true);
      expect(from.has(pageUrl(r.to.id, r.to.lang))).toBe(false);
      expect(pagePaths.has(r.from)).toBe(false);
    }
  });

  it('every path is unique, starts and ends with a slash, and carries its language prefix', () => {
    const prefixes = { cs: '', en: '/en', ru: '/ru', uk: '/uk' };
    const entries = allPageEntries();
    expect(new Set(entries.map((e) => e.path)).size).toBe(entries.length);
    for (const { path, lang } of entries) {
      expect(path.startsWith('/')).toBe(true);
      expect(path.endsWith('/')).toBe(true);
      const prefix = prefixes[lang];
      if (prefix) {
        expect(path.startsWith(`${prefix}/`)).toBe(true);
      } else {
        expect(path).not.toMatch(/^\/(en|ru|uk)\//);
      }
    }
  });

  it('lists the localized drip addresses', () => {
    expect(pageUrl('iv-drips', 'cs')).toBe('/iv-kapacky-praha/');
    expect(pageUrl('iv-drips', 'en')).toBe('/en/iv-drips-prague/');
    expect(pageUrl('iv-drips', 'ru')).toBe('/ru/kapelnitsy-praga/');
    expect(pageUrl('iv-drips', 'uk')).toBe('/uk/iv-drips-prague/');
  });

  it('redirects old drip addresses in one hop', () => {
    const map = Object.fromEntries(redirects.map((r) => [r.from, pageUrl(r.to.id, r.to.lang)]));
    expect(map['/iv-drips-prague/']).toBe('/iv-kapacky-praha/');
    expect(map['/iv-drip-therapy-prague/']).toBe('/iv-kapacky-praha/');
    expect(map['/ru/iv-drips-prague/']).toBe('/ru/kapelnitsy-praga/');
    expect(map['/ru/iv-drip-therapy-prague/']).toBe('/ru/kapelnitsy-praga/');
    expect(map['/en/iv-drip-therapy-prague/']).toBe('/en/iv-drips-prague/');
    expect(map['/uk/iv-drip-therapy-prague/']).toBe('/uk/iv-drips-prague/');
    expect(map['/uk/ivf-injection-support-prague/']).toBe('/uk/ivf-support-prague/');
  });

  it('blog post ids follow old:src/data/blogPosts.ts', () =>
    expect(
      pages
        .filter((p) => p.template === 'BlogPost')
        .map((p) => p.slug)
        .sort(),
    ).toEqual(blogPosts.map((p) => p.slug).sort()));
});
