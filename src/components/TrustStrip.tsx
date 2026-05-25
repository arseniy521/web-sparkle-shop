import { useTranslation } from "react-i18next";

export const TrustStrip = () => {
  const { t } = useTranslation();

  const items = [
    t('trustStrip.nurses'),
    t('trustStrip.sameDay'),
    t('trustStrip.international'),
    t('trustStrip.formulas'),
    t('trustStrip.screening'),
  ];

  return (
    <section style={{ backgroundColor: 'var(--color-indigo)' }} className="py-5 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4 md:gap-0">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 flex-1 min-w-0 justify-center">
              {i > 0 && (
                <div className="hidden md:block w-px h-8 flex-shrink-0 -ml-4 mr-4" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              )}
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-70" />
              </div>
              <span className="text-xs font-body font-medium text-white whitespace-nowrap">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
