import { useSyncExternalStore } from 'react';
import { cart, type CartState } from '@/scripts/cart-core';

export { cart as onboardingCart };

export function useOnboardingCart(): CartState {
  return useSyncExternalStore(cart.subscribe, cart.getState, cart.getState);
}
