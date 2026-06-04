import { useTranslation } from 'react-i18next';
import { CheckCircle2, LogIn, PhoneCall, Loader2, ClipboardList, Pencil, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CartService } from './cartCatalog';
import { ServiceIcon } from './Step0Cart';
import { serviceTitle } from './serviceDisplay';

interface FinalScreenProps {
  cart: CartService[];
  orderId: string;
  orderAccessToken: string;
  onContactMe: () => void;
  isLoading: boolean;
}

const appUrl = (import.meta.env.VITE_APP_URL as string | undefined)?.trim() || 'https://app.nius.cz';
const APP_LOGIN_URL = `${appUrl.replace(/\/$/, '')}/login`;

export const FinalScreen = ({ cart, orderId, orderAccessToken, onContactMe, isLoading }: FinalScreenProps) => {
  const { t } = useTranslation();

  const totalCzk = cart.reduce((sum, s) => sum + s.priceCzk, 0);

  const handleLogin = () => {
    const params = new URLSearchParams({ orderId, orderAccessToken });
    const href = `${APP_LOGIN_URL}?${params.toString()}`;
    const a = document.createElement('a');
    a.href = href;
    a.rel = 'noopener noreferrer';
    a.referrerPolicy = 'no-referrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const benefits = [
    { icon: ClipboardList, text: t('onboarding.final.benefits.track') },
    { icon: Pencil, text: t('onboarding.final.benefits.edit') },
    { icon: Activity, text: t('onboarding.final.benefits.questionnaire') },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9 text-primary" />
        </div>
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-foreground">{t('onboarding.final.title')}</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {t('onboarding.final.subtitle')}
        </p>
      </div>

      {cart.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('onboarding.final.orderSummaryTitle')}
          </p>
          <ul className="space-y-1.5">
            {cart.map((svc) => (
              <li key={svc.id} className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-background flex items-center justify-center text-primary flex-shrink-0">
                  <ServiceIcon iconKey={svc.iconKey} className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-foreground flex-1 min-w-0 truncate">
                  {serviceTitle(t, svc)}
                </span>
                <span className="text-sm font-medium text-foreground flex-shrink-0">
                  {svc.priceCzk.toLocaleString('cs-CZ')} Kč
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-xs text-muted-foreground">{t('onboarding.footerTotal')}</span>
            <span className="text-base font-bold text-foreground">
              {totalCzk.toLocaleString('cs-CZ')} Kč
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button onClick={handleLogin} size="lg" className="w-full">
          <LogIn className="mr-2 h-5 w-5" />
          {t('onboarding.final.loginBtn')}
        </Button>
        <ul className="space-y-1.5">
          {benefits.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Icon className="h-4 w-4 text-primary flex-shrink-0 mt-px" aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs uppercase text-muted-foreground">
            {t('onboarding.or')}
          </span>
        </div>
      </div>

      <Button
        onClick={onContactMe}
        disabled={isLoading}
        variant="outline"
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <PhoneCall className="mr-2 h-5 w-5" />
            {t('onboarding.final.contactBtn')}
          </>
        )}
      </Button>
    </div>
  );
};
