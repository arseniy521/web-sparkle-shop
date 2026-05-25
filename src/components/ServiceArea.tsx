import { useTranslation } from "react-i18next";

export const ServiceArea = () => {
  const { t } = useTranslation();

  const districts = [
    'Prague 1', 'Prague 2', 'Prague 3', 'Prague 4', 'Prague 5',
    'Prague 6', 'Prague 7', 'Prague 8', 'Prague 9', 'Prague 10',
    'Vinohrady', 'Žižkov', 'Old Town', 'New Town'
  ];

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-[60%_40%] gap-12 items-start">
          {/* Map placeholder */}
          <div className="rounded-lg overflow-hidden h-[300px] md:h-[400px]" style={{ backgroundColor: 'var(--color-bone)', border: '0.5px solid var(--color-border)' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d81918.47301200803!2d14.351742!3d50.083012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b939c0970798b%3A0x400af0f66164090!2sPrague!5e0!3m2!1sen!2scz!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="NIUS service area Prague"
            />
          </div>

          {/* Info */}
          <div>
            <h2 className="font-display font-bold text-2xl mb-4" style={{ color: 'var(--color-ink)' }}>
              {t('serviceArea.title')}
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {districts.map((d) => (
                <span key={d} className="text-xs font-body px-2.5 py-1 rounded" style={{ backgroundColor: 'white', color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border)' }}>
                  {d}
                </span>
              ))}
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'white', border: '0.5px solid var(--color-border)' }}>
              <div className="font-display font-bold text-sm" style={{ color: 'var(--color-indigo)' }}>
                {t('serviceArea.responseTitle')}
              </div>
              <p className="text-xs font-body mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {t('serviceArea.responseDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
