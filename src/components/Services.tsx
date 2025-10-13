import { Card } from "@/components/ui/card";
import ivDripIcon from "@/assets/drp-2.png";
import injectionIcon from "@/assets/injection.png";
import woundCareIcon from "@/assets/WoundDressingBandage.png";
import hygieneIcon from "@/assets/HygieneAssistance.png";
import escortIcon from "@/assets/escort.png";
import massageIcon from "@/assets/massage.png";
import { useTranslation } from "react-i18next";

export const Services = () => {
  const { t } = useTranslation();
  
  const services = [
    {
      image: ivDripIcon,
      title: t('services.ivInfusion.title'),
      description: t('services.ivInfusion.description'),
    },
    {
      image: injectionIcon,
      title: t('services.injection.title'),
      description: t('services.injection.description'),
    },
    {
      image: woundCareIcon,
      title: t('services.woundCare.title'),
      description: t('services.woundCare.description'),
    },
    {
      image: hygieneIcon,
      title: t('services.hygiene.title'),
      description: t('services.hygiene.description'),
    },
    {
      image: escortIcon,
      title: t('services.escort.title'),
      description: t('services.escort.description'),
    },
    {
      image: massageIcon,
      title: t('services.massage.title'),
      description: t('services.massage.description'),
    },
  ];
  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('services.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-slide-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 flex justify-center">
                <div className="h-32 w-32 flex items-center justify-center">
                  <img 
                    src={service.image} 
                    alt={`${service.title} icon`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
