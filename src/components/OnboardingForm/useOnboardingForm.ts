import { useCallback, useEffect, useState } from 'react';
import {
  contactMe,
  createOrder,
  DesiredTiming,
  OnboardingApiError,
  OnboardingOrder,
  OnboardingOrderItem,
  PaymentPreference,
} from '@/api/onboarding';
import type { CartService } from './cartCatalog';
import { normalizeServiceCode } from './cartCatalog';
import { loadDraft, saveDraftData } from './onboardingPersist';
import { track } from '@/lib/analytics';

export type OnboardingMode = 'standard' | 'escort';

export function isValidPhoneNumber(value: string): boolean {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('420')) d = d.slice(3);
  else if (d.startsWith('421')) d = d.slice(3);
  if (d.length === 10 && d.startsWith('0')) d = d.slice(1);
  return d.length === 9 && /^[1-9]\d{8}$/.test(d);
}

const DEFAULT_STANDARD_CODE = 'iv_infusion';
const DEFAULT_ESCORT_CODE = 'escort';

function prefilledCartFor(
  catalog: CartService[],
  mode: OnboardingMode,
  initialCode?: string,
  initialCodes?: string[],
): CartService[] {
  if (initialCodes && initialCodes.length > 0) {
    const rows: CartService[] = [];
    const seen = new Set<string>();
    const unmatched: string[] = [];
    for (const raw of initialCodes) {
      const target = normalizeServiceCode(raw);
      const match = catalog.find((s) => s.code === target || s.id === target);
      if (match && !seen.has(match.id)) {
        seen.add(match.id);
        rows.push(match);
      } else if (!match) {
        unmatched.push(target);
      }
    }
    if (import.meta.env.DEV && unmatched.length > 0) {
      console.warn('Onboarding cart: service code(s) missing from catalog', unmatched);
    }
    if (rows.length > 0) return rows;
  }
  const target = normalizeServiceCode(initialCode ?? (mode === 'escort' ? DEFAULT_ESCORT_CODE : DEFAULT_STANDARD_CODE));
  const match = catalog.find((s) => s.code === target || s.id === target);
  return match ? [match] : [];
}

function resolveOrderItemServiceCode(item: OnboardingOrderItem, catalog: CartService[]): string | null {
  const rawSlug =
    item.code?.trim() ||
    item.catalogSlug?.trim() ||
    item.serviceCode?.trim() ||
    item.service?.code?.trim() ||
    '';
  if (rawSlug) return normalizeServiceCode(rawSlug);

  const ext = item.serviceExternalId || item.serviceId;
  if (ext) {
    const row = catalog.find((c) => c.serviceUuid === ext);
    return row?.code ?? null;
  }
  return null;
}

function cartFromOrder(order: OnboardingOrder, catalog: CartService[]): CartService[] {
  const rows: CartService[] = [];
  const seen = new Set<string>();

  for (const item of order.items ?? []) {
    const code = resolveOrderItemServiceCode(item, catalog);
    const row = code
      ? catalog.find((c) => c.code === code)
      : catalog.find((c) => c.serviceUuid === (item.serviceExternalId || item.serviceId));
    if (!row || seen.has(row.id)) continue;
    seen.add(row.id);
    rows.push(row);
  }

  return rows;
}

export type OnboardingStep = 1 | 2 | 3 | 'final' | 'thankyou';

export interface AddressGeo {
  label: string;
  lat: number;
  lon: number;
  zip: string | null;
  city: string | null;
  cityPart: string | null;
  country: string;
  source: 'mapy' | 'manual';
}

export interface OnboardingFormData {
  phone: string;
  serviceCode: string | null;
  address: string;
  addressGeo: AddressGeo | null;
  addressTo: string;
  addressToGeo: AddressGeo | null;
  addressFloor: string;
  addressIntercom: string;
  desiredTiming: DesiredTiming | null;
  desiredDate: string | null;
  paymentPreference: PaymentPreference | null;
  patientNote: string;
}

