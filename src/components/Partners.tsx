import { useTranslation } from "react-i18next";

export const Partners = () => {
  const { t } = useTranslation();

  const partners = [
    'Unica Clinic',
    'Formé Clinic',
    'Prague Fertility Centre',
    'Mandarin Oriental',
    'Four Seasons Prague',
    'GymBeam',
  ];

  return (
    <section className="py-14 md:py-16" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
        <p className="text-[10px] font-body font-medium tracking-[0.16em] uppercase mb-8" style={{ color: 'var(--color-text-muted)' }}>
          {t('partners.label')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {partners.map((name) => (
            <span
              key={name}
              className="font-display font-semibold text-lg"
              style={{ color: 'rgba(21,63,77,0.3)' }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
