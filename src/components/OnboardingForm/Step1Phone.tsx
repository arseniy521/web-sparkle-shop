import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidPhoneNumber, OnboardingFormData } from './useOnboardingForm';

interface Step1PhoneProps {
  data: OnboardingFormData;
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void;
  onNext: () => void;
  isLoading: boolean;
}

export const Step1Phone = ({ data, setField, onNext, isLoading }: Step1PhoneProps) => {
  const { t } = useTranslation();
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const phoneError =
    touched && !isValidPhoneNumber(data.phone)
      ? t('onboarding.step1.phoneError')
      : null;

  const canSubmit = isValidPhoneNumber(data.phone) && !isLoading;

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="onboarding-phone" className="text-xs">{t('onboarding.step1.phoneLabel')}</Label>
        <Input
          ref={inputRef}
          id="onboarding-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+420 777 123 456"
          value={data.phone}
          onChange={(e) => setField('phone', e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={!!phoneError}
          aria-describedby={phoneError ? 'phone-error' : undefined}
          className="h-11 text-base"
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
