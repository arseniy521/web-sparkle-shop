import { Card } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import ivDripIcon from "@/assets/drp-2.png";
import injectionIcon from "@/assets/injection.png";
import woundCareIcon from "@/assets/WoundDressingBandage.png";
import hygieneIcon from "@/assets/HygieneAssistance.png";
import escortIcon from "@/assets/escort.png";
import massageIcon from "@/assets/massage.png";
import { useTranslation } from "react-i18next";
import { getLanguagePrefix, getLanguageFromPath } from "@/utils/languageUtils";

export const Services = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);
  
  const services = [
    {
      image: ivDripIcon,
      title: t('services.ivInfusion.title'),
      description: t('services.ivInfusion.description'),
      alt: 'IV drip therapy Prague - nurse administering IV infusion at home',
      href: `${langPrefix}/iv-drip-therapy-prague`
    },
    {
      image: injectionIcon,
      title: t('services.injection.title'),
      description: t('services.injection.description'),
      alt: 'Home nurse Prague providing injections - IVF, insulin, antibiotics',
      href: `${langPrefix}/ivf-injection-support-prague`
    },
    {
      image: woundCareIcon,
      title: t('services.woundCare.title'),
      description: t('services.woundCare.description'),
      alt: 'Wound care and bandage service Prague - post-surgery nursing care',
      href: `${langPrefix}/post-surgery-recovery-care-prague`
    },
    {
      image: hygieneIcon,
      title: t('services.hygiene.title'),
      description: t('services.hygiene.description'),
      alt: 'Hygiene assistance Prague - daily care for elderly and disabled patients',
      href: `${langPrefix}/disabled-daily-care-prague`
    },
    {
      image: escortIcon,
      title: t('services.escort.title'),
      description: t('services.escort.description'),
      alt: 'Hospital escort service Prague - nurse accompanying patients to medical appointments',
      href: `${langPrefix}/post-surgery-recovery-care-prague`
    },
    {
      image: massageIcon,
      title: t('services.massage.title'),
      description: t('services.massage.description'),
      alt: 'Therapeutic massage Prague - medical massage for pain relief at home',
      href: `${langPrefix}/#services`
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
            <Link key={index} to={service.href}>
              <Card
                className="p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-slide-up group h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                 <div className="mb-4 flex justify-center">
                  <div className="h-32 w-32 flex items-center justify-center">
                    <img 
                      src={service.image} 
                      alt={service.alt}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      decoding="async"
                      width="128"
                      height="128"
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
