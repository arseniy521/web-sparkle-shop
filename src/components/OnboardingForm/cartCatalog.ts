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

function catalogKeys(code: string) {
  return {
    nameKey: `serviceCatalog.${code}.title`,
    hintKey: `serviceCatalog.${code}.description`,
  };
}

const SERVICE_CODES = [
  'immunity_lite', 'immunity_power', 'defense_shield', 'glow_post_flu',
  'ceo_recharge', 'metabolic_reset', 'b_power_shot',
  'pure_hydrate', 'electrolyte_reset', 'nausea_relief',
  'standard_iron', 'premium_iron', 'nerve_regen', 'backache_relief', 'allergy_stop',
  'post_op_wound_dressing', 'hygiene_assistance', 'nurse_escort', 'jet_lag_recovery',
  'b12_energy_shot', 'b_vitamin_complex', 'vitamin_d_shot', 'vitamin_b1_thiamin',
  'glutathione_glow', 'magnesium_boost', 'zinc_trace_minerals', 'vitamin_c_upgrade',
  'vitamin_b6_shot', 'anti_nausea_addon',
] as const;

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
