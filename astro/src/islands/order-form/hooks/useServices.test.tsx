import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchServicesCatalog } from '@/api/services';
import type { CartService } from '@/components/OnboardingForm/cartCatalog';
import { useServices } from './useServices';

vi.mock('@/api/services', () => ({ fetchServicesCatalog: vi.fn() }));

const mockedFetchServicesCatalog = vi.mocked(fetchServicesCatalog);

function service(priceCzk: number): CartService {
  return {
    id: 'immunity_power',
    code: 'immunity_power',
    serviceUuid: 'svc_immunity_power',
    nameKey: 'serviceCatalog.immunity_power.title',
    displayNameFallback: 'Immunity Power',
    hintKey: 'serviceCatalog.immunity_power.description',
    hintFallback: null,
    priceCzk,
    durationMin: 55,
    iconKey: 'iv',
    kind: 'standard',
  };
}

function ServicesHarness({
  stickyOpen,
  formOpen,
}: {
  stickyOpen: boolean;
  formOpen: boolean;
}) {
  const sticky = useServices(stickyOpen);
  const form = useServices(formOpen);

  return (
    <>
      <output data-testid="sticky-price">{sticky.catalog[0]?.priceCzk ?? 'none'}</output>
      <output data-testid="sticky-error">{sticky.errorKey ?? 'none'}</output>
      <output data-testid="form-price">{form.catalog[0]?.priceCzk ?? 'none'}</output>
      <output data-testid="form-loading">{String(form.loading)}</output>
      <output data-testid="form-ready">{String(form.catalogReady)}</output>
      <output data-testid="form-error">{form.errorKey ?? 'none'}</output>
    </>
  );
}

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
}

beforeEach(() => {
  mockedFetchServicesCatalog.mockReset();
});

describe('useServices', () => {
  it('updates every consumer when the form refreshes the shared catalog', async () => {
    mockedFetchServicesCatalog
      .mockResolvedValueOnce([service(2900)])
      .mockResolvedValueOnce([service(3900)]);

    const { rerender } = renderWithClient(<ServicesHarness stickyOpen formOpen={false} />);

    await waitFor(() => expect(screen.getByTestId('sticky-price')).toHaveTextContent('2900'));

    rerender(<ServicesHarness stickyOpen formOpen />);

    await waitFor(() => expect(mockedFetchServicesCatalog).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByTestId('sticky-price')).toHaveTextContent('3900'));
    expect(screen.getByTestId('form-price')).toHaveTextContent('3900');
  });

  it('blocks checkout readiness while refreshing cached catalog data', async () => {
    let resolveRefresh: ((value: CartService[]) => void) | undefined;
    mockedFetchServicesCatalog
      .mockResolvedValueOnce([service(2900)])
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolveRefresh = resolve;
      }));

    const { rerender } = renderWithClient(<ServicesHarness stickyOpen formOpen={false} />);
    await waitFor(() => expect(screen.getByTestId('sticky-price')).toHaveTextContent('2900'));

    rerender(<ServicesHarness stickyOpen formOpen />);
    await waitFor(() => expect(mockedFetchServicesCatalog).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId('form-price')).toHaveTextContent('2900');
    expect(screen.getByTestId('form-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('form-ready')).toHaveTextContent('false');

    resolveRefresh?.([service(3900)]);
    await waitFor(() => expect(screen.getByTestId('form-ready')).toHaveTextContent('true'));
    expect(screen.getByTestId('form-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('form-price')).toHaveTextContent('3900');
  });

  it('recovers every consumer after an earlier catalog load error', async () => {
    mockedFetchServicesCatalog
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce([service(3250)]);

    const { rerender } = renderWithClient(<ServicesHarness stickyOpen formOpen={false} />);

    await waitFor(() => {
      expect(screen.getByTestId('sticky-error')).toHaveTextContent('onboarding.catalogLoadFailed');
    });

    rerender(<ServicesHarness stickyOpen formOpen />);

    await waitFor(() => expect(mockedFetchServicesCatalog).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByTestId('sticky-price')).toHaveTextContent('3250'));
    expect(screen.getByTestId('sticky-error')).toHaveTextContent('none');
    expect(screen.getByTestId('form-price')).toHaveTextContent('3250');
  });
});
