import { useTranslation } from "react-i18next";
import { trackCtaClick } from "@/lib/analytics";
import { HeroStories } from "@/components/HeroStories";
import { GOOGLE_RATING } from "@/constants/reviews";

export const HeroNew = () => {
  const { t } = useTranslation();

  const stats = [
    { value: '3 000+', label: t('heroNew.statsVisits') },
    { value: `${GOOGLE_RATING.ratingValue}★`, label: t('heroNew.statsGoogle') },
    { value: '8:00–21:00', label: t('heroNew.statsHours') },
    { value: t('heroNew.statsSameDay'), label: t('heroNew.statsSameDayLabel') },
  ];

  // Highlight the closing phrase of the headline when it matches (all four locales define it).
  const headline = t('heroNew.headline');
  const accent = t('heroNew.headlineAccent');
  const hasAccent = accent && headline.endsWith(accent);
  const headlineLead = hasAccent ? headline.slice(0, headline.length - accent.length) : headline;
  const headlineAccent = hasAccent ? accent : '';

  const c = {
    bg: 'var(--color-bg)',
    heading: 'var(--color-indigo)',
    text: 'var(--color-text-secondary)',
    eyebrow: 'var(--color-text-secondary)',
    dot: 'var(--color-blue)',
    marker: 'var(--color-peach)',
    markerHeight: '0.3em',
    accent: 'var(--color-indigo)',
    primaryBg: 'var(--color-indigo)',
    primaryText: '#ffffff',
    secondaryText: 'var(--color-indigo)',
    secondaryBorder: '1px solid var(--color-indigo)',
    statValue: 'var(--color-ink)',
    statLabel: 'var(--color-text-muted)',
    line: 'var(--color-border)',
    glow: 'radial-gradient(closest-side, rgba(252,221,192,0.75), rgba(252,221,192,0))',
  };

  return (
    <section id="home" className="relative py-10 md:py-24 lg:py-32 overflow-hidden" style={{ background: c.bg }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 items-center">
          {/* Left column */}
          <div className="space-y-6">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ backgroundColor: c.dot }} />
              <span className="text-sm font-body font-medium" style={{ color: c.eyebrow }}>
                {t('heroNew.eyebrow')}
              </span>
            </div>

            {/* H1 — static headline */}
            <h1 className="font-display font-bold leading-[1.02] tracking-[-0.02em]" style={{ fontSize: 'clamp(42px, 5.8vw, 84px)', color: c.heading }}>
              {headlineLead}
              {headlineAccent && (
                <span className="relative isolate inline-block whitespace-nowrap" style={{ color: c.accent }}>
                  {headlineAccent}
                  <span
                    aria-hidden="true"
                    className="absolute -z-10 left-[-0.05em] right-[-0.05em] bottom-[0.04em] rounded-full"
                    style={{ backgroundColor: c.marker, height: c.markerHeight }}
                  />
                </span>
              )}
            </h1>

            {/* Sub-headline */}
            <p className="font-body text-base md:text-lg max-w-[500px]" style={{ color: c.text }}>
              {t('heroNew.subheadline')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="#menu"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full font-body font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: c.primaryBg, color: c.primaryText }}
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
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full font-body font-medium text-sm transition-colors"
                style={{ color: c.secondaryText, border: c.secondaryBorder }}
              >
                {t('heroNew.ctaSecondary')} →
              </a>
            </div>
          </div>

          {/* Right column: stories card on a soft glow */}
          <div className="relative flex justify-center md:justify-end">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2"
              style={{ background: c.glow }}
            />
            <HeroStories />
          </div>
        </div>

        {/* Stats row */}
        <ul
          className="flex flex-wrap items-start justify-center gap-y-6 mt-10 md:mt-14 pt-8"
          style={{ borderTop: `0.5px solid ${c.line}` }}
        >
          {stats.map((stat, i) => (
            <li
              key={i}
              className="w-1/2 md:w-auto md:px-12 text-center md:border-l first:md:border-l-0"
              style={{ borderColor: c.line }}
            >
              <span className="font-display font-bold text-xl" style={{ color: c.statValue }}>{stat.value}</span>
              <span className="block text-xs font-body" style={{ color: c.statLabel }}>{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>

    </section>
  );
};
