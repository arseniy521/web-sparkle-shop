import { useTranslation } from 'react-i18next';
import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { track } from '@/lib/analytics';

const appUrl = (import.meta.env.VITE_APP_URL as string | undefined)?.trim() || 'https://app.nius.cz';

const hasReturningCookie = (): boolean =>
  document.cookie.split('; ').some((row) => row.startsWith('nius_returning='));

export const ReturningCustomerHint = () => {
  const { t } = useTranslation();
  const returning = hasReturningCookie();
  const authStatus = useAuthStatus(returning);

  if (!returning) return null;

  const authenticated = authStatus === 'authenticated';
  const href = authenticated ? `${appUrl.replace(/\/$/, '')}/cabinet` : `${appUrl.replace(/\/$/, '')}/login`;

  const handleClick = () => {
    track('returning_cabinet_hint_clicked', { authenticated });
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        <UserRound className="h-4 w-4" />
      </div>
      <p className="text-xs text-muted-foreground flex-1 min-w-0">
        {t('onboarding.returningHint.body')}
      </p>
      <Button asChild size="sm" variant="outline" className="flex-shrink-0" onClick={handleClick}>
        <a href={href} rel="noopener noreferrer">
          {authenticated
            ? t('onboarding.returningHint.ctaCabinet')
            : t('onboarding.returningHint.ctaLogin')}
        </a>
      </Button>
    </div>
  );
};
