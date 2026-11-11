import { useTranslation } from "react-i18next";

interface IncludedItem {
  title: string;
  desc: string;
}

export const WhatsIncluded = () => {
  const { t } = useTranslation();
  const items = t('whatsIncluded.items', { returnObjects: true }) as IncludedItem[];

  return (
    <section id="whats-included" className="py-10 md:py-14" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div
          className="rounded-lg bg-white p-6 md:p-10"
          style={{ border: '0.5px solid var(--color-border)' }}
        >
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-6 md:mb-8" style={{ color: 'var(--color-ink)' }}>
            {t('whatsIncluded.title')}
          </h2>
          <ul className="grid md:grid-cols-3 gap-x-8 gap-y-6">
            {Array.isArray(items) && items.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--color-indigo)' }}
                  aria-hidden="true"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6.2L5 8.7L9.5 3.7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <div className="font-display font-semibold text-base" style={{ color: 'var(--color-ink)' }}>
                    {item.title}
                  </div>
                  <p className="mt-1 text-sm font-body" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
