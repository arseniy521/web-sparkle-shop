import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidPhoneNumber, OnboardingFormData } from './useOnboardingForm';

interface Step1PhoneProps {
  data: OnboardingFormData;
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void;
  onNext: () => void;
  isLoading: boolean;
}

export const Step1Phone = ({ data, setField, onNext, isLoading }: Step1PhoneProps) => {
  const { t } = useTranslation();
  const didMount = useRef(false);

  useEffect(() => {
    didMount.current = true;
  }, []);

  const phoneError =
    didMount.current && data.phone && !isValidPhoneNumber(data.phone)
      ? t('onboarding.step1.phoneError')
      : null;

  const canSubmit = isValidPhoneNumber(data.phone) && !isLoading;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="onboarding-phone" className="text-xs">
          {t('onboarding.step1.phoneLabel')}
        </Label>
        <PhoneInput
          id="onboarding-phone"
          defaultCountry="CZ"
          placeholder="Phone number"
          value={data.phone}
          onChange={(value) => setField('phone', value)}
          aria-invalid={!!phoneError}
          aria-describedby={phoneError ? 'phone-error' : undefined}
        />
        {phoneError && (
          <p id="phone-error" className="text-xs text-destructive">
            {phoneError}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t('onboarding.step1.phoneHint')}</p>
      </div>

      <Button onClick={onNext} disabled={!canSubmit} size="default" className="w-full group">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {t('onboarding.next')}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </div>
  );
};
