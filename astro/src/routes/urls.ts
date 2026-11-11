import { pages } from './manifest.ts';
import { LANGS } from './types.ts';
import type { Lang, PageRoute } from './types.ts';

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

export function isIndexable(route: PageRoute, lang: Lang): boolean {
  return route.paths[lang] !== undefined && !route.noindex?.includes(lang);
}

export function isSelfCanonical(route: PageRoute, lang: Lang): boolean {
  return route.canonicalLang === undefined || route.canonicalLang === lang;
}

export function allPageEntries(): Array<{ route: PageRoute; lang: Lang; path: string }> {
  return pages.flatMap((route) =>
    LANGS.flatMap((lang) => {
      const path = route.paths[lang];
      return path ? [{ route, lang, path }] : [];
    }),
  );
}
