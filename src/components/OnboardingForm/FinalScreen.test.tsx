import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OnboardingApiError } from '@/api/onboarding';
import { FinalScreen } from './FinalScreen';

const testState = vi.hoisted(() => ({
  authStatus: 'anonymous',
  flushAnalytics: vi.fn().mockResolvedValue(undefined),
  getPublicMe: vi.fn(),
  linkOrder: vi.fn(),
  replaceWithIntakeForm: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

vi.mock('@/hooks/useAuthStatus', () => ({
  useAuthStatus: () => testState.authStatus,
}));

vi.mock('@/lib/analytics', () => ({
  flushAnalytics: testState.flushAnalytics,
  identifyUser: vi.fn(),
  setAnalyticsOptOut: vi.fn(),
  track: vi.fn(),
}));

vi.mock('@/api/onboarding', async () => {
  const actual = await vi.importActual<typeof import('@/api/onboarding')>(
    '@/api/onboarding',
  );
  return {
    ...actual,
    getPublicMe: testState.getPublicMe,
    linkOrder: testState.linkOrder,
  };
});

vi.mock('./authNavigation', () => ({
  replaceWithIntakeForm: testState.replaceWithIntakeForm,
}));

vi.mock('./GoogleLoginAction', () => ({
  default: ({
    disabled,
    onStateChange,
  }: {
    disabled: boolean;
    onStateChange: (state: 'popup') => void;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onStateChange('popup')}
    >
      google-action
    </button>
  ),
}));

const baseProps = {
  cart: [],
  orderId: 'order-1',
  orderAccessToken: 'token',
  orderLinked: false,
  onContactMe: vi.fn(),
  isLoading: false,
};

afterEach(() => {
  testState.authStatus = 'anonymous';
  testState.flushAnalytics.mockReset().mockResolvedValue(undefined);
  testState.getPublicMe.mockReset();
  testState.linkOrder.mockReset();
  testState.replaceWithIntakeForm.mockReset();
});

describe('FinalScreen action exclusivity', () => {
  it('disables Contact me while the Google popup is active', async () => {
    render(<FinalScreen {...baseProps} />);

    const google = await screen.findByRole('button', {
      name: 'google-action',
    });
    fireEvent.click(google);

    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: 'onboarding.final.contactBtn',
        }),
      ).toBeDisabled(),
    );
  });

  it('disables Google login while Contact me is pending', async () => {
    render(<FinalScreen {...baseProps} isLoading />);

    expect(
      await screen.findByRole('button', { name: 'google-action' }),
    ).toBeDisabled();
  });

  it('redirects after confirmed auth/link even when analytics flush fails', async () => {
    testState.authStatus = 'authenticated';
    testState.getPublicMe.mockResolvedValue({
      authenticated: true,
      id: 'patient-1',
      name: 'Patient',
      picture: null,
      role: 'PATIENT',
    });
    testState.flushAnalytics.mockRejectedValue(new Error('analytics down'));

    render(<FinalScreen {...baseProps} orderLinked />);

    await waitFor(() =>
      expect(testState.replaceWithIntakeForm).toHaveBeenCalledTimes(1),
    );
  });

  it('does not redirect a linked order without a confirmed session', async () => {
    testState.authStatus = 'authenticated';
    testState.getPublicMe.mockRejectedValue(
      new OnboardingApiError('Unauthorized', 401),
    );

    render(<FinalScreen {...baseProps} orderLinked />);

    expect(
      await screen.findByRole('button', { name: 'google-action' }),
    ).toBeEnabled();
    expect(testState.replaceWithIntakeForm).not.toHaveBeenCalled();
  });
});
