import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, Loader2, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '@/hooks/useServices';
import { CartHeader } from './Step0Cart';
import { AccordionStep } from './AccordionStep';
import { Step1Phone } from './Step1Phone';
import { Step2Address } from './Step2Address';
import { Step3Timing } from './Step3Timing';
import { Step5Note } from './Step5Note';
import { FinalScreen } from './FinalScreen';
import { ThankYouScreen } from './ThankYouScreen';
import { normalizeServiceCode } from './cartCatalog';
import { isValidPhoneNumber, useOnboardingForm } from './useOnboardingForm';
import { track } from '@/lib/analytics';

interface OnboardingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialServiceCode?: string;
  initialServiceCodes?: string[];
  initialServiceId?: string;
  initialMode?: 'standard' | 'escort';
  onOrderComplete?: () => void;
  onCartCodesChange?: (codes: string[]) => void;
}

type SectionId = 'address' | 'timing' | 'phone' | 'note';

export const OnboardingFormDialog = ({
  open,
  onOpenChange,
  initialServiceCode,
  initialServiceCodes,
  initialServiceId,
  initialMode = 'standard',
  onOrderComplete,
  onCartCodesChange,
}: OnboardingFormDialogProps) => {
  const { t, i18n } = useTranslation();
  const resolvedInitialCode = initialServiceCode ?? initialServiceId;
  const { catalog, loading: catalogLoading, errorKey: catalogErrorKey } = useServices(open);

  const form = useOnboardingForm({
    open,
    catalog,
    initialServiceCode: resolvedInitialCode,
    initialServiceCodes,
    initialMode,
  });

  const [openSection, setOpenSection] = useState<SectionId>('address');
  const errorToastNonce = useRef(0);

  const addressFilled =
    form.data.address.trim().length >= 5 &&
    (!form.isEscortMode || form.data.addressTo.trim().length >= 5);
  const timingFilled =
    !!form.data.desiredTiming &&
    (form.data.desiredTiming !== 'CUSTOM_DATE' || !!form.data.desiredDate);
  const phoneFilled = isValidPhoneNumber(form.data.phone);

  const openInitializedRef = useRef(false);
  useEffect(() => {
    if (!open) {
      openInitializedRef.current = false;
      return;
    }
    if (openInitializedRef.current) return;
    openInitializedRef.current = true;
    track('order_form_opened', {
      services_in_cart: form.cart.length,
      mode: form.isEscortMode ? 'escort' : 'standard',
    });
    if (!addressFilled) setOpenSection('address');
    else if (!timingFilled) setOpenSection('timing');
    else if (!phoneFilled) setOpenSection('phone');
    else setOpenSection('note');
  }, [open, addressFilled, timingFilled, phoneFilled, form.cart.length, form.isEscortMode]);

  useEffect(() => {
    if (!open || !openInitializedRef.current) return;
    if (form.step === 1 && !addressFilled) setOpenSection('address');
    else if (form.step === 2) setOpenSection('timing');
    else if (form.step === 3) setOpenSection('phone');
  }, [open, form.step, addressFilled]);

  const orderCompleteFiredRef = useRef(false);
  useEffect(() => {
    if (!form.orderId) {
      orderCompleteFiredRef.current = false;
      return;
    }
    if (orderCompleteFiredRef.current) return;
    orderCompleteFiredRef.current = true;
    onOrderComplete?.();
  }, [form.orderId, onOrderComplete]);

  const cartCodes = useMemo(() => form.cart.map((s) => s.code), [form.cart]);
  const incomingCodes = useMemo(
    () => (initialServiceCodes ?? []).map(normalizeServiceCode).filter(Boolean),
    [initialServiceCodes],
  );
  const catalogLoaded = !catalogLoading && catalog.length > 0;
  const cartHydratedRef = useRef(false);
  const userRemovedCodesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const removedCode of Array.from(userRemovedCodesRef.current)) {
      if (!incomingCodes.includes(removedCode)) userRemovedCodesRef.current.delete(removedCode);
    }
  }, [incomingCodes]);

  useEffect(() => {
    if (!open) return;
    if (form.orderId) return;
    if (!catalogLoaded) return;
    if (cartCodes.length > 0) cartHydratedRef.current = true;
    if (cartCodes.length === 0 && !cartHydratedRef.current) return;

    const removed = userRemovedCodesRef.current;
    const nextCodes: string[] = [];
    const append = (code: string) => {
      if (!code || removed.has(code) || nextCodes.includes(code)) return;
      nextCodes.push(code);
    };
    incomingCodes.forEach(append);
    cartCodes.forEach(append);
    onCartCodesChange?.(nextCodes);
  }, [open, form.orderId, catalogLoaded, cartCodes, incomingCodes, onCartCodesChange]);

  useEffect(() => {
    if (!open) {
      cartHydratedRef.current = false;
      userRemovedCodesRef.current.clear();
    }
  }, [open]);

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

  const handleBrowseServices = () => {
    onOpenChange(false);
    requestAnimationFrame(() => {
      document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const addressDone = addressFilled;
  const timingDone = timingFilled;
  const phoneValid = phoneFilled;
  const phoneDone = phoneValid;

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

  const catalogReady = !catalogLoading && !catalogErrorKey && catalog.length > 0;
  const cartEmpty = catalogReady && form.cart.length === 0;

  const canFinish =
    catalogReady &&
    form.cart.length > 0 &&
    form.cart.every((x) => Boolean(x.serviceUuid)) &&
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
            'sm:bottom-auto sm:left-auto sm:top-0 sm:right-0 sm:h-full sm:w-[45vw] sm:min-w-[540px] sm:max-w-[820px] sm:max-h-full',
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
            ) : isFinal && form.orderId && form.orderAccessToken ? (
              <FinalScreen
                cart={form.cart}
                orderId={form.orderId}
                orderAccessToken={form.orderAccessToken}
                onContactMe={() => void form.submitContactMe()}
                isLoading={form.isLoading}
              />
            ) : isFinal && form.orderId ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-destructive">
                  {t('onboarding.errors.server')}
                </p>
                <Button
                  onClick={() => void form.submitContactMe()}
                  disabled={form.isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {t('onboarding.final.contactBtn')}
                </Button>
              </div>
            ) : (
              <>
                {catalogLoading && !catalogErrorKey && (
                  <div className="space-y-4" aria-busy="true" aria-label={t('onboarding.catalogLoading')}>
                    <div className="space-y-3">
                      <Skeleton className="h-3 w-28" />
                      <div className="grid grid-cols-2 gap-2">
                        <Skeleton className="h-[72px] rounded-xl" />
                        <Skeleton className="h-[72px] rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-12 rounded-xl" />
                      <Skeleton className="h-12 rounded-xl" />
                      <Skeleton className="h-12 rounded-xl" />
                    </div>
                  </div>
                )}

                {catalogErrorKey && (
                  <p className="text-sm text-destructive">{t(catalogErrorKey)}</p>
                )}

                {cartEmpty && (
                  <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-6 w-6" aria-hidden />
                    </div>
                    <p className="text-base font-semibold text-foreground">
                      {t('onboarding.emptyCart.title')}
                    </p>
                    <p className="text-sm text-muted-foreground max-w-[280px]">
                      {t('onboarding.emptyCart.hint')}
                    </p>
                    <Button variant="outline" onClick={handleBrowseServices} className="mt-1">
                      {t('onboarding.emptyCart.cta')}
                    </Button>
                  </div>
                )}

                {catalogReady && !cartEmpty && (
                  <>
                <CartHeader
                  cart={form.cart}
                  onRemove={(id) => {
                    const service = form.cart.find((s) => s.id === id);
                    if (service) userRemovedCodesRef.current.add(service.code);
                    form.removeFromCart(id);
                  }}
                />

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
          </div>

          {isWizard && !cartEmpty && (
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
