import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const pricingData = [
  { key: "imInjection", firstPrice: 1890, addOnPrice: 1700 },
  { key: "vitaminInjection", firstPrice: 1890, addOnPrice: 1700 },
  { key: "vitaminIvDrip", firstPrice: 2190, addOnPrice: 1970 },
  { key: "standardIvDrip", firstPrice: 2380, addOnPrice: 2140 },
  { key: "complexIvDrip", firstPrice: 2680, addOnPrice: 2410 },
  { key: "woundCare", firstPrice: 2190, addOnPrice: 1970 },
  { key: "hygieneAssistance", firstPrice: 2190, addOnPrice: 1970 },
  { key: "nurseEscort", firstPrice: 1900, addOnPrice: 1710 },
  { key: "extra30min", firstPrice: 490, addOnPrice: 440 },
];

export const Pricing = () => {
  const { t } = useTranslation();
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('pricing.description')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('pricing.prescriptionNote')}
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto animate-slide-up">
          <table className="w-full max-w-4xl mx-auto bg-card rounded-2xl shadow-card overflow-hidden">
            <thead>
              <tr className="bg-primary/5">
                <th className="px-6 py-4 text-left font-semibold text-secondary">
                  {t('pricing.table.service')}
                </th>
                <th className="px-6 py-4 text-center font-semibold text-secondary">
                  {t('pricing.table.singleVisit')}
                </th>
                <th className="px-6 py-4 text-center font-semibold text-secondary">
                  {t('pricing.table.multipleVisits')}
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingData.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground">
                        {t(`pricing.items.${item.key}.name`)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t(`pricing.items.${item.key}.example`)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-lg text-foreground">
                      {item.firstPrice} CZK
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-semibold text-lg text-foreground">
                        {item.addOnPrice} CZK
                      </span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        10% off
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 animate-slide-up">
          {pricingData.map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl shadow-card p-6 space-y-4"
            >
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-1">
                  {t(`pricing.items.${item.key}.name`)}
                </h3>
                <p className="text-sm text-muted-foreground">{t(`pricing.items.${item.key}.example`)}</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {t('pricing.table.singleVisit')}
                  </div>
                  <div className="font-semibold text-lg text-foreground">
                    {item.firstPrice} CZK
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">
                    {t('pricing.table.multipleVisits')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-foreground">
                      {item.addOnPrice} CZK
                    </span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      10% off
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#services">
            <Button size="lg" variant="outline">
              {t('pricing.learnMore')}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};
