import { useTranslation } from "react-i18next";

export const Workflow = () => {
  const { t } = useTranslation();

  const steps = [
    { key: "step1" },
    { key: "step2" },
    { key: "step3" },
  ];

  return (
    <section id="workflow" className="py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-4 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            {t('workflow.title')}
          </h2>
        </div>
        <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('workflow.description')}
        </p>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.key} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg">
                {index + 1}
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-2xl font-semibold mb-3">
                  {t(`workflow.${step.key}.title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`workflow.${step.key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
