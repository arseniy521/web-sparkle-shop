import type { TFunction } from 'i18next';
import type { CartService } from './cartCatalog';

export function serviceTitle(t: TFunction, svc: CartService): string {
  if (svc.nameKey) return t(svc.nameKey, { defaultValue: svc.displayNameFallback });
  return svc.displayNameFallback;
}

export function serviceHint(t: TFunction, svc: CartService): string | null {
  if (!svc.hintKey) return svc.hintFallback;
  return t(svc.hintKey, { defaultValue: svc.hintFallback ?? '' }) || svc.hintFallback;
}
