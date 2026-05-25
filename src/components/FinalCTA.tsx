import { useTranslation } from "react-i18next";

export const FinalCTA = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-indigo) 0%, var(--color-indigo-deep) 100%)' }}>
      {/* Watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ fontSize: '320px', color: 'rgba(255,255,255,0.04)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1 }}
      >
        NIUS
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 text-center">
        {/* Eyebrow */}
        <span className="text-xs font-body font-medium tracking-[0.16em] uppercase" style={{ color: 'var(--color-peach)' }}>
          {t('finalCta.eyebrow')}
        </span>

        {/* Title */}
        <h2 className="font-display font-bold text-3xl md:text-[52px] text-white mt-4 mb-4 leading-tight">
          {t('finalCta.titleBase')} <span className="display-italic" style={{ color: 'var(--color-peach)', fontStyle: 'italic', fontWeight: 600 }}>{t('finalCta.titleItalic')}</span>
        </h2>

        {/* Sub */}
        <p className="font-body text-base md:text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--color-text-on-dark-muted)' }}>
          {t('finalCta.sub')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <a
            href="https://wa.me/420773629123"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3.5 rounded font-body font-medium text-sm transition-colors"
            style={{ backgroundColor: 'var(--color-bone)', color: 'var(--color-indigo)' }}
          >
            {t('finalCta.ctaPrimary')} →
          </a>
          <a
            href="mailto:hello@nius.cz"
            className="inline-flex items-center px-6 py-3.5 rounded font-body font-medium text-sm text-white transition-colors"
            style={{ border: '0.5px solid rgba(255,255,255,0.3)' }}
          >
            {t('finalCta.ctaSecondary')}
          </a>
        </div>

        {/* Trust line */}
        <p className="text-xs font-body" style={{ color: 'var(--color-text-on-dark-muted)' }}>
          {t('finalCta.trustLine')}
        </p>
      </div>
    </section>
  );
};
