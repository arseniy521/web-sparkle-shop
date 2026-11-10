import { OnboardingFormDialog } from './OnboardingForm/OnboardingFormDialog';
import { onboardingCart, useOnboardingCart } from '@/hooks/useOnboardingCart';

const handleOpenChange = (next: boolean) => onboardingCart.setOpen(next);
const handleOrderComplete = () => onboardingCart.clearItems();
const handleCartCodesChange = (next: string[]) => onboardingCart.setCodes(next);

export const OnboardingHost = () => {
  const { codes, open, openSource } = useOnboardingCart();

  return (
    <OnboardingFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      initialServiceCodes={codes}
      analyticsSource={openSource ?? 'header'}
      onOrderComplete={handleOrderComplete}
      onCartCodesChange={handleCartCodesChange}
    />
  );
};
