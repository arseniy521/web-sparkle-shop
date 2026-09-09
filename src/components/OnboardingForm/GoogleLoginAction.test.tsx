import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OnboardingApiError } from '@/api/onboarding';
import GoogleLoginAction, { type LoginFlowState } from './GoogleLoginAction';

interface CapturedLoginOptions {
  onSuccess: (response: { code: string }) => Promise<void>;
  onNonOAuthError: (error: {
    type: 'popup_failed_to_open' | 'popup_closed' | 'unknown';
  }) => void;
}

const oauthState = vi.hoisted(() => ({
  scriptLoaded: true,
  login: vi.fn(),
  options: null as CapturedLoginOptions | null,
  scriptError: null as (() => void) | null,
}));

const apiMocks = vi.hoisted(() => ({
  getPublicMe: vi.fn(),
  googleAuth: vi.fn(),
}));

vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({
    children,
    onScriptLoadError,
  }: {
    children: React.ReactNode;
    onScriptLoadError?: () => void;
  }) => {
    oauthState.scriptError = onScriptLoadError ?? null;
    return children;
  },
  useGoogleOAuth: () => ({
    clientId: 'test-client',
    scriptLoadedSuccessfully: oauthState.scriptLoaded,
  }),
  useGoogleLogin: (options: CapturedLoginOptions) => {
    oauthState.options = options;
    return oauthState.login;
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/lib/analytics', () => ({
  setAnalyticsOptOut: vi.fn(),
  track: vi.fn(),
}));

vi.mock('@/api/onboarding', async () => {
  const actual = await vi.importActual<typeof import('@/api/onboarding')>(
    '@/api/onboarding',
  );
  return {
    ...actual,
    getPublicMe: apiMocks.getPublicMe,
    googleAuth: apiMocks.googleAuth,
  };
});

const failureSpy = vi.fn();
const authenticatedSpy = vi.fn();

function Harness({ allowAmbiguousRecovery = true } = {}) {
  const [state, setState] = useState<LoginFlowState>('idle');
  return (
    <QueryClientProvider client={new QueryClient()}>
      <GoogleLoginAction
        orderId="order-1"
        orderAccessToken="token"
        state={state}
        disabled={false}
        allowAmbiguousRecovery={allowAmbiguousRecovery}
        onStateChange={setState}
        onAuthenticated={authenticatedSpy}
        onFailure={(reason) => {
          failureSpy(reason);
          setState('error');
        }}
      />
    </QueryClientProvider>
  );
}

afterEach(() => {
  oauthState.scriptLoaded = true;
  oauthState.options = null;
  oauthState.scriptError = null;
  apiMocks.googleAuth.mockReset();
  apiMocks.getPublicMe.mockReset();
});

describe('GoogleLoginAction', () => {
  it.each([
    ['popup_closed', 'popup_closed'],
    ['popup_failed_to_open', 'popup_failed'],
  ] as const)('recovers the CTA after %s', async (type, expectedReason) => {
    render(<Harness />);
    const button = screen.getByRole('button');
    await waitFor(() => expect(button).toBeEnabled());

    fireEvent.click(button);
    expect(button).toBeDisabled();

    act(() => {
      oauthState.options?.onNonOAuthError({ type });
    });

    expect(failureSpy).toHaveBeenCalledWith(expectedReason);
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('does not invoke the popup client before GIS is ready', async () => {
    oauthState.scriptLoaded = false;
    const { rerender } = render(<Harness />);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(oauthState.login).not.toHaveBeenCalled();

    oauthState.scriptLoaded = true;
    rerender(<Harness />);
    await waitFor(() => expect(button).toBeEnabled());

    fireEvent.click(button);
    expect(oauthState.login).toHaveBeenCalledTimes(1);
  });

  it('shows a retryable action when the GIS script fails', async () => {
    render(<Harness />);
    await waitFor(() =>
      expect(screen.getByRole('button')).toBeEnabled(),
    );

    act(() => oauthState.scriptError?.());

    expect(failureSpy).toHaveBeenCalledWith('oauth_failed');
    const retry = screen.getByRole('button');
    expect(retry).toBeEnabled();
    fireEvent.click(retry);

    await waitFor(() =>
      expect(screen.getByRole('button')).toBeEnabled(),
    );
  });

  it('does not recover an OAuth rejection through an old session', async () => {
    apiMocks.googleAuth.mockRejectedValue(
      new OnboardingApiError('Google auth failed', 401),
    );
    apiMocks.getPublicMe.mockResolvedValue({
      authenticated: true,
      id: 'old-user',
      name: 'Old user',
      picture: null,
      role: 'PATIENT',
    });
    render(<Harness />);
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());

    await act(async () => {
      await oauthState.options?.onSuccess({ code: 'code' });
    });

    expect(apiMocks.getPublicMe).not.toHaveBeenCalled();
    expect(authenticatedSpy).not.toHaveBeenCalled();
    expect(failureSpy).toHaveBeenCalledWith('oauth_failed');
  });

  it('recovers a backend-confirmed cookie-first link failure', async () => {
    const sessionUser = {
      authenticated: true,
      id: 'new-user',
      name: 'New user',
      picture: null,
      role: 'PATIENT',
    };
    apiMocks.googleAuth.mockRejectedValue(
      new OnboardingApiError('Order link failed', 409, { phase: 'link' }),
    );
    apiMocks.getPublicMe.mockResolvedValue(sessionUser);
    render(<Harness allowAmbiguousRecovery={false} />);
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());

    await act(async () => {
      await oauthState.options?.onSuccess({ code: 'code' });
    });

    expect(apiMocks.getPublicMe).toHaveBeenCalledTimes(1);
    expect(authenticatedSpy).toHaveBeenCalledWith(sessionUser);
  });

  it('ignores popup callbacks after the final screen unmounts', async () => {
    const { unmount } = render(<Harness />);
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
    const options = oauthState.options;

    unmount();
    act(() => options?.onNonOAuthError({ type: 'popup_closed' }));

    expect(failureSpy).not.toHaveBeenCalled();
  });
});
