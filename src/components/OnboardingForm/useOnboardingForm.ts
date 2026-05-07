import { useCallback, useEffect, useState } from 'react';
import {
  contactMe,
  createOrder,
  DesiredTiming,
  OnboardingApiError,
  OnboardingOrder,
  PaymentPreference,
  updateOrder,
} from '@/api/onboarding';
import type { CartService } from './cartCatalog';
import { normalizeServiceCode } from './cartCatalog';

export type OnboardingMode = 'standard' | 'escort';

/** CZ/SK: normalize to 9 national digits (strip 420/421 or a leading 0). */
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
): CartService[] {
  const target = normalizeServiceCode(initialCode ?? (mode === 'escort' ? DEFAULT_ESCORT_CODE : DEFAULT_STANDARD_CODE));
  const match = catalog.find((s) => s.code === target || s.id === target);
  return match ? [match] : [];
}

function resolveFormServiceCode(order: OnboardingOrder, catalog: CartService[]): string | null {
  const item = order.items?.[0];
  if (!item) return null;
  const rawSlug =
    item.code?.trim() ||
    item.catalogSlug?.trim() ||
    item.serviceCode?.trim() ||
    '';
  if (rawSlug) return normalizeServiceCode(rawSlug);
  const ext = item.serviceExternalId;
  if (ext) {
    const row = catalog.find((c) => c.serviceUuid === ext);
    return row?.code ?? null;
  }
  return null;
}

// Step order (UI sequence — phone is last before optional note):
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
  /** Service code (slug) after hydration; orders are submitted using `cart[n].serviceUuid` only. */
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
  initialMode?: OnboardingMode;
  open: boolean;
}): UseOnboardingFormResult {
  const { catalog, initialServiceCode, open, initialMode = 'standard' } = opts;

  const prefilledInitial = (): CartService[] => prefilledCartFor(catalog, initialMode, initialServiceCode);

  const [step, setStep] = useState<OnboardingStep>(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const initialCodeNorm = initialServiceCode ? normalizeServiceCode(initialServiceCode) : null;

  const [data, setData] = useState<OnboardingFormData>(() => ({
    ...EMPTY_DATA,
    serviceCode: initialCodeNorm,
  }));

  const [cart, setCart] = useState<CartService[]>(() => []);

  useEffect(() => {
    if (!open || catalog.length === 0) return;
    setCart((prev) => (prev.length === 0 ? prefilledCartFor(catalog, initialMode, initialServiceCode) : prev));
  }, [open, catalog, initialMode, initialServiceCode]);

  const isEscortMode = cart.length > 0 && cart.every((s) => s.kind === 'escort');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);

  const reset = useCallback(() => {
    const nextCart = prefilledCartFor(catalog, initialMode, initialServiceCode);
    const nextCode = normalizeServiceCode(
      initialServiceCode ?? (initialMode === 'escort' ? DEFAULT_ESCORT_CODE : DEFAULT_STANDARD_CODE),
    );
    setOrderId(null);
    setData({
      ...EMPTY_DATA,
      serviceCode: nextCart[0]?.code ?? nextCode,
    });
    setCart(nextCart);
    setStep(1);
    setError(null);
    setIsLoading(false);
    setTestMode(false);
  }, [catalog, initialMode, initialServiceCode]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const addToCart = useCallback((service: CartService) => {
    setCart((prev) => (prev.some((s) => s.id === service.id) ? prev : [...prev, service]));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((s) => s.id !== id));
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
      const code = resolveFormServiceCode(order, catalog);
      const row = code ? catalog.find((c) => c.code === code) : undefined;
      setOrderId(order.id);
      setData({
        phone: order.phone ?? '',
        serviceCode: code,
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
      setCart(row ? [row] : code ? [] : []);
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
    return true;
  }, [data.desiredTiming, data.desiredDate]);

  const submitPhoneAndCreate = useCallback(async (): Promise<boolean> => {
    const primaryUuid = cart[0]?.serviceUuid;
    if (!isValidPhoneNumber(data.phone) || cart.length === 0 || !primaryUuid) {
      setError('validation');
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      const currentOrderId = orderId;
      let targetOrderId = currentOrderId;

      if (!targetOrderId) {
        const order = await createOrder(data.phone, primaryUuid);
        targetOrderId = order.id;
        setOrderId(targetOrderId);
      }

      await updateOrder(targetOrderId, {
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

      setStep('final');
      return true;
    } catch (e) {
      setError(handleApiError(e));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [data, cart, orderId, handleApiError]);

  const submitContactMe = useCallback(async (): Promise<boolean> => {
    if (!orderId) return false;
    setIsLoading(true);
    setError(null);
    try {
      await contactMe(orderId);
      setStep('thankyou');
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

    const devPhone = '+420773629123';

    setTestMode(true);
    setError(null);
    setIsLoading(false);
    setData((prev) => ({
      ...prev,
      address: prev.address || 'Vaclavske namesti 1, Praha',
      desiredTiming: prev.desiredTiming ?? 'ASAP',
      phone: prev.phone || devPhone,
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
