import { describe, expect, it } from 'vitest';
import { blogPosts } from '../data/blogPosts.ts';
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

  it('has 16 redirects, none chained', () => {
    expect(redirects).toHaveLength(16);
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

  it('lists the localized rehydration addresses', () => {
    expect(pageUrl('rehydration-drip', 'cs')).toBe('/rehydratace-praha/');
    expect(pageUrl('rehydration-drip', 'en')).toBe('/en/rehydration-iv-drip-prague/');
    expect(pageUrl('rehydration-drip', 'ru')).toBe('/ru/regidratatsiya-kapelnitsa-praga/');
    expect(pageUrl('rehydration-drip', 'uk')).toBe('/uk/rehidratatsiia-krapelnytsia-praga/');
  });

  // The published redirect addresses (the old site's scripts/redirects.mjs, main f0d216d, with the
  // trailing slash of the stubs): search engines and links out there know them.
  it('keeps the published redirects, address for address', () => {
    const ours = redirects.map((r) => [r.from, pageUrl(r.to.id, r.to.lang)]).sort();
    const published = [
      ['/iv-drips-prague/', '/iv-kapacky-praha/'],
      ['/ru/iv-drips-prague/', '/ru/kapelnitsy-praga/'],
      ['/iv-drip-therapy-prague/', '/iv-kapacky-praha/'],
      ['/en/iv-drip-therapy-prague/', '/en/iv-drips-prague/'],
      ['/ru/iv-drip-therapy-prague/', '/ru/kapelnitsy-praga/'],
      ['/uk/iv-drip-therapy-prague/', '/uk/iv-drips-prague/'],
      ['/ivf-injection-support-prague/', '/ivf-support-prague/'],
      ['/en/ivf-injection-support-prague/', '/en/ivf-support-prague/'],
      ['/ru/ivf-injection-support-prague/', '/ru/ivf-support-prague/'],
      ['/uk/ivf-injection-support-prague/', '/uk/ivf-support-prague/'],
      ['/kapacka-na-kocovinu-praha/', '/rehydratace-praha/'],
      ['/en/hangover-iv-drip-prague/', '/en/rehydration-iv-drip-prague/'],
      ['/ru/kapelnica-ot-pokhmelya-praga/', '/ru/regidratatsiya-kapelnitsa-praga/'],
      ['/uk/krapelnytsia-vid-pokhmellia-praga/', '/uk/rehidratatsiia-krapelnytsia-praga/'],
      ['/cs/', '/'],
      ['/cz/', '/'],
    ].sort();
    expect(ours).toEqual(published);
  });

  it('blog post ids follow src/data/blogPosts.ts', () =>
    expect(
      pages
        .filter((p) => p.template === 'BlogPost')
        .map((p) => p.slug)
        .sort(),
    ).toEqual(blogPosts.map((p) => p.slug).sort()));
});
