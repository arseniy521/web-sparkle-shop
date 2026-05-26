import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { getLanguageFromPath, getLanguagePrefix } from "@/utils/languageUtils";

const PHOTO_FILTER = 'brightness(1.02) contrast(0.98) saturate(0.92)';

export const OurNurses = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  return (
    <section id="our-nurses" className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-[45%_55%] gap-12 items-center">
          {/* Left — portrait */}
          <div className="relative">
            <img
              src="/photos/nurse-portrait.jpg"
              alt={t('ourNurses.imageAlt')}
              loading="lazy"
              className="w-full rounded-lg object-cover"
              style={{
                aspectRatio: '3/4',
                maxHeight: '560px',
                filter: PHOTO_FILTER,
                boxShadow: '0 16px 48px rgba(21,63,77,0.1)',
              }}
            />
          </div>

          {/* Right — text */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-body font-medium tracking-[0.16em] uppercase" style={{ color: 'var(--color-indigo)' }}>
                {t('ourNurses.eyebrow')}
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl mt-3" style={{ color: 'var(--color-ink)' }}>
                {t('ourNurses.titleBase')} <span style={{ color: 'var(--color-indigo)', fontWeight: 700 }}>{t('ourNurses.titleAccent')}</span>
              </h2>
            </div>

            <p className="font-body text-base leading-relaxed max-w-[520px]" style={{ color: 'var(--color-text-secondary)' }}>
              {t('ourNurses.description')}
            </p>

            <Link
              to={`${langPrefix}/our-team/`}
              className="inline-flex items-center font-body font-medium text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--color-indigo)' }}
            >
              {t('ourNurses.cta')} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
