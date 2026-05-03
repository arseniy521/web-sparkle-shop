import { useTranslation } from 'react-i18next';
import { PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThankYouScreenProps {
  onClose: () => void;
}

export const ThankYouScreen = ({ onClose }: ThankYouScreenProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in text-center py-4">
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
          <PartyPopper className="h-10 w-10 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{t('onboarding.thankyou.title')}</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {t('onboarding.thankyou.subtitle')}
        </p>
      </div>

      <Button onClick={onClose} size="lg" className="w-full">
        {t('onboarding.thankyou.closeBtn')}
      </Button>
    </div>
  );
};
