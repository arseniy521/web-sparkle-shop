import { createElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnboardingCart } from '@/hooks/useOnboardingCart';

const MENU_HEADINGS: Record<string, string> = {
  cs: 'Menu IV kapaček: návštěva sestry po Praze',
  en: 'IV Drip Menu: Prague Home Visits',
  ru: 'Меню капельниц: визиты медсестры по Праге',
  uk: 'Меню крапельниць: візити медсестри по Празі',
};

export const MenuSection = () => {
  const { i18n } = useTranslation();
  const { codes } = useOnboardingCart();

  return (
    <section id="menu" className="py-16 md:py-24" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {createElement('nius-menu', { section: 'menu', locale: i18n.language, 'cart-codes': JSON.stringify(codes) })}
      </div>
      <div className="sr-only" aria-hidden="true">
        <h2>{MENU_HEADINGS[i18n.language] ?? MENU_HEADINGS.en}</h2>
        <h3>Vitamins &amp; Minerals</h3>
        <ul>
          <li>Immunity Lite: Vitamins and fluids. From 2,900 CZK. 40–50 min IV infusion.</li>
          <li>Immunity Power: Vitamin C and fluids. From 3,250 CZK. 45–55 min.</li>
          <li>Vitamin &amp; Mineral Classic: Vitamins, minerals and fluids. From 3,750 CZK. 45–55 min.</li>
          <li>Vitamin &amp; Mineral Plus: Extended vitamin and mineral blend with fluids. From 4,350 CZK. 50–60 min.</li>
        </ul>
        <h3>Energy &amp; Performance</h3>
        <ul>
          <li>CEO Recharge: Vitamins, minerals and fluids for busy days. From 4,550 CZK. 65–75 min.</li>
          <li>Metabolic Reset: Vitamins and fluids. From 4,050 CZK. 55–65 min.</li>
          <li>B-Power Shot: Vitamin B12 shot. From 1,650 CZK. 10–15 min.</li>
        </ul>
        <h3>Hydration &amp; Balance</h3>
        <ul>
          <li>Pure Hydrate: Fluids and electrolytes. From 2,550 CZK. 35–45 min.</li>
          <li>Electrolyte Reset: Fluids with electrolytes and magnesium. From 3,050 CZK. 45–55 min.</li>
          <li>Jet Lag Recovery: Rehydration after travel. From 3,250 CZK. 45–55 min.</li>
        </ul>
        <h3>Nursing Care</h3>
        <ul>
          <li>Post-Op Wound Dressing: Wound dressing by a registered nurse. From 1,890 CZK. 30–45 min.</li>
          <li>Hygiene Assistance: Hygiene and comfort care. From 1,690 CZK.</li>
          <li>Nurse Escort: Accompanied transport to medical appointments. From 2,190 CZK.</li>
          <li>IVF injection visit: We administer medication prescribed by your clinic, following their written instructions. From 1,900 CZK.</li>
        </ul>
        <p>Every infusion is prescribed by a doctor after a short health assessment, and the consultation is included in the price.</p>
        <p>Same-day visits, daily 8:00–21:00. We confirm the arrival time after you book. NIUS is not an emergency service: call 155/112.</p>
      </div>
    </section>
  );
};

export const BundlesSection = () => {
  const { i18n } = useTranslation();

  return (
    <section id="bundles" className="py-8 md:py-16" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {createElement('nius-menu', { section: 'packages', locale: i18n.language })}
      </div>
    </section>
  );
};

export const SubscriptionSection = () => {
  const { i18n } = useTranslation();

  return (
    <section id="membership" className="py-16 md:py-24" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {createElement('nius-menu', { section: 'subscription', locale: i18n.language })}
      </div>
    </section>
  );
};
