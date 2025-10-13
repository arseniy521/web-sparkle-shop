import { CheckCircle } from "lucide-react";
import benefitsImage from "@/assets/nurse-benefits.png";
import { useTranslation } from "react-i18next";

export const Benefits = () => {
  const { t } = useTranslation();
  
  const benefits = [
    {
      emoji: "🏠",
      title: t('benefits.comfort.title'),
      description: t('benefits.comfort.description'),
    },
    {
      emoji: "⏰",
      title: t('benefits.speed.title'),
      description: t('benefits.speed.description'),
    },
    {
      emoji: "👩‍⚕️",
      title: t('benefits.professional.title'),
      description: t('benefits.professional.description'),
    },
  ];

  return (
    <section id="why-us" className="py-20 bg-accent/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-card bg-white p-8">
              <img
                src={benefitsImage}
                alt="Patient receiving IV therapy at home - comfortable home healthcare"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-8 animate-slide-up">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t('benefits.title')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('benefits.description')}
              </p>
            </div>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-6 rounded-2xl bg-card hover:shadow-card transition-all duration-300"
                >
                  <div className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-3xl">
                      {benefit.emoji}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-secondary mb-2 flex items-center gap-2">
                      {benefit.title}
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    </h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
