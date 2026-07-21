import { useSyncExternalStore } from 'react';
import { loadDraft, clearDraft, saveDraftCodes } from '@/components/OnboardingForm/onboardingPersist';
import { normalizeServiceCode } from '@/components/OnboardingForm/cartCatalog';
import {
  track,
  trackCtaClick,
  type ConversionCta,
  type ConversionSource,
} from '@/lib/analytics';


export interface OnboardingCartState {
  codes: string[];
  open: boolean;
  openSource: ConversionSource | null;
}

declare global {
  interface Window {
    __niusCartBridge?: boolean;
  }
}

function normalizeCodes(rawCodes: string[]): string[] {
  const seen = new Set<string>();
  const codes: string[] = [];
  for (const raw of rawCodes) {
    const code = normalizeServiceCode(raw);
    if (!code || seen.has(code)) continue;
    seen.add(code);
    codes.push(code);
  }
  return codes;
}

const persisted = typeof window !== 'undefined' ? loadDraft() : null;
let state: OnboardingCartState = {
  codes: normalizeCodes(persisted?.codes ?? []),
  open: false,
  openSource: null,
};
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setState(next: Partial<OnboardingCartState>) {
  state = { ...state, ...next };
  emit();
}

function addService(code: string, openSource: ConversionSource | null) {
  const normalized = normalizeServiceCode(code);
  if (!normalized) return;
  if (!state.codes.includes(normalized)) {
    track('cart_service_added', { service_code: normalized, source: 'service_modal' });
  }
  const codes = state.codes.includes(normalized) ? state.codes : [...state.codes, normalized];
  setState(openSource ? { codes, open: true, openSource } : { codes });
  saveDraftCodes(codes);
}

export const onboardingCart = {
  getState: (): OnboardingCartState => state,

  add(code: string) {
    addService(code, null);
  },

  order(code: string, source: ConversionSource = 'service_modal') {
    addService(code, source);
  },

  setCodes(nextCodes: string[]) {
    const codes = normalizeCodes(nextCodes);
    const same =
      codes.length === state.codes.length && codes.every((c, i) => c === state.codes[i]);
    if (same) return;
    setState({ codes });
    saveDraftCodes(codes);
  },

  openForm(source: ConversionSource = 'header') {
    setState({ open: true, openSource: source });
  },

  setOpen(open: boolean) {
    setState(open ? { open } : { open, openSource: null });
  },

  clearItems() {
    clearDraft();
    setState({ codes: [] });
  },

  clear() {
    clearDraft();
    setState({ codes: [], open: false, openSource: null });
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

const addToCartListener = (event: Event) => {
  const detail = (event as CustomEvent<{ code?: unknown }>).detail;
  const code = typeof detail?.code === 'string' ? normalizeServiceCode(detail.code) : '';
  if (!code) return;
  trackCtaClick('add_to_cart', 'service_modal', { service_code: code });
  onboardingCart.add(code);
};

const orderServiceListener = (event: Event) => {
  const detail = (event as CustomEvent<{ code?: unknown }>).detail;
  const code = typeof detail?.code === 'string' ? normalizeServiceCode(detail.code) : '';
  if (!code) return;
  trackCtaClick('order_service', 'service_modal', { service_code: code });
  onboardingCart.order(code, 'service_modal');
};

const ctaClickListener = (event: Event) => {
  const detail = (event as CustomEvent<Record<string, unknown>>).detail;
  if (!detail) return;
  const cta = detail.cta;
  const source = detail.source;
  const allowedCtas: ConversionCta[] = [
    'choose_service',
    'view_service',
    'add_to_cart',
    'order_service',
    'cart',
    'account',
    'phone',
    'whatsapp',
  ];
  const allowedSources: ConversionSource[] = [
    'service_catalog',
    'package_card',
    'subscription_card',
    'booster',
  ];
  if (
    typeof cta !== 'string' ||
    typeof source !== 'string' ||
    !allowedCtas.includes(cta as ConversionCta) ||
    !allowedSources.includes(source as ConversionSource)
  ) return;

  const safeProps: Record<string, unknown> = {};
  if (typeof detail.service_code === 'string') safeProps.service_code = detail.service_code;
  if (typeof detail.package_id === 'string') safeProps.package_id = detail.package_id;
  if (typeof detail.subscription_id === 'string') safeProps.subscription_id = detail.subscription_id;
  if (typeof detail.booster_id === 'string') safeProps.booster_id = detail.booster_id;

  trackCtaClick(cta as ConversionCta, source as ConversionSource, safeProps);
};

if (typeof window !== 'undefined' && !window.__niusCartBridge) {
  window.__niusCartBridge = true;
  window.addEventListener('nius:add-to-cart', addToCartListener);
  window.addEventListener('nius:order-service', orderServiceListener);
  window.addEventListener('nius:cta-click', ctaClickListener);
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('nius:add-to-cart', addToCartListener);
    window.removeEventListener('nius:order-service', orderServiceListener);
    window.removeEventListener('nius:cta-click', ctaClickListener);
    window.__niusCartBridge = false;
  });
}

export function useOnboardingCart(): OnboardingCartState {
  return useSyncExternalStore(
    onboardingCart.subscribe,
    onboardingCart.getState,
    onboardingCart.getState,
  );
}
