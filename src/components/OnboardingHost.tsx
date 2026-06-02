import { useEffect, useState } from 'react';
import { OnboardingFormDialog } from './OnboardingForm/OnboardingFormDialog';

type AddToCartEvent = CustomEvent<{ code?: unknown }>;

export const OnboardingHost = () => {
  const [open, setOpen] = useState(false);
  const [serviceCode, setServiceCode] = useState<string | undefined>();
  const [requestNonce, setRequestNonce] = useState(0);

  useEffect(() => {
    const handleAddToCart = (event: Event) => {
      const detail = (event as AddToCartEvent).detail;
      const code = typeof detail?.code === 'string' ? detail.code.trim() : '';
      if (!code) return;

      setServiceCode(code);
      setRequestNonce((value) => value + 1);
      setOpen(true);
    };

    window.addEventListener('nius:add-to-cart', handleAddToCart);
    return () => window.removeEventListener('nius:add-to-cart', handleAddToCart);
  }, []);

  return (
    <OnboardingFormDialog
      key={`${serviceCode ?? 'none'}-${requestNonce}`}
      open={open}
      onOpenChange={setOpen}
      initialServiceCode={serviceCode}
    />
  );
};
