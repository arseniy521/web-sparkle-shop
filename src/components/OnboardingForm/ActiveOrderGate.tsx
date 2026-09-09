import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';
import { cabinetHref } from './authNavigation';

export const ActiveOrderGate = () => {
  const { t } = useTranslation();
  const href = cabinetHref();

  useEffect(() => {
    track('active_order_gate_shown');
  }, []);

  return (
    <div className="flex flex-col items-center text-center gap-4 py-8">
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <ClipboardList className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-lg font-semibold text-foreground">
          {t('onboarding.activeOrder.title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('onboarding.activeOrder.body')}
        </p>
      </div>
      <Button asChild size="lg" className="w-full max-w-sm">
        <a
          href={href}
          rel="noopener noreferrer"
          onClick={() => track('active_order_gate_clicked')}
        >
          {t('onboarding.activeOrder.cta')}
        </a>
      </Button>
    </div>
  );
};
