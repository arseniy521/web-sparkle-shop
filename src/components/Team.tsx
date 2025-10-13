import { Card } from "@/components/ui/card";
import milanImage from "@/assets/milan.jpg";
import niginImage from "@/assets/nigin.jpg";
import ivanaImage from "@/assets/ivana.jpg";
import { useTranslation } from "react-i18next";

export const Team = () => {
  const { t } = useTranslation();
  
  const nurses = [
    {
      name: t('team.nurse1.name'),
      role: t('team.nurse1.role'),
      image: niginImage,
      description: t('team.nurse1.description'),
    },
    {
      name: t('team.nurse2.name'),
      role: t('team.nurse2.role'),
      image: ivanaImage,
      description: t('team.nurse2.description'),
    },
    {
      name: t('team.nurse3.name'),
      role: t('team.nurse3.role'),
      image: milanImage,
      description: t('team.nurse3.description'),
    },
  ];

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
                  alt={`${nurse.name} - ${nurse.role}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-secondary">
                    {nurse.name}
                  </h3>
                  <p className="text-primary font-medium">{nurse.role}</p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {nurse.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
