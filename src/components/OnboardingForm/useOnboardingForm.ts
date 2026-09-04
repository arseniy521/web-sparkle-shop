import { useCallback, useEffect, useRef, useState } from 'react';
import { isValidPhoneNumber as isValidIntlPhoneNumber } from 'react-phone-number-input';
import {
  contactMe,
  createOrder,
  DesiredTiming,
  OnboardingApiError,
  OnboardingOrder,
  OnboardingOrderItem,
  PaymentPreference,
} from '@/api/onboarding';
import type { CartItem, CartService } from './cartCatalog';
import { normalizeServiceCode } from './cartCatalog';
import { loadDraft, saveDraftData } from './onboardingPersist';
import { track, trackCtaClick, type ConversionSource } from '@/lib/analytics';

export type OnboardingMode = 'standard' | 'escort';

/** Accepts any valid international number (E.164 from PhoneInput). */
export function isValidPhoneNumber(value: string): boolean {
  if (!value?.trim()) return false;
  try {
    return isValidIntlPhoneNumber(value);
  } catch {
    return false;
  }
}

const DEFAULT_STANDARD_CODE = 'iv_infusion';
const DEFAULT_ESCORT_CODE = 'escort';

function prefilledCartFor(
  catalog: CartService[],
  mode: OnboardingMode,
  initialCode?: string,
  initialCodes?: string[],
): CartItem[] {
  if (initialCodes && initialCodes.length > 0) {
    const rows = new Map<string, CartItem>();
    const unmatched: string[] = [];
    for (const raw of initialCodes) {
      const target = normalizeServiceCode(raw);
      const match = catalog.find((s) => s.code === target || s.id === target);
      if (match) {
        const existing = rows.get(match.id);
        rows.set(match.id, {
          ...match,
          quantity: (existing?.quantity ?? 0) + 1,
        });
      } else if (!match) {
        unmatched.push(target);
      }
    }
    if (import.meta.env.DEV && unmatched.length > 0) {
      console.warn('Onboarding cart: service code(s) missing from catalog', unmatched);
    }
    if (rows.size > 0) return Array.from(rows.values());
  }
  const target = normalizeServiceCode(initialCode ?? (mode === 'escort' ? DEFAULT_ESCORT_CODE : DEFAULT_STANDARD_CODE));
  const match = catalog.find((s) => s.code === target || s.id === target);
  return match ? [{ ...match, quantity: 1 }] : [];
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

function cartFromOrder(order: OnboardingOrder, catalog: CartService[]): CartItem[] {
  const rows = new Map<string, CartItem>();

  for (const item of order.items ?? []) {
    const code = resolveOrderItemServiceCode(item, catalog);
    const row = code
      ? catalog.find((c) => c.code === code)
      : catalog.find((c) => c.serviceUuid === (item.serviceExternalId || item.serviceId));
    if (!row) continue;
    const existing = rows.get(row.id);
    rows.set(row.id, {
      ...row,
      quantity: (existing?.quantity ?? 0) + Math.max(1, item.quantity ?? 1),
    });
  }

  return Array.from(rows.values());
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
  cart: CartItem[];
  isEscortMode: boolean;
  addToCart: (service: CartService) => void;
  changeQuantity: (id: string, quantity: number) => void;
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
  analyticsSource?: ConversionSource;
  onCartCodesChange?: (codes: string[]) => void;
  open: boolean;
}): UseOnboardingFormResult {
  const {
    catalog,
    initialServiceCode,
    initialServiceCodes,
    open,
    initialMode = 'standard',
    analyticsSource = 'header',
    onCartCodesChange,
  } = opts;

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

  const [cart, setCart] = useState<CartItem[]>(() => []);

  const codesKey = (initialServiceCodes ?? []).join(',');
  const [cartHydratedKey, setCartHydratedKey] = useState<string | null>(null);
  const cartInitializedForOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      cartInitializedForOpenRef.current = false;
      setCartHydratedKey(null);
      return;
    }
    if (orderId || catalog.length === 0) return;

    const hasExplicitCart = initialServiceCodes !== undefined;
    const shouldKeepExplicitEmpty =
      hasExplicitCart &&
      initialServiceCodes.length === 0 &&
      cartInitializedForOpenRef.current;
    const nextCart = shouldKeepExplicitEmpty
      ? []
      : prefilledCartFor(catalog, initialMode, initialServiceCode, initialServiceCodes);

    cartInitializedForOpenRef.current = true;
    setCart(nextCart);
    setCartHydratedKey(codesKey);
  }, [open, orderId, catalog, initialMode, initialServiceCode, initialServiceCodes, codesKey]);

  useEffect(() => {
    if (!open || orderId || cartHydratedKey !== codesKey) return;
    onCartCodesChange?.(
      cart.flatMap((item) => Array.from({ length: item.quantity }, () => item.code)),
    );
  }, [open, orderId, cart, cartHydratedKey, codesKey, onCartCodesChange]);

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
      trackCtaClick('add_to_cart', 'order_form', { service_code: service.code });
      track('cart_service_added', { service_code: service.code, source: 'form' });
      const existing = prev.find((item) => item.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...service, quantity: 1 }];
    });
  }, []);

  const changeQuantity = useCallback((id: string, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (!existing || quantity === existing.quantity) return prev;
      if (quantity < 1) {
        track('cart_service_removed', { service_code: existing.code });
        return prev.filter((item) => item.id !== id);
      }
      if (quantity > existing.quantity) {
        track('cart_service_added', { service_code: existing.code, source: 'form' });
      }
      return prev.map((item) => item.id === id ? { ...item, quantity } : item);
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
    track('order_step_completed', { step: 'address', source: analyticsSource });
    return true;
  }, [data.address, data.addressTo, isEscortMode, analyticsSource]);

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
    track('order_step_completed', { step: 'timing', source: analyticsSource });
    return true;
  }, [data.desiredTiming, data.desiredDate, analyticsSource]);

  const submitPhoneAndCreate = useCallback(async (): Promise<boolean> => {
    const orderItems = cart.map((service) => ({
      serviceId: service.serviceUuid,
      quantity: service.quantity,
    }));
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
        items_count: cart.reduce((sum, item) => sum + item.quantity, 0),
        total_czk: cart.reduce((sum, item) => sum + item.priceCzk * item.quantity, 0),
        service_codes: cart.map((s) => s.code),
        source: analyticsSource,
      });
      return true;
    } catch (e) {
      const errorCode = handleApiError(e);
      setError(errorCode);
      track('order_create_failed', { error_code: errorCode, source: analyticsSource });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [data, cart, handleApiError, analyticsSource]);

  const submitContactMe = useCallback(async (): Promise<boolean> => {
    if (!orderId) return false;
    setIsLoading(true);
    setError(null);
    try {
      await contactMe(orderId);
      setStep('thankyou');
      track('contact_me_requested', { order_id: orderId, source: analyticsSource });
      return true;
    } catch (e) {
      setError(handleApiError(e));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [orderId, handleApiError, analyticsSource]);

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
    changeQuantity,
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
