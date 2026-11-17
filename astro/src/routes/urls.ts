import { pages } from './manifest.ts';
import { LANGS } from './types.ts';
import type { Lang, PageRoute, RedirectRoute } from './types.ts';

export const SITE_ORIGIN = 'https://www.nius.cz';

export function getPage(id: string): PageRoute {
  const route = pages.find((p) => p.id === id);
  if (!route) throw new Error(`Unknown page id: ${id}`);
  return route;
}

export function pageUrl(id: string, lang: Lang): string {
  const path = getPage(id).paths[lang];
  if (!path) throw new Error(`Page ${id} has no ${lang} version`);
  return path;
}

export function hasPage(id: string, lang: Lang): boolean {
  return getPage(id).paths[lang] !== undefined;
}

export function absoluteUrl(path: string): string {
  return SITE_ORIGIN + path;
}

export function isIndexable(route: PageRoute, lang: Lang): boolean {
  return route.paths[lang] !== undefined && !route.noindex?.includes(lang);
}

export function canonicalPath(route: PageRoute, lang: Lang): string {
  const path = route.paths[route.canonicalLang ?? lang];
  if (!path) throw new Error(`Page ${route.id} has no ${lang} version`);
  return path;
}

export function isSelfCanonical(route: PageRoute, lang: Lang): boolean {
  return route.canonicalLang === undefined || route.canonicalLang === lang;
}

export function hreflangFor(
  route: PageRoute,
  lang: Lang,
): Array<{ hreflang: Lang | 'x-default'; href: string }> {
  if (!isSelfCanonical(route, lang)) return [];
  const alternates = LANGS.filter((l) => isIndexable(route, l) && isSelfCanonical(route, l)).map(
    (l) => ({ hreflang: l, href: absoluteUrl(route.paths[l] as string) }),
  );
  const cs = alternates.find((a) => a.hreflang === 'cs');
  return cs ? [{ hreflang: 'x-default', href: cs.href }, ...alternates] : alternates;
}

export function switcherTargets(route: PageRoute | null): Record<Lang, string> {
  const target = (lang: Lang) => route?.paths[lang] ?? (lang === 'cs' ? '/' : `/${lang}/`);
  return { cs: target('cs'), en: target('en'), ru: target('ru'), uk: target('uk') };
}

export function allPageEntries(): Array<{ route: PageRoute; lang: Lang; path: string }> {
  return pages.flatMap((route) =>
    LANGS.flatMap((lang) => {
      const path = route.paths[lang];
      return path ? [{ route, lang, path }] : [];
    }),
  );
}

export function sitemapEntries(): Array<{
  loc: string;
  alternates: Array<{ hreflang: string; href: string }>;
}> {
  return allPageEntries()
    .filter((e) => isIndexable(e.route, e.lang) && isSelfCanonical(e.route, e.lang))
    .map((e) => ({ loc: absoluteUrl(e.path), alternates: hreflangFor(e.route, e.lang) }));
}

export function redirectTarget(r: RedirectRoute): string {
  return absoluteUrl(pageUrl(r.to.id, r.to.lang));
}
