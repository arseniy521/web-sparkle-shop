import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { FormI18nProvider, loadFormI18n, prefetchFormStrings, type Lang } from './i18n';
import { OnboardingHost } from './OrderFormHost';

// This module is fetched in the background when the cart is not empty: fetch the texts with it,
// so that opening the form does not wait for them.
prefetchFormStrings(document.documentElement.lang);

export async function mountOrderForm(root: HTMLElement, lang: Lang): Promise<void> {
  const queryClient = new QueryClient();
  const i18n = await loadFormI18n(lang);
  createRoot(root).render(
    <QueryClientProvider client={queryClient}>
      <FormI18nProvider i18n={i18n}>
        <Toaster
          theme="light"
          className="toaster group"
          toastOptions={{
            classNames: {
              toast:
                'group toast group-[.toaster]:bg-background! group-[.toaster]:text-foreground! group-[.toaster]:border-border! group-[.toaster]:shadow-lg!',
              description: 'group-[.toast]:text-muted-foreground!',
              actionButton: 'group-[.toast]:bg-primary! group-[.toast]:text-primary-foreground!',
              cancelButton: 'group-[.toast]:bg-muted! group-[.toast]:text-muted-foreground!',
            },
          }}
        />
        <OnboardingHost />
      </FormI18nProvider>
    </QueryClientProvider>,
  );
}
