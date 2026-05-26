import { useTranslation } from "react-i18next";

const GOOGLE_REVIEWS_URL = "https://g.page/r/Cb4BmqPTZRSSEBE/review";

export const TestimonialsNew = () => {
  const { t } = useTranslation();

  const testimonials = Array.from({ length: 6 }, (_, i) => ({
    quote: t(`testimonialsNew.items.${i}.quote`),
    name: t(`testimonialsNew.items.${i}.name`),
    origin: t(`testimonialsNew.items.${i}.origin`),
  }));

  return (
    <section id="testimonials" className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header with Google badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <h2 className="font-display font-bold text-3xl md:text-4xl" style={{ color: 'var(--color-ink)' }}>
            {t('testimonialsNew.title')}
          </h2>
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-shadow hover:shadow-card-hover"
            style={{ backgroundColor: 'white', border: '0.5px solid var(--color-border)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div className="flex items-center gap-1">
              <span className="font-display font-bold text-sm" style={{ color: 'var(--color-ink)' }}>4.9</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 16 16" fill="#FBBC05">
                    <path d="M8 0l2.47 4.94L16 5.82l-4 3.86.94 5.46L8 12.77l-4.94 2.37.94-5.46-4-3.86 5.53-.88z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-body" style={{ color: 'var(--color-text-muted)' }}>Google</span>
            </div>
          </a>
        </div>

        {/* Cards */}
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {testimonials.map((item, i) => (
            <article
              key={i}
              className="bg-white rounded-lg p-7 min-w-[300px] snap-start md:min-w-0"
              style={{ border: '0.5px solid var(--color-border)' }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 16 16" fill="#FBBC05">
                    <path d="M8 0l2.47 4.94L16 5.82l-4 3.86.94 5.46L8 12.77l-4.94 2.37.94-5.46-4-3.86 5.53-.88z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="font-body text-[14px] leading-relaxed mb-4" style={{ color: 'var(--color-text-primary)' }}>
                "{item.quote}"
              </p>

              {/* Name */}
              <div className="text-[13px] font-body font-medium" style={{ color: 'var(--color-ink)' }}>
                {item.name}
              </div>
              <div className="text-[11px] font-body mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {item.origin}
              </div>
            </article>
          ))}
        </div>

        {/* Review CTA */}
        <div className="text-center mt-10">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded font-body font-medium text-sm text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--color-indigo)' }}
          >
            {t('testimonialsNew.reviewCta')} →
          </a>
        </div>
      </div>
    </section>
  );
};
