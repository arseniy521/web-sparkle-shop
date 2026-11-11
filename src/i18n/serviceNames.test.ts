import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import cs from './locales/cs.json';
import en from './locales/en.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';
import { SERVICE_I18N } from '@/components/OnboardingForm/cartCatalog';

type Catalog = Record<string, { title: string; description: string }>;
const locales: Record<string, Catalog> = {
  en: en.serviceCatalog as Catalog,
  cs: cs.serviceCatalog as Catalog,
  ru: ru.serviceCatalog as Catalog,
  uk: uk.serviceCatalog as Catalog,
};

// Branded drips keep one Latin name in every language (see service naming rule).
const BRAND_CODES = [
  'immunity_lite', 'immunity_power', 'ceo_recharge', 'metabolic_reset',
  'b_power_shot', 'pure_hydrate', 'electrolyte_reset', 'jet_lag_recovery',
];

describe('service names across languages', () => {
  it('has a title and description in every language for every cart service', () => {
    const codes = Object.keys(SERVICE_I18N).filter((c) => c.includes('_') && c !== 'iv_infusion');
    for (const [lang, catalog] of Object.entries(locales)) {
      for (const code of codes) {
        expect(catalog[code]?.title, `${lang}:${code}.title`).toBeTruthy();
        expect(catalog[code]?.description, `${lang}:${code}.description`).toBeTruthy();
      }
    }
  });

  it('keeps branded drip names identical in all languages', () => {
    for (const code of BRAND_CODES) {
      const names = new Set(Object.values(locales).map((c) => c[code].title));
      expect([...names], code).toHaveLength(1);
    }
  });

  it('uses the same names in the menu web component as in the cart catalog', () => {
    const js = readFileSync('public/js/nius-menu.js', 'utf8');
    for (const [lang, catalog] of Object.entries(locales)) {
      for (const code of BRAND_CODES) {
        const title = catalog[code].title;
        // nius-menu.js maps the API (English) name to a per-language display name.
        if (lang === 'en') continue;
        expect(js.includes(`name: '${title}'`), `${lang}:${code} -> ${title}`).toBe(true);
      }
    }
  });
});
