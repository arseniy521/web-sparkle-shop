import { OnboardingFormDialog } from './OnboardingForm/OnboardingFormDialog';
import { onboardingCart, useOnboardingCart } from '@/hooks/useOnboardingCart';

export const OnboardingHost = () => {
  const { codes, open } = useOnboardingCart();

  return (
    <OnboardingFormDialog
      open={open}
      onOpenChange={(next) => onboardingCart.setOpen(next)}
      initialServiceCodes={codes}
      onOrderComplete={() => onboardingCart.clearItems()}
      onCartCodesChange={(next) => onboardingCart.setCodes(next)}
    />
  );
};
