export interface CartService {
  id: string;
  code: string;
  serviceUuid: string;
  nameKey: string;
  displayNameFallback: string;
  hintKey: string;
  hintFallback: string | null;
  priceCzk: number;
  durationMin: number;
  iconKey: string;
  kind: 'standard' | 'escort';
}

export interface CartItem extends CartService {
  quantity: number;
}

function catalogKeys(code: string) {
  return {
    nameKey: `serviceCatalog.${code}.title`,
    hintKey: `serviceCatalog.${code}.description`,
  };
}

const SERVICE_CODES = [
  'immunity_lite', 'immunity_power', 'defense_shield', 'glow_post_flu',
  'ceo_recharge', 'metabolic_reset', 'b_power_shot',
  'pure_hydrate', 'electrolyte_reset', 'standard_iron', 'premium_iron',
  'post_op_wound_dressing', 'hygiene_assistance', 'nurse_escort', 'jet_lag_recovery',
  'b12_energy_shot', 'b_vitamin_complex', 'vitamin_d_shot', 'vitamin_b1_thiamin',
  'glutathione_glow', 'magnesium_boost', 'zinc_trace_minerals', 'vitamin_c_upgrade',
  'vitamin_b6_shot',
  'ivf_hormone_injection_at_home_hotel',
] as const;

/**
 * Services that exist in the backend (doctor-ordered / medicinal products) but are not
 * offered on the public website or in its order form: advertising them to the public
 * conflicts with Czech ad law and Google Ads healthcare policy.
 */
export const WEBSITE_HIDDEN_SERVICE_CODES: ReadonlySet<string> = new Set([
  'nausea_relief', 'backache_relief', 'allergy_stop', 'nerve_regen', 'anti_nausea_addon',
]);

/** Public website offers only known catalog codes that are not hidden. */
export function isOfferedOnWebsite(code: string): boolean {
  const normalized = normalizeServiceCode(code);
  if (WEBSITE_HIDDEN_SERVICE_CODES.has(normalized)) return false;
  return normalized in SERVICE_I18N;
}

export const SERVICE_I18N: Record<
  string,
  {
    nameKey: string;
    hintKey?: string;
  }
> = {
  iv_infusion: {
    nameKey: 'services.ivInfusion.title',
    hintKey: 'services.ivInfusion.description',
  },
  escort: {
    nameKey: 'services.escort.title',
    hintKey: 'services.escort.description',
  },
  ...Object.fromEntries(SERVICE_CODES.map((code) => [code, catalogKeys(code)])),
};

export function normalizeServiceCode(raw: string): string {
  const t = raw.trim();
  if (t === 'iv-infusion') return 'iv_infusion';
  return t.replace(/-/g, '_');
}

export type PublicServicePayload = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  priceHalers: number;
  kind: 'standard' | 'escort';
  iconKey: string;
  durationMin: number;
};

export function mapDtoToCartService(dto: PublicServicePayload): CartService {
  const code = normalizeServiceCode(dto.code);
  const i18n = SERVICE_I18N[code];
  const nameKey = i18n?.nameKey ?? '';
  const hintKey = i18n?.hintKey ?? '';

  return {
    id: code,
    code,
    serviceUuid: dto.id,
    nameKey,
    displayNameFallback: dto.name,
    hintKey,
    hintFallback: dto.description ?? null,
    priceCzk: dto.priceHalers / 100,
    durationMin: dto.durationMin,
    iconKey: dto.iconKey,
    kind: dto.kind,
  };
}
