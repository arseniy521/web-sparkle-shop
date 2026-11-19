// The drips of the IV drips landing page: the schema.org offers and the drip guide under the menu.
// Names, codes and prices (CZK) must match the menu in public/js/nius-menu.js, which shows the
// prices of the API; dripPrices.test.ts checks that.
export interface DripOffer {
  name: string;
  /** Service code of the catalogue: the guide's booking button orders this service. */
  code: string;
  priceCzk: number;
  /**
   * Key under ivDripTherapy.menu.categories with the drip's texts (`short`, `includes`,
   * `bestFor`), when the page has them: `<category>.items.<item>`.
   */
  textPath?: string;
}

export const IV_DRIP_OFFERS: readonly DripOffer[] = [
  { name: 'Immunity Lite', code: 'immunity_lite', priceCzk: 2900, textPath: 'immunity.items.immunityLite' },
  { name: 'Immunity Power', code: 'immunity_power', priceCzk: 3250, textPath: 'immunity.items.immunityPower' },
  { name: 'Vitamin & Mineral Classic', code: 'glow_post_flu', priceCzk: 3750, textPath: 'immunity.items.glowPostFlu' },
  { name: 'Vitamin & Mineral Plus', code: 'defense_shield', priceCzk: 4350, textPath: 'immunity.items.defenseShield' },
  { name: 'CEO Recharge', code: 'ceo_recharge', priceCzk: 4550, textPath: 'energy.items.ceoRecharge' },
  { name: 'Metabolic Reset', code: 'metabolic_reset', priceCzk: 4050, textPath: 'energy.items.metabolicReset' },
  { name: 'B-Power Shot', code: 'b_power_shot', priceCzk: 1650, textPath: 'energy.items.bPowerShot' },
  { name: 'Pure Hydrate', code: 'pure_hydrate', priceCzk: 2550, textPath: 'hydration.items.pureHydrate' },
  { name: 'Electrolyte Reset', code: 'electrolyte_reset', priceCzk: 3050, textPath: 'hydration.items.electrolyteReset' },
  { name: 'Jet Lag Recovery', code: 'jet_lag_recovery', priceCzk: 3250 },
  { name: 'Standard Iron', code: 'standard_iron', priceCzk: 2850 },
  { name: 'Premium Iron', code: 'premium_iron', priceCzk: 6450 },
];

/** Categories of the drip guide, in the page's order: the first segment of `textPath`. */
export const DRIP_GUIDE_CATEGORIES = ['immunity', 'energy', 'hydration'] as const;
