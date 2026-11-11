import { useTranslation } from "react-i18next";
import { trackCtaClick } from "@/lib/analytics";

export const HeroNew = () => {
  const { t } = useTranslation();

  return (
    <section id="home" className="relative py-10 md:py-24 lg:py-32 overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-[60%_40%] gap-12 items-center">
          {/* Left column */}
          <div className="space-y-6">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ backgroundColor: 'var(--color-blue)' }} />
              <span className="text-sm font-body font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {t('heroNew.eyebrow')}
              </span>
            </div>

            {/* H1 — static headline */}
            <h1 className="font-display font-bold leading-[1.05]" style={{ fontSize: 'clamp(40px, 5vw, 72px)', color: 'var(--color-indigo)' }}>
              {t('heroNew.headline')}
            </h1>

            {/* Sub-headline */}
            <p className="font-body text-base md:text-lg max-w-[480px]" style={{ color: 'var(--color-text-secondary)' }}>
              {t('heroNew.subheadline')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="#menu"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded font-body font-medium text-sm text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--color-indigo)' }}
                onClick={(e) => {
                  e.preventDefault();
                  trackCtaClick('choose_service', 'hero');
                  document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('heroNew.ctaPrimary')} ↓
              </a>
              <a
                href="https://wa.me/420773629123"
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-source="hero"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded font-body font-medium text-sm transition-colors"
                style={{ color: 'var(--color-indigo)', border: '1px solid var(--color-indigo)' }}
              >
                {t('heroNew.ctaSecondary')} →
              </a>
            </div>
          </div>

          {/* Right column — hero image */}
          <div className="relative flex justify-center md:justify-end">
            <img
              src="/photos/hero-iv-bag.webp"
              alt="NIUS branded IV drip bag"
              width={1086}
              height={1448}
              fetchPriority="high"
              className="rounded-lg object-cover w-auto max-h-[340px] md:max-h-[600px]"
              style={{
                aspectRatio: '3/4',
                boxShadow: '0 24px 60px rgba(21,63,77,0.12)',
              }}
            />
          </div>
        </div>

        {/* Trust row */}
        <ul
          className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 md:mt-12 pt-6 text-sm font-body font-medium"
          style={{ borderTop: '0.5px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          <li>{t('heroNew.trustHours')}</li>
        </ul>
      </div>

    </section>
  );
};
