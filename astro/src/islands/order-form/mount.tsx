import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { FormI18nProvider, loadFormI18n, type Lang } from './i18n';
import { OnboardingHost } from './OrderFormHost';

export async function mountOrderForm(root: HTMLElement, lang: Lang): Promise<void> {
  const queryClient = new QueryClient();
  const i18n = await loadFormI18n(lang);
  createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      <FormI18nProvider i18n={i18n}>
        <Toaster theme="light" />
        <OnboardingHost />
      </FormI18nProvider>
    </QueryClientProvider>,
  );
}
