import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, PhoneCall, Loader2, ClipboardList, Pencil, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CartItem } from './cartCatalog';
import { ServiceIcon } from './Step0Cart';
import { serviceTitle } from './serviceDisplay';
import {
  getPublicMe,
  linkOrder,
  OnboardingApiError,
  type AuthenticatedUser,
} from '@/api/onboarding';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import {
  flushAnalytics,
  identifyUser,
  setAnalyticsOptOut,
  track,
} from '@/lib/analytics';
import type { LoginFlowState } from './GoogleLoginAction';
import { replaceWithIntakeForm } from './authNavigation';
import { ActiveOrderGate } from './ActiveOrderGate';

const GoogleLoginAction = lazy(() => import('./GoogleLoginAction'));

interface FinalScreenProps {
  cart: CartItem[];
  orderId: string;
  orderAccessToken: string;
  orderLinked: boolean;
  onContactMe: () => void;
  isLoading: boolean;
  onBusyChange?: (busy: boolean) => void;
}

function normalizeLinkError(error: unknown): string {
  if (!(error instanceof OnboardingApiError)) return 'link_failed';
  if (error.code === 'ACTIVE_ORDER_EXISTS') return 'active_order';
  if (error.status === 0) return 'network';
  if (error.status === 401) return 'oauth_failed';
  if (error.status === 409) return 'link_conflict';
  if (error.status === 403) return 'link_forbidden';
  return 'link_failed';
}

export const FinalScreen = ({
  cart,
  orderId,
  orderAccessToken,
  orderLinked,
  onContactMe,
  isLoading,
  onBusyChange,
}: FinalScreenProps) => {
  const { t } = useTranslation();
  const authStatus = useAuthStatus(true, true);
  const [loginState, setLoginState] = useState<LoginFlowState>('idle');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [googleFlowStarted, setGoogleFlowStarted] = useState(false);
  const processingRef = useRef(false);
  const linkedEventRef = useRef(false);

  const totalCzk = cart.reduce((sum, item) => sum + item.priceCzk * item.quantity, 0);

  const failLogin = useCallback((reason: string) => {
    processingRef.current = false;
    setLoginError(reason);
    setLoginState('error');
    track('login_failed', { reason, order_id: orderId });
  }, [orderId]);

  const ensureLinkedAndRedirect = useCallback(async (user: AuthenticatedUser | null) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setLoginError(null);
    setLoginState('linking');

    try {
      const sessionUser = await getPublicMe();
      if (user && sessionUser.id !== user.id) {
        failLogin('account_mismatch');
        return;
      }

      if (sessionUser.role === 'SUPERADMIN') {
        setAnalyticsOptOut(true);
        failLogin('link_forbidden');
        return;
      }

      setAnalyticsOptOut(false);

      const linked = orderLinked || user?.linked ||
        (await linkOrder(orderId, orderAccessToken)).linked;
      if (!linked) {
        failLogin('link_failed');
        return;
      }

      if (!linkedEventRef.current) {
        linkedEventRef.current = true;
        track('order_linked', { order_id: orderId });
      }
      identifyUser(sessionUser.id);

      setLoginState('redirecting');
      await Promise.race([
        flushAnalytics().catch(() => undefined),
        new Promise<void>((resolve) => window.setTimeout(resolve, 800)),
      ]);
      replaceWithIntakeForm();
    } catch (error) {
      failLogin(normalizeLinkError(error));
    }
  }, [failLogin, orderAccessToken, orderId, orderLinked]);

  useEffect(() => {
    if (orderLinked || authStatus === 'authenticated') {
      void ensureLinkedAndRedirect(null);
    }
  }, [authStatus, ensureLinkedAndRedirect, orderLinked]);

  const loginBusy =
    loginState === 'popup' ||
    loginState === 'linking' ||
    loginState === 'redirecting';
  const dialogLocked =
    loginState === 'linking' || loginState === 'redirecting';

  useEffect(() => {
    onBusyChange?.(dialogLocked);
    return () => onBusyChange?.(false);
  }, [dialogLocked, onBusyChange]);

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
                  {svc.quantity > 1 ? `${svc.quantity}× ` : ''}{serviceTitle(t, svc)}
                </span>
                <span className="text-sm font-medium text-foreground flex-shrink-0">
                  {(svc.priceCzk * svc.quantity).toLocaleString('cs-CZ')} Kč
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
        {loginError === 'active_order' ? (
          <ActiveOrderGate />
        ) : authStatus === 'loading' ||
        (authStatus === 'authenticated' &&
          !googleFlowStarted &&
          loginState !== 'error') ? (
          <Button disabled size="lg" className="w-full">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {loginState === 'redirecting'
              ? t('onboarding.final.loginRedirecting')
              : t('onboarding.final.loginLinking')}
          </Button>
        ) : (
          <Suspense
            fallback={(
              <Button disabled size="lg" className="w-full">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('onboarding.final.loginLoading')}
              </Button>
            )}
          >
            <GoogleLoginAction
              orderId={orderId}
              orderAccessToken={orderAccessToken}
              state={loginState}
              disabled={isLoading}
              allowAmbiguousRecovery={authStatus === 'anonymous'}
              onStateChange={(state) => {
                if (state === 'popup') setGoogleFlowStarted(true);
                setLoginState(state);
              }}
              onAuthenticated={(user) => void ensureLinkedAndRedirect(user)}
              onFailure={failLogin}
            />
          </Suspense>
        )}
        {loginError && loginError !== 'active_order' && (
          <p className="text-sm text-center text-destructive" role="alert">
            {t(`onboarding.final.loginErrors.${loginError}`, {
              defaultValue: t('onboarding.final.loginErrors.default'),
            })}
          </p>
        )}
        {loginError !== 'active_order' && !orderLinked && (
          <ul className="space-y-1.5">
            {benefits.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Icon className="h-4 w-4 text-primary flex-shrink-0 mt-px" aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loginError !== 'active_order' && !orderLinked && (
        <>
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
            disabled={isLoading || loginBusy}
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
        </>
      )}
    </div>
  );
};
