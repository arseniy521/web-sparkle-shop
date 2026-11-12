import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
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

const menuScriptPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../public/js/nius-menu.js');

interface MenuItem {
  name: string;
  code: string;
}
interface MenuData {
  NIUS_I18N: Record<string, { drips?: Record<string, { name?: string }>; shots?: Record<string, string> }>;
  NIUS_CATEGORIES: Record<string, { drips: MenuItem[] }>;
  NIUS_SHOTS: MenuItem[];
}

/** The data of the menu web component, read by running the real script (as NiusMenuElement.test.ts does). */
function loadMenuData(): MenuData {
  const source = readFileSync(menuScriptPath, 'utf8');
  return vm.runInThisContext(`${source}
;({ NIUS_I18N, NIUS_CATEGORIES, NIUS_SHOTS });`, {
    filename: menuScriptPath,
  });
}

/** Display name per service code, resolved the way nius-menu.js renders cards, modals and booster chips. */
function menuNames(menu: MenuData, lang: string): Map<string, string> {
  const t = menu.NIUS_I18N[lang] ?? menu.NIUS_I18N.en;
  const names = new Map<string, string>();
  for (const category of Object.values(menu.NIUS_CATEGORIES)) {
    for (const drip of category.drips) names.set(drip.code, t.drips?.[drip.name]?.name || drip.name);
  }
  for (const shot of menu.NIUS_SHOTS) names.set(shot.code, t.shots?.[shot.name] || shot.name);
  return names;
}

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

  it('shows every menu service under the same name in the menu and in the form/cart, in every language', () => {
    const menu = loadMenuData();
    const menuCodes = [
      ...Object.values(menu.NIUS_CATEGORIES).flatMap((category) => category.drips),
      ...menu.NIUS_SHOTS,
    ].map((item) => item.code);
    // 13 drips and nursing services, 9 boosters: the comparison below cannot pass on an empty menu.
    expect(menuCodes.length).toBeGreaterThanOrEqual(22);
    expect(new Set(menuCodes).size).toBe(menuCodes.length);

    const differences: string[] = [];
    for (const [lang, catalog] of Object.entries(locales)) {
      const names = menuNames(menu, lang);
      for (const code of menuCodes) {
        const inMenu = names.get(code);
        const inForm = catalog[code]?.title;
        if (inMenu !== inForm) differences.push(`${lang}:${code} menu="${inMenu}" form="${inForm}"`);
      }
    }
    expect(differences).toEqual([]);
  });
});
