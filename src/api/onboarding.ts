import { z } from 'zod';

const MAX_ERROR_MESSAGE_LEN = 200;

const desiredTimingSchema = z.enum(['ASAP', 'MORNING', 'AFTERNOON', 'EVENING', 'CUSTOM_DATE']);
const paymentPreferenceSchema = z.enum(['CARD_ONLINE', 'CASH', 'BANK_TRANSFER']);

export type DesiredTiming = z.infer<typeof desiredTimingSchema>;
export type PaymentPreference = z.infer<typeof paymentPreferenceSchema>;

export const onboardingOrderItemSchema = z.object({
  id: z.string(),
  serviceName: z.string(),
  priceHalers: z.number(),
  /** Stable service code (slug), e.g. `iv_infusion`. */
  catalogSlug: z.string().nullable().optional(),
  serviceCode: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  /** Catalog service UUID for matching GET /services rows. */
  serviceExternalId: z.string().nullable().optional(),
});

export type OnboardingOrderItem = z.infer<typeof onboardingOrderItemSchema>;

export const onboardingOrderSchema = z.object({
  id: z.string(),
  status: z.string(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  addressTo: z.string().nullable().optional(),
  addressFloor: z.string().nullable(),
  addressIntercom: z.string().nullable(),
  desiredTiming: desiredTimingSchema.nullable(),
  desiredDate: z.string().nullable(),
  paymentPreference: paymentPreferenceSchema.nullable(),
  patientNote: z.string().nullable(),
  items: z.array(onboardingOrderItemSchema),
  totalHalers: z.number(),
  currency: z.string(),
  createdAt: z.string().optional(),
});

export type OnboardingOrder = z.infer<typeof onboardingOrderSchema>;

export const timingPricingSlotSchema = z.object({
  slot: desiredTimingSchema,
  surchargeHalers: z.number(),
  label: z.string(),
  tooltip: z.string().nullable(),
  isActive: z.boolean(),
});

export type TimingPricingSlot = z.infer<typeof timingPricingSlotSchema>;

export interface OnboardingAddressGeo {
  label: string;
  lat: number;
  lon: number;
  zip: string | null;
  city: string | null;
  cityPart: string | null;
  country: string;
  source: 'mapy' | 'manual';
}

export interface OnboardingUpdate {
  address?: string;
  addressGeo?: OnboardingAddressGeo | null;
  addressTo?: string;
  addressToGeo?: OnboardingAddressGeo | null;
  addressFloor?: string;
  addressIntercom?: string;
  desiredTiming?: DesiredTiming;
  desiredDate?: string;
  paymentPreference?: PaymentPreference;
  patientNote?: string;
}

const orderByPhoneResponseSchema = z.object({
  id: z.string(),
  phoneMasked: z.string().nullable(),
});

export type OrderByPhoneResponse = z.infer<typeof orderByPhoneResponseSchema>;

export class OnboardingApiError extends Error {
  status: number;
  constructor(message: string, status: number, options?: { cause?: unknown }) {
    super(message);
    this.name = 'OnboardingApiError';
    this.status = status;
    if (options && 'cause' in options) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const BASE_URL = envUrl || 'https://api.nius.cz';

function clampErrorMessage(raw: string): string {
  const t = raw.trim();
  if (t.length <= MAX_ERROR_MESSAGE_LEN) return t;
  return `${t.slice(0, MAX_ERROR_MESSAGE_LEN)}…`;
}

async function readJsonUnknown(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new OnboardingApiError('invalid_json', response.status);
  }
}

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown, status: number): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.warn('Onboarding API: response failed schema validation', parsed.error.flatten());
    throw new OnboardingApiError('invalid_response', status);
  }
  return parsed.data;
}

async function request<T>(
  schema: z.ZodType<T>,
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  const hasBody = init?.body != null;
  const headers = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {}),
  };

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new OnboardingApiError('network', 0, { cause: e });
  }

  if (!response.ok) {
    let message = clampErrorMessage(response.statusText || 'request_failed');
    try {
      const body = await readJsonUnknown(response);
      if (
        body &&
        typeof body === 'object' &&
        'message' in body &&
        typeof (body as { message: unknown }).message === 'string'
      ) {
        message = clampErrorMessage((body as { message: string }).message);
      }
    } catch {
      // ignore parse errors
    }
    throw new OnboardingApiError(message, response.status);
  }

  if (response.status === 204) {
    throw new OnboardingApiError('empty_response', response.status);
  }

  const data = await readJsonUnknown(response);
  return parseWithSchema(schema, data, response.status);
}

export async function contactMe(id: string): Promise<{ ok: true }> {
  const path = `/onboarding/order/${id}/contact-me`;
  const headers = {
    'Content-Type': 'application/json',
  };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new OnboardingApiError('network', 0, { cause: e });
  }

  if (!response.ok) {
    let message = clampErrorMessage(response.statusText || 'request_failed');
    try {
      const body = await readJsonUnknown(response);
      if (
        body &&
        typeof body === 'object' &&
        'message' in body &&
        typeof (body as { message: unknown }).message === 'string'
      ) {
        message = clampErrorMessage((body as { message: string }).message);
      }
    } catch {
      /* empty */
    }
    throw new OnboardingApiError(message, response.status);
  }

  if (response.status === 204) {
    return { ok: true };
  }

  const data = await readJsonUnknown(response);
  if (data === undefined || (typeof data === 'object' && data !== null && Object.keys(data as object).length === 0)) {
    return { ok: true };
  }
  return parseWithSchema(z.object({ ok: z.literal(true) }), data, response.status);
}

/** Order endpoints expect a JSON body; 204 is treated as a client-side error. */
async function requestOrder(path: string, init?: RequestInit): Promise<OnboardingOrder> {
  let response: Response;
  const hasBody = init?.body != null;
  const headers = {
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {}),
  };

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new OnboardingApiError('network', 0, { cause: e });
  }

  if (!response.ok) {
    let message = clampErrorMessage(response.statusText || 'request_failed');
    try {
      const body = await readJsonUnknown(response);
      if (
        body &&
        typeof body === 'object' &&
        'message' in body &&
        typeof (body as { message: unknown }).message === 'string'
      ) {
        message = clampErrorMessage((body as { message: string }).message);
      }
    } catch {
      /* empty */
    }
    throw new OnboardingApiError(message, response.status);
  }

  if (response.status === 204) {
    throw new OnboardingApiError('empty_response', response.status);
  }

  const data = await readJsonUnknown(response);
  return parseWithSchema(onboardingOrderSchema, data, response.status);
}

export function createOrder(phone: string, serviceId?: string): Promise<OnboardingOrder> {
  return requestOrder('/onboarding/order', {
    method: 'POST',
    body: JSON.stringify({ phone, ...(serviceId ? { serviceId } : {}) }),
  });
}

export function updateOrder(id: string, data: OnboardingUpdate): Promise<OnboardingOrder> {
  return requestOrder(`/onboarding/order/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getOrder(id: string): Promise<OnboardingOrder> {
  return requestOrder(`/onboarding/order/${id}`);
}

/** Anonymous onboarding: phone in JSON body only (not query); see POST /onboarding/order/by-phone. */
export function findOrderByPhone(phone: string): Promise<OrderByPhoneResponse> {
  return request(orderByPhoneResponseSchema, '/onboarding/order/by-phone', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function getTimingPricing(): Promise<TimingPricingSlot[]> {
  return request(z.array(timingPricingSlotSchema), '/onboarding/timing-pricing');
}

export function formatCZK(halers: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(halers / 100);
}
