import { Card } from "@/components/ui/card";
import ivDripIcon from "@/assets/drp-2.png";
import injectionIcon from "@/assets/injection.png";
import woundCareIcon from "@/assets/WoundDressingBandage.png";
import hygieneIcon from "@/assets/HygieneAssistance.png";
import escortIcon from "@/assets/escort.png";
import massageIcon from "@/assets/massage.png";
import { useTranslation } from "react-i18next";

export const Services = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const langPrefix = currentLang === 'en' ? '' : `/${currentLang}`;
  
  const services = [
    {
      image: ivDripIcon,
      title: t('services.ivInfusion.title'),
      description: t('services.ivInfusion.description'),
      link: currentLang === 'en' ? '/iv-drip-therapy-prague' : `/${currentLang}/iv-drip-therapy-prague`,
    },
    {
      image: injectionIcon,
      title: t('services.injection.title'),
      description: t('services.injection.description'),
      link: currentLang === 'en' ? '/ivf-injection-support-prague' : `/${currentLang}/ivf-injection-support-prague`,
    },
    {
      image: woundCareIcon,
      title: t('services.woundCare.title'),
      description: t('services.woundCare.description'),
      link: currentLang === 'en' ? '/post-surgery-recovery-care-prague' : `/${currentLang}/post-surgery-recovery-care-prague`,
    },
    {
      image: hygieneIcon,
      title: t('services.hygiene.title'),
      description: t('services.hygiene.description'),
      link: currentLang === 'en' ? '/disabled-daily-care-prague' : `/${currentLang}/disabled-daily-care-prague`,
    },
    {
      image: escortIcon,
      title: t('services.escort.title'),
      description: t('services.escort.description'),
      link: currentLang === 'en' ? '/specialized-services' : `/${currentLang}/specialized-services`,
    },
    {
      image: massageIcon,
      title: t('services.massage.title'),
      description: t('services.massage.description'),
      link: currentLang === 'en' ? '/specialized-services' : `/${currentLang}/specialized-services`,
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
            <div
              key={index}
              onClick={() => window.location.href = service.link}
              className="block h-full cursor-pointer"
            >
              <Card
                className="p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-slide-up group h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 flex justify-center">
                  <div className="h-32 w-32 flex items-center justify-center">
                    <img 
                      src={service.image} 
                      alt={`${service.title} - Professional nursing service in Prague`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
