import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import cs from '@/i18n/locales/cs.json';
import en from '@/i18n/locales/en.json';
import ru from '@/i18n/locales/ru.json';
import uk from '@/i18n/locales/uk.json';
import { SERVICE_I18N, WEBSITE_HIDDEN_SERVICE_CODES, isOfferedOnWebsite } from './cart-catalog';

// Ports of the old site's offeredOnWebsite.test.ts and src/i18n/serviceNames.test.ts (main f0d216d).

describe('isOfferedOnWebsite', () => {
  it('offers regular vitamin/hydration and nursing services', () => {
    for (const code of ['immunity_lite', 'pure_hydrate', 'jet_lag_recovery', 'post_op_wound_dressing', 'ivf_hormone_injection_at_home_hotel', 'standard_iron', 'premium_iron']) {
      expect(isOfferedOnWebsite(code), code).toBe(true);
    }
  });

  it('normalizes the code first', () => {
    expect(isOfferedOnWebsite(' standard-iron ')).toBe(true);
    expect(isOfferedOnWebsite('nausea-relief')).toBe(false);
  });

  it('hides doctor-ordered or medicinal-product services and unknown codes', () => {
    for (const code of ['nausea_relief', 'backache_relief', 'allergy_stop', 'nerve_regen', 'anti_nausea_addon', 'testovaya_usluga']) {
      expect(isOfferedOnWebsite(code), code).toBe(false);
    }
  });

  it('keeps the doctor-ordered services hidden even when the catalog gets their texts', () => {
    // The list is the policy (Czech ad law, Google Ads healthcare policy), not a by-product of SERVICE_I18N.
    expect([...WEBSITE_HIDDEN_SERVICE_CODES].sort()).toEqual(['allergy_stop', 'anti_nausea_addon', 'backache_relief', 'nausea_relief', 'nerve_regen']);
    for (const code of WEBSITE_HIDDEN_SERVICE_CODES) expect(Object.hasOwn(SERVICE_I18N, code), code).toBe(false);
  });

  it.each(['toString', 'constructor', '__proto__', 'hasOwnProperty'])('does not take the object key %s for a service', (code) => {
    expect(isOfferedOnWebsite(code)).toBe(false);
  });
});

type Catalog = Record<string, { title: string; description: string }>;
const locales: Record<string, Catalog> = {
  en: en.serviceCatalog as Catalog,
  cs: cs.serviceCatalog as Catalog,
  ru: ru.serviceCatalog as Catalog,
  uk: uk.serviceCatalog as Catalog,
};

// The service catalog web component in public/.
const menuScriptPath = path.resolve(import.meta.dirname, '../../public/js/nius-menu.js');

interface MenuItem {
  name: string;
  code: string;
}
interface MenuData {
  NIUS_I18N: Record<string, { drips?: Record<string, { name?: string }>; shots?: Record<string, string> }>;
  NIUS_CATEGORIES: Record<string, { drips: MenuItem[] }>;
  NIUS_SHOTS: MenuItem[];
}

let menuData: MenuData | undefined;

/** The data of the menu web component, read by running the real script (once: it declares globals). */
function loadMenuData(): MenuData {
  if (menuData) return menuData;
  const source = readFileSync(menuScriptPath, 'utf8');
  menuData = vm.runInThisContext(`${source}\n;({ NIUS_I18N, NIUS_CATEGORIES, NIUS_SHOTS });`, { filename: menuScriptPath }) as MenuData;
  return menuData;
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

  it('offers every service of the menu in the form', () => {
    const menu = loadMenuData();
    const menuCodes = [
      ...Object.values(menu.NIUS_CATEGORIES).flatMap((category) => category.drips),
      ...menu.NIUS_SHOTS,
    ].map((item) => item.code);
    expect(menuCodes.filter((code) => !isOfferedOnWebsite(code))).toEqual([]);
  });
});
