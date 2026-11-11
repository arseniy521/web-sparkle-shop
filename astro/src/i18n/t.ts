import { createInstance } from 'i18next';
import type { TFunction } from 'i18next';
import cs from '@old/i18n/locales/cs.json';
import en from '@old/i18n/locales/en.json';
import ru from '@old/i18n/locales/ru.json';
import uk from '@old/i18n/locales/uk.json';
import type { Lang } from '@/routes/types.ts';

const resources = {
  cs: { translation: cs },
  en: { translation: en },
  ru: { translation: ru },
  uk: { translation: uk },
};

export function createT(lang: Lang): TFunction {
  const instance = createInstance();
  void instance.init({
    resources,
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return instance.t;
}
