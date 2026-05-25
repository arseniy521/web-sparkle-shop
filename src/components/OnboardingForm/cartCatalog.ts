/** Cart line UI model after mapping GET /services. */
export interface CartService {
  /** Stable code/slug from the backend (matches API `code`). */
  id: string;
  code: string;
  /** Service UUID sent to POST /onboarding/order as `serviceId`. */
  serviceUuid: string;
  /** i18n key for title; optional, falls back to `displayNameFallback`. */
  nameKey: string;
  displayNameFallback: string;
  /** i18n key for hint; optional. */
  hintKey: string;
  hintFallback: string | null;
  priceCzk: number;
  durationMin: number;
  iconKey: string;
  kind: 'standard' | 'escort';
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
};

/** Back-compat for legacy links/params using hyphens. */
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
