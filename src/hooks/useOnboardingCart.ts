import { useSyncExternalStore } from 'react';
import { loadDraft, clearDraft, saveDraftCodes } from '@/components/OnboardingForm/onboardingPersist';
import { normalizeServiceCode } from '@/components/OnboardingForm/cartCatalog';
import { track } from '@/lib/analytics';


export interface OnboardingCartState {
  codes: string[];
  open: boolean;
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
};
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setState(next: Partial<OnboardingCartState>) {
  state = { ...state, ...next };
  emit();
}

export const onboardingCart = {
  getState: (): OnboardingCartState => state,

  add(code: string) {
    const normalized = normalizeServiceCode(code);
    if (!normalized) return;
    if (!state.codes.includes(normalized)) {
      track('cart_service_added', { service_code: normalized, source: 'menu' });
    }
    const codes = state.codes.includes(normalized) ? state.codes : [...state.codes, normalized];
    setState({ codes, open: true });
    saveDraftCodes(codes);
  },

  setCodes(nextCodes: string[]) {
    const codes = normalizeCodes(nextCodes);
    const same =
      codes.length === state.codes.length && codes.every((c, i) => c === state.codes[i]);
    if (same) return;
    setState({ codes });
    saveDraftCodes(codes);
  },

  openForm() {
    setState({ open: true });
  },

  setOpen(open: boolean) {
    setState({ open });
  },

  clearItems() {
    clearDraft();
    setState({ codes: [] });
  },

  clear() {
    clearDraft();
    setState({ codes: [], open: false });
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

const addToCartListener = (event: Event) => {
  const detail = (event as CustomEvent<{ code?: unknown }>).detail;
  const code = typeof detail?.code === 'string' ? detail.code : '';
  if (code) onboardingCart.add(code);
};

if (typeof window !== 'undefined' && !window.__niusCartBridge) {
  window.__niusCartBridge = true;
  window.addEventListener('nius:add-to-cart', addToCartListener);
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('nius:add-to-cart', addToCartListener);
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
