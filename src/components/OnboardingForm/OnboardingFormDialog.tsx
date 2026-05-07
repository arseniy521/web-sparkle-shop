import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useServices } from '@/hooks/useServices';
import { CartHeader, UpsaleBlock } from './Step0Cart';
import { AccordionStep } from './AccordionStep';
import { Step1Phone } from './Step1Phone';
import { Step2Address } from './Step2Address';
import { Step3Timing } from './Step3Timing';
import { Step5Note } from './Step5Note';
import { FinalScreen } from './FinalScreen';
import { ThankYouScreen } from './ThankYouScreen';
import { isValidPhoneNumber, useOnboardingForm } from './useOnboardingForm';

interface OnboardingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Stable backend code, e.g. `iv_infusion` or `escort`. */
  initialServiceCode?: string;
  /** @deprecated Use `initialServiceCode` (`iv-infusion`-style values are normalized automatically). */
  initialServiceId?: string;
  initialMode?: 'standard' | 'escort';
}

// Accordion sections, in display order.
// Note is optional — the form can be submitted from step 3 (Phone) without filling it.
type SectionId = 'address' | 'timing' | 'phone' | 'note';

export const OnboardingFormDialog = ({
  open,
  onOpenChange,
  initialServiceCode,
  initialServiceId,
  initialMode = 'standard',
}: OnboardingFormDialogProps) => {
  const { t, i18n } = useTranslation();
  const resolvedInitialCode = initialServiceCode ?? initialServiceId;
  const { catalog, loading: catalogLoading, errorKey: catalogErrorKey } = useServices(open);

  const form = useOnboardingForm({
    open,
    catalog,
    initialServiceCode: resolvedInitialCode,
    initialMode,
  });

  const [openSection, setOpenSection] = useState<SectionId>('address');
  const errorToastNonce = useRef(0);

  // Sync open accordion with backing form.step (1=address, 2=timing, 3=phone)
  useEffect(() => {
    if (form.step === 1) setOpenSection('address');
    else if (form.step === 2) setOpenSection('timing');
    else if (form.step === 3) setOpenSection('phone');
  }, [form.step]);

  useEffect(() => {
    if (!form.error) return;
    const messages: Record<string, string> = {
      rate_limit: t('onboarding.errors.rateLimit'),
      network: t('onboarding.errors.network'),
      not_found: t('onboarding.errors.notFound'),
      server: t('onboarding.errors.server'),
      validation: t('onboarding.errors.validation'),
      unknown: t('onboarding.errors.unknown'),
    };
    errorToastNonce.current += 1;
    toast.error(messages[form.error] ?? messages.unknown, {
      id: `onboarding-error-${errorToastNonce.current}`,
    });
  }, [form.error, t]);

  useEffect(() => {
    if (!open || !catalogErrorKey) return;
    toast.error(t(catalogErrorKey), { id: 'onboarding-catalog-error' });
  }, [open, catalogErrorKey, t]);

  const handleClose = () => onOpenChange(false);

  // Section completeness based on data + furthest reached step
  const stepNum = typeof form.step === 'number' ? form.step : 5;
  const addressDone =
    stepNum > 1 &&
    form.data.address.trim().length >= 5 &&
    (!form.isEscortMode || form.data.addressTo.trim().length >= 5);
  const timingDone =
    stepNum > 2 &&
    !!form.data.desiredTiming &&
    (form.data.desiredTiming !== 'CUSTOM_DATE' || !!form.data.desiredDate);
  const phoneDone = stepNum > 3 && isValidPhoneNumber(form.data.phone);

  // Whether a section can be opened (must have completed prior required steps)
  const canOpen = (s: SectionId): boolean => {
    switch (s) {
      case 'address': return true;
      case 'timing':
        return (
          form.data.address.trim().length >= 5 &&
          (!form.isEscortMode || form.data.addressTo.trim().length >= 5)
        );
      case 'phone':
        return addressDone && timingDone;
      case 'note':  return phoneDone;
      default: return false;
    }
  };

  const tryOpen = (s: SectionId) => {
    if (canOpen(s)) setOpenSection(s);
  };

  // Summaries
  const addressSummary = addressDone
    ? form.isEscortMode
      ? `${form.data.address} → ${form.data.addressTo}`
      : form.data.address
    : null;
  const timingSummary = (() => {
    if (form.data.desiredTiming === 'ASAP') return t('onboarding.step3Summary.asap');
    if (form.data.desiredTiming === 'CUSTOM_DATE' && form.data.desiredDate) {
      try {
        return new Intl.DateTimeFormat([i18n.language, 'en-US'], {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(form.data.desiredDate));
      } catch {
        return new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(form.data.desiredDate));
      }
    }
    return null;
  })();
  const phoneSummary = form.data.phone || null;
  const noteSummary = form.data.patientNote.trim() || null;

  const totalCzk = form.cart.reduce((sum, s) => sum + s.priceCzk, 0);

  const isFinal = form.step === 'final';
  const isThankyou = form.step === 'thankyou';
  const isWizard = !isFinal && !isThankyou;

  // Finish button: enabled once all 3 required sections are done (note is optional)
  const catalogReady = !catalogLoading && !catalogErrorKey && catalog.length > 0;

  const canFinish =
    catalogReady &&
    form.cart.some((x) => Boolean(x.serviceUuid)) &&
    form.data.address.trim().length >= 5 &&
    (!form.isEscortMode || form.data.addressTo.trim().length >= 5) &&
    !!form.data.desiredTiming &&
    (form.data.desiredTiming !== 'CUSTOM_DATE' || !!form.data.desiredDate) &&
    isValidPhoneNumber(form.data.phone);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/50',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          )}
        />

        <DialogPrimitive.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background',
            'max-h-[92dvh]',
            'sm:bottom-auto sm:left-auto sm:top-0 sm:right-0 sm:h-full sm:w-[540px] sm:max-h-full',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-right',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right',
            'duration-150 ease-out',
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {t('onboarding.dialogTitle')}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {t('onboarding.dialogDescription')}
          </DialogPrimitive.Description>

          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 flex-shrink-0">
            <h2 className="text-base font-semibold text-foreground">
              {t('onboarding.dialogTitle')}
            </h2>
            <DialogPrimitive.Close
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground flex-shrink-0"
              aria-label={t('onboarding.close')}
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-4">
            {isThankyou ? (
              <ThankYouScreen onClose={handleClose} />
            ) : isFinal && form.orderId ? (
              <FinalScreen
                orderId={form.orderId}
                onContactMe={() => void form.submitContactMe()}
                isLoading={form.isLoading}
              />
            ) : (
              <>
                {catalogLoading && !catalogErrorKey && (
                  <div className="flex items-center gap-3 py-6 text-muted-foreground text-sm">
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                    {t('onboarding.catalogLoading')}
                  </div>
                )}

                {catalogErrorKey && (
                  <p className="text-sm text-destructive">{t(catalogErrorKey)}</p>
                )}

                {catalogReady && (
                  <>
                <CartHeader cart={form.cart} onRemove={form.removeFromCart} />
                <UpsaleBlock catalog={catalog} cart={form.cart} onAdd={form.addToCart} />

                <div className="space-y-2">
                  <AccordionStep
                    number={1}
                    title={
                      form.isEscortMode
                        ? t('onboarding.sections.route')
                        : t('onboarding.sections.address')
                    }
                    isOpen={openSection === 'address'}
                    isCompleted={addressDone}
                    summary={addressSummary}
                    onOpen={() => tryOpen('address')}
                  >
                    <Step2Address
                      data={form.data}
                      setField={form.setField}
                      setFields={form.setFields}
                      onNext={() => form.submitAddress()}
                      isLoading={form.isLoading}
                      mode={form.isEscortMode ? 'escort' : 'standard'}
                    />
                  </AccordionStep>

                  <AccordionStep
                    number={2}
                    title={t('onboarding.sections.timing')}
                    isOpen={openSection === 'timing'}
                    isCompleted={timingDone}
                    summary={timingSummary}
                    onOpen={() => tryOpen('timing')}
                  >
                    <Step3Timing
                      data={form.data}
                      setField={form.setField}
                      onNext={() => form.submitTiming()}
                      isLoading={form.isLoading}
                      dialogOpen={open}
                    />
                  </AccordionStep>

                  <AccordionStep
                    number={3}
                    title={t('onboarding.sections.quickDetails')}
                    isOpen={openSection === 'phone'}
                    isCompleted={phoneDone}
                    summary={phoneSummary}
                    onOpen={() => tryOpen('phone')}
                  >
                    <Step1Phone
                      data={form.data}
                      setField={form.setField}
                      onNext={() => {
                        if (isValidPhoneNumber(form.data.phone)) {
                          setOpenSection('note');
                        }
                      }}
                      isLoading={form.isLoading}
                    />
                  </AccordionStep>

                  <AccordionStep
                    number={4}
                    title={`${t('onboarding.sections.note')} (${t('onboarding.optional')})`}
                    isOpen={openSection === 'note'}
                    isCompleted={openSection !== 'note' && phoneDone && noteSummary !== null}
                    summary={noteSummary}
                    onOpen={() => tryOpen('note')}
                  >
                    <Step5Note data={form.data} setField={form.setField} />
                  </AccordionStep>
                </div>
                  </>
                )}
              </>
            )}

            {!isThankyou && import.meta.env.DEV && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={form.advanceTestStep}
                  className="w-full rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground border border-dashed border-border"
                >
                  Test: next step without API
                </button>
              </div>
            )}
          </div>

          {isWizard && (
            <div className="border-t border-border px-5 py-3 sm:px-6 flex-shrink-0 bg-background">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">
                    {t('onboarding.footerTotal')}
                  </div>
                  <div className="text-base font-bold text-foreground">
                    {totalCzk.toLocaleString('cs-CZ')} Kč
                  </div>
                </div>
                <Button
                  onClick={() => void form.submitPhoneAndCreate()}
                  disabled={!canFinish || form.isLoading || catalogLoading || Boolean(catalogErrorKey)}
                  size="lg"
                  className="flex-1 max-w-[220px]"
                >
                  {form.isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    t('onboarding.finish')
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
