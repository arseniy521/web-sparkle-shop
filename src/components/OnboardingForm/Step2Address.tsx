import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Loader2, MapPin, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressAutocomplete } from './AddressAutocomplete';
import { OnboardingFormData } from './useOnboardingForm';

interface Step2AddressProps {
  data: OnboardingFormData;
  setField: <K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) => void;
  setFields: (patch: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  isLoading: boolean;
  mode?: 'standard' | 'escort';
}

export const Step2Address = ({
  data,
  setField,
  setFields,
  onNext,
  isLoading,
  mode = 'standard',
}: Step2AddressProps) => {
  const { t } = useTranslation();
  const [touched, setTouched] = useState(false);
  const [touchedTo, setTouchedTo] = useState(false);

  const isEscort = mode === 'escort';

  const addressError =
    touched && data.address.trim().length < 5 ? t('onboarding.step2.addressError') : null;
  const addressToError =
    isEscort && touchedTo && data.addressTo.trim().length < 5
      ? t('onboarding.step2.toError')
      : null;

  const canSubmit =
    data.address.trim().length >= 5 &&
    (!isEscort || data.addressTo.trim().length >= 5) &&
    !isLoading;

  return (
    <div className="space-y-3">
      {/* From / Address (point A) */}
      <div className="space-y-1.5">
        <Label htmlFor="onboarding-address" className="text-xs flex items-center gap-1.5">
          {isEscort && <MapPin className="h-3.5 w-3.5 text-primary" />}
          {isEscort ? t('onboarding.step2.fromLabel') : t('onboarding.step2.addressLabel')}
        </Label>
        <AddressAutocomplete
          id="onboarding-address"
          autoFocus
          placeholder={
            isEscort
              ? t('onboarding.step2.fromPlaceholder')
              : t('onboarding.step2.addressPlaceholder')
          }
          value={data.address}
          onValueChange={(v) => {
            setFields({ address: v, ...(data.addressGeo ? { addressGeo: null } : {}) });
          }}
          onSelect={(geo) => {
            setFields({ address: geo.label, addressGeo: geo });
          }}
          onBlur={() => setTouched(true)}
          aria-invalid={!!addressError}
          className="h-11 text-base"
        />
        {addressError && <p className="text-xs text-destructive">{addressError}</p>}
      </div>

      {/* To / Dropoff (point B) — escort mode only */}
      {isEscort && (
        <div className="space-y-1.5">
          <Label htmlFor="onboarding-address-to" className="text-xs flex items-center gap-1.5">
            <Flag className="h-3.5 w-3.5 text-primary" />
            {t('onboarding.step2.toLabel')}
          </Label>
          <AddressAutocomplete
            id="onboarding-address-to"
            placeholder={t('onboarding.step2.toPlaceholder')}
            value={data.addressTo}
            onValueChange={(v) => {
              setFields({ addressTo: v, ...(data.addressToGeo ? { addressToGeo: null } : {}) });
            }}
            onSelect={(geo) => {
              setFields({ addressTo: geo.label, addressToGeo: geo });
            }}
            onBlur={() => setTouchedTo(true)}
            aria-invalid={!!addressToError}
            className="h-11 text-base"
          />
          {addressToError && <p className="text-xs text-destructive">{addressToError}</p>}
        </div>
      )}

      {/* Floor / intercom — standard mode only */}
      {!isEscort && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-floor" className="text-xs">
              {t('onboarding.step2.floorLabel')}
            </Label>
            <Input
              id="onboarding-floor"
              placeholder={t('onboarding.step2.floorPlaceholder')}
              value={data.addressFloor}
              onChange={(e) => setField('addressFloor', e.target.value)}
              maxLength={20}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-intercom" className="text-xs">
              {t('onboarding.step2.intercomLabel')}
            </Label>
            <Input
              id="onboarding-intercom"
              placeholder={t('onboarding.step2.intercomPlaceholder')}
              value={data.addressIntercom}
              onChange={(e) => setField('addressIntercom', e.target.value)}
              maxLength={50}
              className="h-11"
            />
          </div>
        </div>
      )}

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
