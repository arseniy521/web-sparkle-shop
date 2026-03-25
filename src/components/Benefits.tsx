import { Home, Clock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export const Benefits = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Home,
      title: t('benefits.benefit4.title'),
      description: t('benefits.benefit4.description'),
    },
    {
      icon: Clock,
      title: t('benefits.benefit2.title'),
      description: t('benefits.benefit2.description'),
    },
    {
      icon: ShieldCheck,
      title: t('benefits.benefit1.title'),
      description: t('benefits.benefit1.description'),
    },
  ];

  return (
    <section id="why-us" className="py-20 bg-accent/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          {t('benefits.title')}
        </h2>
        <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('benefits.description')}
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
              <benefit.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-2xl font-semibold mb-4">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
