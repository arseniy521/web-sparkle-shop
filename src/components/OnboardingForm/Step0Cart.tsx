import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { X, Droplet, Syringe, Bandage, Microscope, HandHeart, Citrus, Ambulance, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CartService } from './cartCatalog';

const ICON_MAP = {
  drop: Droplet,
  syringe: Syringe,
  bandage: Bandage,
  microscope: Microscope,
  hand: HandHeart,
  citrus: Citrus,
  ambulance: Ambulance,
} as const satisfies Record<string, LucideIcon>;

function resolveIcon(iconKey: string): LucideIcon {
  const normalized = iconKey.trim().toLowerCase();
  if (normalized in ICON_MAP) return ICON_MAP[normalized as keyof typeof ICON_MAP];
  return Droplet;
}

export const ServiceIcon = ({ iconKey, className }: { iconKey: string; className?: string }) => {
  const Icon = resolveIcon(iconKey);
  return <Icon className={className} />;
};

interface CartHeaderProps {
  cart: CartService[];
  onRemove: (id: string) => void;
}

function serviceTitle(t: TFunction, svc: CartService): string {
  if (svc.nameKey) return t(svc.nameKey, { defaultValue: svc.displayNameFallback });
  return svc.displayNameFallback;
}

function serviceHint(t: TFunction, svc: CartService): string | null {
  if (!svc.hintKey) return svc.hintFallback;
  return t(svc.hintKey, { defaultValue: svc.hintFallback ?? '' }) || svc.hintFallback;
}

export const CartHeader = ({ cart, onRemove }: CartHeaderProps) => {
  const { t } = useTranslation();
  const totalMin = cart.reduce((s, x) => s + x.durationMin, 0);

  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t('onboarding.cart.yourBooking')} · {cart.length}
        </p>
      </div>

      {cart.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {cart.map((svc) => (
            <div
              key={svc.id}
              className="relative rounded-xl border border-border bg-background p-3 pr-8"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <ServiceIcon iconKey={svc.iconKey} className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs text-muted-foreground">~{svc.durationMin}m</span>
              </div>
              <div className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                {serviceTitle(t, svc)}
              </div>
              <div className="text-xs font-bold text-foreground mt-1 text-right">
                {t('onboarding.cart.priceFrom', { price: svc.priceCzk.toLocaleString('cs-CZ') })}
              </div>
              <button
                type="button"
                onClick={() => onRemove(svc.id)}
                className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label={t('onboarding.cart.remove')}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-1">
        <span className="text-xs text-muted-foreground">
          ~{totalMin} {t('onboarding.cart.totalTime')} · {t('onboarding.cart.oneVisit')}
        </span>
      </div>
    </div>
  );
};

interface UpsaleBlockProps {
  catalog: CartService[];
  cart: CartService[];
  onAdd: (svc: CartService) => void;
}

export const UpsaleBlock = ({ catalog, cart, onAdd }: UpsaleBlockProps) => {
  const { t } = useTranslation();
  const inCart = (id: string) => cart.some((s) => s.id === id);
  const recommendations = catalog.filter((s) => !inCart(s.id)).slice(0, 2);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {t('onboarding.upsale.title')}
      </p>
      <div className="space-y-2">
        {recommendations.map((svc) => {
          const added = inCart(svc.id);
          const hint = serviceHint(t, svc);
          return (
            <div
              key={svc.id}
              className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground flex-shrink-0">
                <ServiceIcon iconKey={svc.iconKey} className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {serviceTitle(t, svc)}
                  </span>
                  <span className="text-xs font-medium text-foreground flex-shrink-0">
                    {t('onboarding.cart.priceFrom', { price: svc.priceCzk.toLocaleString('cs-CZ') })}
                  </span>
                </div>
                {hint ? (
                  <div className="text-xs text-muted-foreground truncate">{hint}</div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => !added && onAdd(svc)}
                disabled={added}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  added
                    ? 'border-border bg-muted text-muted-foreground cursor-default'
                    : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground',
                )}
              >
                {added ? (
                  <span className="inline-flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {t('onboarding.upsale.added')}
                  </span>
                ) : (
                  `+ ${t('onboarding.upsale.add')}`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
