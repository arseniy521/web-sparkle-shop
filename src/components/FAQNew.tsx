import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

export const FAQNew = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = t('faqNew.items', { returnObjects: true }) as { q: string; a: string }[];

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-10" style={{ color: 'var(--color-ink)' }}>
          {t('faqNew.title')}
        </h2>

        <div className="space-y-0">
          {Array.isArray(faqs) && faqs.map((faq, i) => (
            <div
              key={i}
              style={{ borderBottom: '0.5px solid var(--color-border)' }}
            >
              <button
                className="w-full flex items-center justify-between py-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="font-display font-semibold text-sm pr-4" style={{ color: 'var(--color-ink)' }}>
                  {faq.q}
                </span>
                <ChevronDown
                  className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                  style={{
                    color: 'var(--color-text-muted)',
                    transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openIndex === i ? '300px' : '0px',
                  opacity: openIndex === i ? 1 : 0,
                }}
              >
                <p className="pb-5 text-sm font-body leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
