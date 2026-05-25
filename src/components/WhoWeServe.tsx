import { useTranslation } from "react-i18next";

interface CardData {
  title: string;
  description: string;
  bullets: string[];
}

export const WhoWeServe = () => {
  const { t } = useTranslation();

  const cards: CardData[] = [
    {
      title: t('whoWeServe.cards.international.title'),
      description: t('whoWeServe.cards.international.desc'),
      bullets: t('whoWeServe.cards.international.bullets', { returnObjects: true }) as string[],
    },
    {
      title: t('whoWeServe.cards.ivf.title'),
      description: t('whoWeServe.cards.ivf.desc'),
      bullets: t('whoWeServe.cards.ivf.bullets', { returnObjects: true }) as string[],
    },
    {
      title: t('whoWeServe.cards.hotel.title'),
      description: t('whoWeServe.cards.hotel.desc'),
      bullets: t('whoWeServe.cards.hotel.bullets', { returnObjects: true }) as string[],
    },
    {
      title: t('whoWeServe.cards.postSurgery.title'),
      description: t('whoWeServe.cards.postSurgery.desc'),
      bullets: t('whoWeServe.cards.postSurgery.bullets', { returnObjects: true }) as string[],
    },
  ];

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-body font-medium tracking-[0.16em] uppercase" style={{ color: 'var(--color-indigo)' }}>
            {t('whoWeServe.eyebrow')}
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3" style={{ color: 'var(--color-ink)' }}>
            {t('whoWeServe.title')}
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <article
              key={i}
              className="group bg-white rounded-lg p-7 relative overflow-hidden transition-all duration-200 hover:shadow-card-hover"
              style={{ border: 'none' }}
            >
              {/* Left bar */}
              <div
                className="absolute left-0 top-0 w-[3px] h-0 group-hover:h-full transition-all duration-300"
                style={{ backgroundColor: 'var(--color-indigo)' }}
              />
              <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--color-ink)' }}>
                {card.title}
              </h3>
              <p className="text-sm font-body mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                {card.description}
              </p>
              <ul className="flex flex-wrap gap-2">
                {Array.isArray(card.bullets) && card.bullets.map((bullet, j) => (
                  <li
                    key={j}
                    className="text-xs font-body px-2.5 py-1 rounded"
                    style={{ backgroundColor: 'var(--color-bone)', color: 'var(--color-text-secondary)' }}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