export interface UseOnboardingFormResult {
  step: OnboardingStep;
  orderId: string | null;
  orderAccessToken: string | null;
  data: OnboardingFormData;
  cart: CartService[];
  isEscortMode: boolean;
  addToCart: (service: CartService) => void;
  removeFromCart: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void;
  setFields: (patch: Partial<OnboardingFormData>) => void;
  goToStep: (step: OnboardingStep) => void;
  submitAddress: () => boolean;
  submitTiming: () => boolean;
  submitPhoneAndCreate: () => Promise<boolean>;
  submitContactMe: () => Promise<boolean>;
  advanceTestStep: () => void;
  reset: () => void;
  hydrateFromOrder: (order: OnboardingOrder) => void;
  testMode: boolean;
}

const EMPTY_DATA: Omit<OnboardingFormData, 'serviceCode'> = {
  phone: '',
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

export function useOnboardingForm(opts: {
  catalog: CartService[];
  initialServiceCode?: string;
  initialServiceCodes?: string[];
  initialMode?: OnboardingMode;
  open: boolean;
}): UseOnboardingFormResult {
  const { catalog, initialServiceCode, initialServiceCodes, open, initialMode = 'standard' } = opts;

  const [step, setStep] = useState<OnboardingStep>(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderAccessToken, setOrderAccessToken] = useState<string | null>(null);
  const initialCodeNorm = initialServiceCode ? normalizeServiceCode(initialServiceCode) : null;

  const [data, setData] = useState<OnboardingFormData>(() => {
    const draft = loadDraft();
    if (draft?.data) {
      return { ...EMPTY_DATA, ...draft.data, serviceCode: initialCodeNorm ?? draft.data.serviceCode };
    }
    return { ...EMPTY_DATA, serviceCode: initialCodeNorm };
  });

  const [cart, setCart] = useState<CartService[]>(() => []);

  const codesKey = (initialServiceCodes ?? []).join(',');

  useEffect(() => {
    if (!open || catalog.length === 0) return;
    const prefilled = prefilledCartFor(catalog, initialMode, initialServiceCode, initialServiceCodes);
    setCart((prev) => {
      if (initialServiceCodes && initialServiceCodes.length > 0) {
        const byId = new Map(prev.map((s) => [s.id, s]));
        for (const row of prefilled) byId.set(row.id, row);
        return Array.from(byId.values());
      }
      return prev.length === 0 ? prefilled : prev;
    });
  }, [open, catalog, initialMode, initialServiceCode, initialServiceCodes, codesKey]);

  const isEscortMode = cart.some((s) => s.kind === 'escort');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    if (orderId) return;
    saveDraftData(data);
  }, [data, orderId]);

  const reset = useCallback(() => {
    setOrderId(null);
    setOrderAccessToken(null);
    setStep(1);
    setError(null);
    setIsLoading(false);
    setTestMode(false);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const addToCart = useCallback((service: CartService) => {
    setCart((prev) => {
      if (prev.some((s) => s.id === service.id)) return prev;
      track('cart_service_added', { service_code: service.code, source: 'form' });
      return [...prev, service];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => {
      const removed = prev.find((s) => s.id === id);
      if (removed) track('cart_service_removed', { service_code: removed.code });
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const setField = useCallback(
    <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setFields = useCallback((patch: Partial<OnboardingFormData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const goToStep = useCallback((next: OnboardingStep) => {
    setStep(next);
    setError(null);
  }, []);

  const hydrateFromOrder = useCallback(
    (order: OnboardingOrder) => {
      const nextCart = cartFromOrder(order, catalog);
      const primaryCode = nextCart[0]?.code ??
        (order.items?.[0] ? resolveOrderItemServiceCode(order.items[0], catalog) : null);
      setOrderId(order.id);
      setData({
        phone: order.phone ?? '',
        serviceCode: primaryCode,
        address: order.address ?? '',
        addressGeo: null,
        addressTo: order.addressTo ?? '',
        addressToGeo: null,
        addressFloor: order.addressFloor ?? '',
        addressIntercom: order.addressIntercom ?? '',
        desiredTiming: order.desiredTiming,
        desiredDate: order.desiredDate,
        paymentPreference: order.paymentPreference,
        patientNote: order.patientNote ?? '',
      });
      setCart(nextCart);
      setStep(1);
    },
    [catalog],
  );

  const handleApiError = useCallback((e: unknown): string => {
    if (e instanceof OnboardingApiError) {
      if (e.status === 429) return 'rate_limit';
      if (e.status === 0) return 'network';
      if (e.status === 404) return 'not_found';
      if (e.status === 502) return 'server';
      if (e.status >= 400 && e.status < 500) return 'validation';
      return 'server';
    }
    return 'unknown';
  }, []);

  const submitAddress = useCallback((): boolean => {
    if (data.address.trim().length < 5) {
      setError('validation');
      return false;
    }
    if (isEscortMode && data.addressTo.trim().length < 5) {
      setError('validation');
      return false;
    }
    setError(null);
    setStep(2);
    track('order_step_completed', { step: 'address' });
    return true;
  }, [data.address, data.addressTo, isEscortMode]);

  const submitTiming = useCallback((): boolean => {
    if (!data.desiredTiming) {
      setError('validation');
      return false;
    }
    if (data.desiredTiming === 'CUSTOM_DATE' && !data.desiredDate) {
      setError('validation');
      return false;
    }
    setError(null);
    setStep(3);
    track('order_step_completed', { step: 'timing' });
    return true;
  }, [data.desiredTiming, data.desiredDate]);

  const submitPhoneAndCreate = useCallback(async (): Promise<boolean> => {
    const orderItems = cart.map((service) => ({ serviceId: service.serviceUuid }));
    if (
      !isValidPhoneNumber(data.phone) ||
      orderItems.length === 0 ||
      orderItems.some((item) => !item.serviceId)
    ) {
      setError('validation');
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      const order = await createOrder({
        phone: data.phone,
        items: orderItems,
        address: data.address,
        ...(data.addressGeo ? { addressGeo: data.addressGeo } : {}),
        ...(data.addressTo.trim() ? { addressTo: data.addressTo } : {}),
        ...(data.addressToGeo ? { addressToGeo: data.addressToGeo } : {}),
        ...(data.addressFloor ? { addressFloor: data.addressFloor } : {}),
        ...(data.addressIntercom ? { addressIntercom: data.addressIntercom } : {}),
        ...(data.desiredTiming ? { desiredTiming: data.desiredTiming } : {}),
        ...(data.desiredTiming === 'CUSTOM_DATE' && data.desiredDate
          ? { desiredDate: data.desiredDate }
          : {}),
        ...(data.paymentPreference ? { paymentPreference: data.paymentPreference } : {}),
        ...(data.patientNote.trim() ? { patientNote: data.patientNote.trim() } : {}),
      });
      setOrderId(order.id);
      setOrderAccessToken(order.accessToken ?? null);
      setStep('final');
      track('order_created', {
        order_id: order.id,
        items_count: cart.length,
        total_czk: cart.reduce((sum, s) => sum + s.priceCzk, 0),
        service_codes: cart.map((s) => s.code),
      });
      return true;
    } catch (e) {
      const errorCode = handleApiError(e);
      setError(errorCode);
      track('order_create_failed', { error_code: errorCode });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [data, cart, handleApiError]);

  const submitContactMe = useCallback(async (): Promise<boolean> => {
    if (!orderId) return false;
    setIsLoading(true);
    setError(null);
    try {
      await contactMe(orderId);
      setStep('thankyou');
      track('contact_me_requested', { order_id: orderId });
      return true;
    } catch (e) {
      setError(handleApiError(e));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [orderId, handleApiError]);

  const advanceTestStep = useCallback(() => {
    if (!import.meta.env.DEV) return;

    setTestMode(true);
    setError(null);
    setIsLoading(false);
    setData((prev) => ({
      ...prev,
      address: prev.address || 'Vaclavske namesti 1, Praha',
      desiredTiming: prev.desiredTiming ?? 'ASAP',
    }));
    setStep((current) => {
      if (current === 1) return 2;
      if (current === 2) return 3;
      if (current === 3) return 'final';
      if (current === 'final') return 'thankyou';
      return 1;
    });
    setOrderId((c) => c ?? 'test-order-id');
  }, []);

  return {
    step,
    orderId,
    orderAccessToken,
    data,
    cart,
    isEscortMode,
    addToCart,
    removeFromCart,
    isLoading,
    error,
    setField,
    setFields,
    goToStep,
    submitAddress,
    submitTiming,
    submitPhoneAndCreate,
    submitContactMe,
    advanceTestStep,
    reset,
    hydrateFromOrder,
    testMode,
  };
}
