import { useTranslation } from "react-i18next";

const PHOTO_FILTER = 'brightness(1.02) contrast(0.98) saturate(0.92)';

interface CardData {
  title: string;
  description: string;
  bullets: string[];
  image: string;
  alt: string;
}

export const WhoWeServe = () => {
  const { t } = useTranslation();

  const cards: CardData[] = [
    {
      title: t('whoWeServe.cards.international.title'),
      description: t('whoWeServe.cards.international.desc'),
      bullets: t('whoWeServe.cards.international.bullets', { returnObjects: true }) as string[],
      image: '/photos/nurse-home-visit2.jpg',
      alt: 'Nurse visiting international client at home in Prague',
    },
    {
      title: t('whoWeServe.cards.ivf.title'),
      description: t('whoWeServe.cards.ivf.desc'),
      bullets: t('whoWeServe.cards.ivf.bullets', { returnObjects: true }) as string[],
      image: '/photos/hotel-client.jpg',
      alt: 'Nurse preparing IV line for IVF patient',
    },
    {
      title: t('whoWeServe.cards.hotel.title'),
      description: t('whoWeServe.cards.hotel.desc'),
      bullets: t('whoWeServe.cards.hotel.bullets', { returnObjects: true }) as string[],
      image: '/photos/nurse-close-up.jpg',
      alt: 'Nurse providing IV therapy in luxury hotel setting',
    },
    {
      title: t('whoWeServe.cards.postSurgery.title'),
      description: t('whoWeServe.cards.postSurgery.desc'),
      bullets: t('whoWeServe.cards.postSurgery.bullets', { returnObjects: true }) as string[],
      image: '/photos/nurse-home-visit.jpg',
      alt: 'Nurse providing post-surgery care at home',
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
            {t('whoWeServe.titleBase')} <span style={{ color: 'var(--color-indigo)', fontWeight: 700 }}>{t('whoWeServe.titleAccent')}</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <article
              key={i}
              className="group bg-white rounded-lg relative overflow-hidden transition-all duration-200 hover:shadow-card-hover"
              style={{ border: 'none' }}
            >
              {/* Image */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img
                  src={card.image}
                  alt={card.alt}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-t-lg"
                  style={{ filter: PHOTO_FILTER }}
                />
                <div
                  className="absolute inset-0 rounded-t-lg"
                  style={{ background: 'linear-gradient(to bottom, transparent 70%, white 100%)' }}
                />
              </div>

              {/* Content */}
              <div className="p-7 pt-2 relative">
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
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
