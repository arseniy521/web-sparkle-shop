import { LANGS } from '@/routes/types.ts';
import type { Lang, PageRoute } from '@/routes/types.ts';
import { absoluteUrl, canonicalPath, hreflangFor, isIndexable } from '@/routes/urls.ts';

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  schema?: object | object[];
}

export interface HeadModel {
  lang: Lang;
  title: string;
  description: string;
  keywords?: string;
  robots: 'index, follow' | 'noindex, follow';
  canonical: string;
  alternates: Array<{ hreflang: string; href: string }>;
  ogLocale: string;
  ogLocaleAlternates: string[];
  ogImage: string;
  ogType: string;
}

const OG_LOCALES: Record<Lang, string> = {
  cs: 'cs_CZ',
  en: 'en_US',
  ru: 'ru_RU',
  uk: 'uk_UA',
};

export function buildHead(route: PageRoute, lang: Lang, meta: PageMeta): HeadModel {
  return {
    lang,
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    robots: isIndexable(route, lang) ? 'index, follow' : 'noindex, follow',
    canonical: absoluteUrl(canonicalPath(route, lang)),
    alternates: hreflangFor(route, lang),
    ogLocale: OG_LOCALES[lang],
    ogLocaleAlternates: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALES[l]),
    ogImage: meta.ogImage ?? absoluteUrl('/og-image.jpg'),
    ogType: meta.ogType ?? 'website',
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
