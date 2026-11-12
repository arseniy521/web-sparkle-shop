import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { onboardingCart } from '@/hooks/useOnboardingCart';
import { APP_NIUS_URL } from '@/constants/siteContacts';
import { trackCtaClick, type ConversionSource } from '@/lib/analytics';

interface BookingLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  /** Service code to preselect in the order form (optional). */
  serviceCode?: string;
  source?: ConversionSource;
  children: ReactNode;
}

/**
 * Opens the in-site order form (same flow as the homepage menu).
 * Without JS the href falls back to the booking form in the NIUS app.
 */
export const BookingLink = ({
  serviceCode,
  source = 'page_content',
  children,
  ...rest
}: BookingLinkProps) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    trackCtaClick('choose_service', source, serviceCode ? { service_code: serviceCode } : undefined);
    if (serviceCode) onboardingCart.order(serviceCode, source);
    else onboardingCart.openForm(source);
  };

  return (
    <a {...rest} href={`${APP_NIUS_URL}/form`} onClick={handleClick}>
      {children}
    </a>
  );
};
