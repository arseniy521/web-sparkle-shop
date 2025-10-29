import { Card } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLanguagePrefix, getLanguageFromPath } from "@/utils/languageUtils";

interface RelatedService {
  titleKey: string;
  descKey: string;
  href: string;
}

export const RelatedServices = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  const services: RelatedService[] = [
    {
      titleKey: "specializedServices.ivf",
      descKey: "services.injection.description",
      href: `${langPrefix}/ivf-injection-support-prague`
    },
    {
      titleKey: "specializedServices.ivDrip",
      descKey: "services.ivInfusion.description",
      href: `${langPrefix}/iv-drip-therapy-prague`
    },
    {
      titleKey: "specializedServices.postSurgery",
      descKey: "services.woundCare.description",
      href: `${langPrefix}/post-surgery-recovery-care-prague`
    },
    {
      titleKey: "specializedServices.disabled",
      descKey: "services.hygiene.description",
      href: `${langPrefix}/disabled-daily-care-prague`
    }
  ];

  // Filter out current page
  const filteredServices = services.filter(service => !location.pathname.includes(service.href.split('/').pop() || ''));

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-secondary mb-8 text-center">
            {t('nav.services')} - {currentLang === 'cs' ? 'Související služby' : currentLang === 'ru' ? 'Связанные услуги' : currentLang === 'uk' ? 'Пов\'язані послуги' : 'Related Services'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {filteredServices.slice(0, 3).map((service, index) => (
              <Link key={index} to={service.href}>
                <Card className="p-6 hover:shadow-card transition-all hover:-translate-y-1 h-full group">
                  <h3 className="text-xl font-semibold text-secondary mb-3 group-hover:text-primary transition-colors">
                    {t(service.titleKey)}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {t(service.descKey)}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    {currentLang === 'cs' ? 'Zjistit více' : currentLang === 'ru' ? 'Узнать больше' : currentLang === 'uk' ? 'Дізнатися більше' : 'Learn more'}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
