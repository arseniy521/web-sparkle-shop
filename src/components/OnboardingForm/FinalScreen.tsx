import { useTranslation } from 'react-i18next';
import { CheckCircle2, LogIn, PhoneCall, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FinalScreenProps {
  orderId: string;
  onContactMe: () => void;
  isLoading: boolean;
}

const appUrl = (import.meta.env.VITE_APP_URL as string | undefined)?.trim() || 'https://app.nius.cz';
const APP_LOGIN_URL = `${appUrl.replace(/\/$/, '')}/login`;

export const FinalScreen = ({ orderId, onContactMe, isLoading }: FinalScreenProps) => {
  const { t } = useTranslation();

  const handleLogin = () => {
    const href = `${APP_LOGIN_URL}?orderId=${encodeURIComponent(orderId)}`;
    const a = document.createElement('a');
    a.href = href;
    a.rel = 'noopener noreferrer';
    a.referrerPolicy = 'no-referrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{t('onboarding.final.title')}</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {t('onboarding.final.subtitle')}
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <Button onClick={handleLogin} size="lg" className="w-full">
          <LogIn className="mr-2 h-5 w-5" />
          {t('onboarding.final.loginBtn')}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t('onboarding.final.loginHint')}
        </p>
      </div>

      <div className="relative py-2">
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
