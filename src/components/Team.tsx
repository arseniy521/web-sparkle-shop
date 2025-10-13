import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import milanImage from "@/assets/milan.jpg";
import niginImage from "@/assets/nigin.jpg";
import ivanaImage from "@/assets/ivana.jpg";

const nurses = [
  { key: "nigina", image: niginImage },
  { key: "jana", image: ivanaImage },
  { key: "tomas", image: milanImage },
];

export const Team = () => {
  const { t } = useTranslation();

  return (
    <section id="team" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            {t('team.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('team.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nurses.map((nurse, index) => (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={nurse.image}
                  alt={`${t(`team.members.${nurse.key}.name`)} - ${t(`team.members.${nurse.key}.role`)}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-secondary">
                    {t(`team.members.${nurse.key}.name`)}
                  </h3>
                  <p className="text-primary font-medium">{t(`team.members.${nurse.key}.role`)}</p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`team.members.${nurse.key}.description`)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
