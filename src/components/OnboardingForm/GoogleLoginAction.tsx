import { useEffect, useRef, useState } from 'react';
import {
  GoogleOAuthProvider,
  useGoogleLogin,
  useGoogleOAuth,
} from '@react-oauth/google';
import { Loader2, LogIn } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  getPublicMe,
  googleAuth,
  OnboardingApiError,
  type AuthenticatedUser,
} from '@/api/onboarding';
import { AUTH_STATUS_QUERY_KEY } from '@/hooks/useAuthStatus';
import { setAnalyticsOptOut, track } from '@/lib/analytics';
import { replaceWithIntakeForm } from './authNavigation';

export type LoginFlowState = 'idle' | 'popup' | 'linking' | 'redirecting' | 'error';

interface GoogleLoginActionProps {
  orderId: string;
  orderAccessToken: string;
  state: LoginFlowState;
  disabled: boolean;
  allowAmbiguousRecovery: boolean;
  onStateChange: (state: LoginFlowState) => void;
  onAuthenticated: (user: AuthenticatedUser) => void;
  onFailure: (reason: string) => void;
}

function normalizeApiError(error: unknown): string {
  if (!(error instanceof OnboardingApiError)) return 'oauth_failed';
  if (error.code === 'ACTIVE_ORDER_EXISTS') return 'active_order';
  if (error.status === 0) return 'network';
  if (error.status === 409) return 'link_conflict';
  if (error.status === 401) return 'oauth_failed';
  if (error.status === 403) return 'link_forbidden';
  return 'api_failed';
}

const GoogleLoginButton = ({
  orderId,
  orderAccessToken,
  state,
  disabled,
  allowAmbiguousRecovery,
  onStateChange,
  onAuthenticated,
  onFailure,
}: GoogleLoginActionProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  const [clientReady, setClientReady] = useState(false);
  const activeRef = useRef(true);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async ({ code }) => {
      if (disabledRef.current) return;
      if (activeRef.current) onStateChange('linking');
      try {
        const user = await googleAuth(code, orderId, orderAccessToken);
        queryClient.setQueryData(AUTH_STATUS_QUERY_KEY, 'authenticated');
        setAnalyticsOptOut(user.role === 'SUPERADMIN');
        if (user.role !== 'SUPERADMIN') {
          track('login_completed', { linked_order: user.linked });
          replaceWithIntakeForm();
        }
        if (!activeRef.current) return;
        onAuthenticated(user);
      } catch (error) {
        const recoverable =
          error instanceof OnboardingApiError &&
          (error.phase === 'link' ||
            (error.status === 0 && allowAmbiguousRecovery));
        if (!recoverable) {
          if (activeRef.current) onFailure(normalizeApiError(error));
          return;
        }

        // The code is one-shot. Recovery is safe only for a confirmed
        // cookie-first link failure, or an ambiguous transport failure after
        // a fresh check proved that no previous session existed.
        try {
          const user = await getPublicMe();
          queryClient.setQueryData(AUTH_STATUS_QUERY_KEY, 'authenticated');
          setAnalyticsOptOut(user.role === 'SUPERADMIN');
          if (user.role !== 'SUPERADMIN') {
            track('login_completed', { linked_order: false, recovered: true });
            replaceWithIntakeForm();
          }
          if (!activeRef.current) return;
          onAuthenticated(user);
        } catch {
          if (activeRef.current) onFailure(normalizeApiError(error));
        }
      }
    },
    onError: () => {
      if (activeRef.current) onFailure('oauth_failed');
    },
    onNonOAuthError: ({ type }) => {
      if (!activeRef.current) return;
      if (type === 'popup_closed') onFailure('popup_closed');
      else if (type === 'popup_failed_to_open') onFailure('popup_failed');
      else onFailure('oauth_failed');
    },
  });

  // useGoogleLogin initializes its client in an effect after the script flag
  // changes. This effect is registered later, so clientReady cannot become
  // true until that initialization effect has run.
  useEffect(() => {
    setClientReady(scriptLoadedSuccessfully);
  }, [scriptLoadedSuccessfully]);

  const busy =
    disabled ||
    !clientReady ||
    state === 'popup' ||
    state === 'linking' ||
    state === 'redirecting';
  const label =
    !clientReady
      ? t('onboarding.final.loginLoading')
      : state === 'popup'
      ? t('onboarding.final.loginPopup')
      : state === 'linking'
        ? t('onboarding.final.loginLinking')
        : state === 'redirecting'
          ? t('onboarding.final.loginRedirecting')
          : t('onboarding.final.loginBtn');

  return (
    <Button
      onClick={() => {
        if (!clientReady || disabled) return;
        track('login_cta_clicked', { order_id: orderId });
        onStateChange('popup');
        try {
          login();
          track('login_popup_opened', { order_id: orderId });
        } catch {
          onFailure('popup_failed');
        }
      }}
      disabled={busy}
      size="lg"
      className="w-full"
    >
      {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
      {label}
    </Button>
  );
};

export default function GoogleLoginAction(props: GoogleLoginActionProps) {
  const { t } = useTranslation();
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();
  const [scriptAttempt, setScriptAttempt] = useState(0);
  const [scriptFailed, setScriptFailed] = useState(false);

  if (!clientId) {
    return (
      <p className="text-sm text-center text-destructive" role="alert">
        {t('onboarding.final.loginConfigError')}
      </p>
    );
  }

  if (scriptFailed) {
    return (
      <Button
        onClick={() => {
          setScriptFailed(false);
          setScriptAttempt((value) => value + 1);
        }}
        disabled={props.disabled}
        size="lg"
        className="w-full"
      >
        <LogIn className="mr-2 h-5 w-5" />
        {t('onboarding.final.loginBtn')}
      </Button>
    );
  }

  return (
    <GoogleOAuthProvider
      key={scriptAttempt}
      clientId={clientId}
      onScriptLoadError={() => {
        setScriptFailed(true);
        props.onFailure('oauth_failed');
      }}
    >
      <GoogleLoginButton {...props} />
    </GoogleOAuthProvider>
  );
}
