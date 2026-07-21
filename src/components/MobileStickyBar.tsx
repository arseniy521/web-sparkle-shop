import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { onboardingCart, useOnboardingCart } from "@/hooks/useOnboardingCart";
import { trackCtaClick } from "@/lib/analytics";

export const MobileStickyBar = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const { codes } = useOnboardingCart();

  useEffect(() => {
    const hero = document.querySelector('#home');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex gap-3 px-4 py-3 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{
        backgroundColor: 'white',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'var(--sticky-bar-display, none)',
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (codes.length > 0) {
            trackCtaClick('cart', 'mobile_sticky', { cart_items_count: codes.length });
            onboardingCart.openForm('mobile_sticky');
            return;
          }
          trackCtaClick('choose_service', 'mobile_sticky');
          document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded font-body font-medium text-sm text-white"
        style={{ backgroundColor: 'var(--color-indigo)' }}
      >
        {codes.length > 0 ? `${t('nav.cart')} (${codes.length})` : t('heroNew.ctaPrimary')}
      </button>
      <a
        href="https://wa.me/420773629123"
        target="_blank"
        rel="noopener noreferrer"
        data-analytics-source="mobile_sticky"
        className="flex items-center justify-center gap-2 px-4 py-3 rounded font-body font-medium text-sm"
        style={{ color: 'var(--color-indigo)', border: '1.5px solid var(--color-indigo)', backgroundColor: 'transparent' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.574-1.472A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.17 0-4.183-.59-5.926-1.613l-.424-.253-2.715.874.866-2.634-.278-.44A9.77 9.77 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12s-4.4 9.818-9.818 9.818z"/></svg>
        WhatsApp
      </a>
    </div>
  );
};
