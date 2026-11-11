import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { buildLanguageUrl } from "@/utils/languageUtils";
import { enableAnalytics, disableAnalytics } from "@/lib/analytics";
import { getConsent, setConsent } from "@/lib/consent";
import { useOnboardingCart } from "@/hooks/useOnboardingCart";

const COPY: Record<string, { text: string; policy: string; reject: string; accept: string; label: string }> = {
  cs: { text: "Používáme cookies pro analytiku a měření reklamy (Google, Amplitude), abychom službu zlepšovali. Bez vašeho souhlasu je nenastavujeme.", policy: "Zásady ochrany osobních údajů", reject: "Odmítnout", accept: "Souhlasím", label: "Souhlas s cookies" },
  en: { text: "We use cookies for analytics and ad measurement (Google, Amplitude) to improve our service. We set none of them without your consent.", policy: "Privacy Policy", reject: "Reject", accept: "Accept", label: "Cookie consent" },
  ru: { text: "Мы используем cookies для аналитики и измерения рекламы (Google, Amplitude), чтобы улучшать сервис. Без вашего согласия мы их не устанавливаем.", policy: "Политика конфиденциальности", reject: "Отклонить", accept: "Принять", label: "Согласие на cookies" },
  uk: { text: "Ми використовуємо cookies для аналітики та вимірювання реклами (Google, Amplitude), щоб покращувати сервіс. Без вашої згоди ми їх не встановлюємо.", policy: "Політика конфіденційності", reject: "Відхилити", accept: "Прийняти", label: "Згода на cookies" },
};

export const CookieConsent = () => {
  const { i18n } = useTranslation();
  const copy = COPY[i18n.language] ?? COPY.cs;
  const [visible, setVisible] = useState(false);
  const { open: orderFormOpen } = useOnboardingCart();

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      setVisible(true);
    } else if (consent === "rejected") {
      disableGA();
    }
  }, []);

  const accept = () => {
    setConsent("accepted");
    enableAnalytics();
    setVisible(false);
  };

  const reject = () => {
    setConsent("rejected");
    disableGA();
    disableAnalytics();
    setVisible(false);
  };

  const disableGA = () => {
    (window as unknown as Record<string, boolean>)["ga-disable-G-VNMLWF0XZG"] = true;
    document.cookie = "_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "_ga_VNMLWF0XZG=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  // Keep the banner out of the way while the order form is open; consent stays pending.
  if (!visible || orderFormOpen) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60]"
      role="dialog"
      aria-label={copy.label}
      style={{ backgroundColor: 'white', borderTop: '0.5px solid var(--color-border)', boxShadow: '0 -2px 12px rgba(0,0,0,0.06)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <p className="text-[11px] leading-snug md:text-xs font-body flex-1" style={{ color: 'var(--color-text-secondary)' }}>
          {copy.text}{" "}
          <Link to={buildLanguageUrl("/privacy", i18n.language)} className="underline" style={{ color: 'var(--color-indigo)' }}>{copy.policy}</Link>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={reject}
            className="flex-1 sm:flex-none px-4 py-2 rounded text-xs font-body font-medium transition-colors"
            style={{ color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border)' }}
          >
            {copy.reject}
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-4 py-2 rounded text-xs font-body font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--color-indigo)' }}
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
};
