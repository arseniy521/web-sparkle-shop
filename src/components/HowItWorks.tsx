import { useTranslation } from "react-i18next";

export const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { num: '01/04', title: t('howItWorks.steps.0.title'), desc: t('howItWorks.steps.0.desc'), time: t('howItWorks.steps.0.time') },
    { num: '02/04', title: t('howItWorks.steps.1.title'), desc: t('howItWorks.steps.1.desc'), time: t('howItWorks.steps.1.time') },
    { num: '03/04', title: t('howItWorks.steps.2.title'), desc: t('howItWorks.steps.2.desc'), time: t('howItWorks.steps.2.time') },
    { num: '04/04', title: t('howItWorks.steps.3.title'), desc: t('howItWorks.steps.3.desc'), time: t('howItWorks.steps.3.time') },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-indigo)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12">
          <span className="text-xs font-body font-medium tracking-[0.16em] uppercase" style={{ color: 'var(--color-blue)' }}>
            {t('howItWorks.eyebrow')}
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-white">
            {t('howItWorks.titleBase')} <span className="display-italic" style={{ color: 'var(--color-peach)', fontStyle: 'italic', fontWeight: 600 }}>{t('howItWorks.titleItalic')}</span>
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-4 gap-0">
          {steps.map((step, i) => (
            <div
              key={i}
              className="py-6 md:px-6 first:pl-0 last:pr-0"
              style={{ borderRight: i < 3 ? '0.5px solid rgba(255,255,255,0.08)' : 'none' }}
            >
              <span className="text-xs font-body font-medium tracking-[0.1em]" style={{ color: 'var(--color-blue)' }}>
                {step.num}
              </span>
              <h3 className="font-display font-bold text-lg text-white mt-3 mb-2">
                {step.title}
              </h3>
              <p className="text-[13px] font-body leading-relaxed" style={{ color: 'var(--color-text-on-dark-muted)' }}>
                {step.desc}
              </p>
              <span className="inline-block mt-3 text-xs font-body font-medium" style={{ color: 'var(--color-blue)' }}>
                {step.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
