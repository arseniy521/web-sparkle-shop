import { describe, expect, it } from 'vitest';
import { isOfferedOnWebsite } from './cartCatalog';

describe('isOfferedOnWebsite', () => {
  it('offers regular vitamin/hydration and nursing services', () => {
    for (const code of ['immunity_lite', 'pure_hydrate', 'jet_lag_recovery', 'post_op_wound_dressing', 'ivf_hormone_injection_at_home_hotel', 'standard_iron', 'premium_iron']) {
      expect(isOfferedOnWebsite(code)).toBe(true);
    }
  });

  it('hides doctor-ordered or medicinal-product services and unknown codes', () => {
    for (const code of ['nausea_relief', 'backache_relief', 'allergy_stop', 'nerve_regen', 'anti_nausea_addon', 'testovaya_usluga']) {
      expect(isOfferedOnWebsite(code)).toBe(false);
    }
  });
});
