import type { OnboardingFormData, AddressGeo } from './useOnboardingForm';


const STORAGE_KEY = 'nius_onboarding_draft_v2';
const LEGACY_LOCAL_STORAGE_KEY = 'nius_onboarding_draft_v1';
const TTL_MS = 24 * 60 * 60 * 1000;

const DESIRED_TIMINGS = new Set(['ASAP', 'MORNING', 'AFTERNOON', 'EVENING', 'CUSTOM_DATE']);
const PAYMENT_PREFERENCES = new Set(['CARD_ONLINE', 'CASH', 'BANK_TRANSFER']);

export interface OnboardingDraft {
  codes: string[];
  data: OnboardingFormData;
  savedAt: number;
}

const EMPTY_DATA: OnboardingFormData = {
  phone: '',
  serviceCode: null,
  address: '',
  addressGeo: null,
  addressTo: '',
  addressToGeo: null,
  addressFloor: '',
  addressIntercom: '',
  desiredTiming: null,
  desiredDate: null,
  paymentPreference: null,
  patientNote: '',
};

function getSessionStorage(): Storage | undefined {
  return typeof window === 'undefined' ? undefined : window.sessionStorage;
}

function getLocalStorage(): Storage | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}

function storageAvailable(storage: Storage | undefined): storage is Storage {
  return !!storage;
}

function safeGet(storage: Storage | undefined, key: string): string | null {
  if (!storageAvailable(storage)) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage | undefined, key: string, value: string): void {
  if (!storageAvailable(storage)) return;
  try {
    storage.setItem(key, value);
  } catch {
    return;
  }
}

function safeRemove(storage: Storage | undefined, key: string): void {
  if (!storageAvailable(storage)) return;
  try {
    storage.removeItem(key);
  } catch {
    return;
  }
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function sanitizeGeo(value: unknown): AddressGeo | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.label !== 'string' ||
    typeof v.lat !== 'number' ||
    !Number.isFinite(v.lat) ||
    typeof v.lon !== 'number' ||
    !Number.isFinite(v.lon) ||
    typeof v.country !== 'string' ||
    (v.source !== 'mapy' && v.source !== 'manual')
  ) {
    return null;
  }

  return {
    label: v.label,
    lat: v.lat,
    lon: v.lon,
    zip: asNullableString(v.zip),
    city: asNullableString(v.city),
    cityPart: asNullableString(v.cityPart),
    country: v.country,
    source: v.source,
  };
}

function sanitizeData(value: unknown): OnboardingFormData {
  if (!value || typeof value !== 'object') return EMPTY_DATA;
  const v = value as Record<string, unknown>;
  const desiredTiming = typeof v.desiredTiming === 'string' && DESIRED_TIMINGS.has(v.desiredTiming)
    ? v.desiredTiming as OnboardingFormData['desiredTiming']
    : null;
  const paymentPreference = typeof v.paymentPreference === 'string' && PAYMENT_PREFERENCES.has(v.paymentPreference)
    ? v.paymentPreference as OnboardingFormData['paymentPreference']
    : null;

  return {
    phone: asString(v.phone),
    serviceCode: asNullableString(v.serviceCode),
    address: asString(v.address),
    addressGeo: sanitizeGeo(v.addressGeo),
    addressTo: asString(v.addressTo),
    addressToGeo: sanitizeGeo(v.addressToGeo),
    addressFloor: asString(v.addressFloor),
    addressIntercom: asString(v.addressIntercom),
    desiredTiming,
    desiredDate: asNullableString(v.desiredDate),
    paymentPreference,
    patientNote: asString(v.patientNote),
  };
}

function sanitizeCodes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const codes: string[] = [];
  for (const raw of value) {
    if (typeof raw !== 'string') continue;
    const code = raw.trim();
    if (!code || seen.has(code)) continue;
    seen.add(code);
    codes.push(code);
  }
  return codes;
}

function parseDraft(raw: string | null): OnboardingDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object' || typeof parsed.savedAt !== 'number') {
      return null;
    }
    if (Date.now() - parsed.savedAt > TTL_MS) return null;
    return {
      codes: sanitizeCodes(parsed.codes),
      data: sanitizeData(parsed.data),
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

function readRaw(): OnboardingDraft | null {
  return parseDraft(safeGet(getSessionStorage(), STORAGE_KEY));
}

function writeRaw(draft: OnboardingDraft): void {
  safeSet(getSessionStorage(), STORAGE_KEY, JSON.stringify(draft));
}

export function loadDraft(): OnboardingDraft | null {
  const sessionDraft = parseDraft(safeGet(getSessionStorage(), STORAGE_KEY));
  if (sessionDraft) return sessionDraft;

  const legacyDraft = parseDraft(safeGet(getLocalStorage(), LEGACY_LOCAL_STORAGE_KEY));
  safeRemove(getLocalStorage(), LEGACY_LOCAL_STORAGE_KEY);
  if (legacyDraft) {
    writeRaw(legacyDraft);
    return legacyDraft;
  }

  safeRemove(getSessionStorage(), STORAGE_KEY);
  return null;
}

export function saveDraftData(data: OnboardingFormData): void {
  const prev = readRaw();
  writeRaw({ codes: prev?.codes ?? [], data: sanitizeData(data), savedAt: Date.now() });
}

export function saveDraftCodes(codes: string[]): void {
  const prev = readRaw();
  writeRaw({ codes: sanitizeCodes(codes), data: prev?.data ?? EMPTY_DATA, savedAt: Date.now() });
}

export function clearDraft(): void {
  safeRemove(getSessionStorage(), STORAGE_KEY);
  safeRemove(getLocalStorage(), LEGACY_LOCAL_STORAGE_KEY);
}
