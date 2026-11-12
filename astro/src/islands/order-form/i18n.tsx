import { createContext, useContext, type ReactNode } from 'react';
import i18next, { type i18n, type TFunction } from 'i18next';

export type Lang = 'cs' | 'en' | 'ru' | 'uk';

const strings = {
  cs: () => import('./strings/cs'),
  en: () => import('./strings/en'),
  ru: () => import('./strings/ru'),
  uk: () => import('./strings/uk'),
};

/** Starts fetching the texts of the page language; loadFormI18n then reuses the loaded modules. */
export function prefetchFormStrings(lang: string): void {
  if (!Object.hasOwn(strings, lang)) return;
  Promise.all([strings[lang as Lang](), strings.en()]).catch(() => undefined);
}

export async function loadFormI18n(lang: Lang): Promise<i18n> {
  const [page, en] = await Promise.all([strings[lang](), strings.en()]);
  const instance = i18next.createInstance();
  await instance.init({
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      [lang]: { translation: { ...page } },
      en: { translation: { ...en } },
    },
  });
  return instance;
}

const FormI18nContext = createContext<i18n | null>(null);

export function FormI18nProvider({ i18n, children }: { i18n: i18n; children: ReactNode }) {
  return <FormI18nContext value={i18n}>{children}</FormI18nContext>;
}

export function useTranslation(): { t: TFunction; i18n: { language: Lang } } {
  const i18n = useContext(FormI18nContext)!;
  return { t: i18n.t, i18n: { language: i18n.language as Lang } };
}
