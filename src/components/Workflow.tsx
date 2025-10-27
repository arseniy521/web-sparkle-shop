import { Card } from "@/components/ui/card";
import { PhoneCall, Calendar, Home } from "lucide-react";
import workflowImage from "@/assets/workflow1.png";
import { useTranslation } from "react-i18next";

export const Workflow = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      icon: PhoneCall,
      title: t('workflow.step1.title'),
      description: t('workflow.step1.description'),
    },
    {
      icon: Calendar,
      title: t('workflow.step2.title'),
      description: t('workflow.step2.description'),
    },
    {
      icon: Home,
      title: t('workflow.step3.title'),
      description: t('workflow.step3.description'),
    },
  ];

  return (
    <section id="workflow" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            {t('workflow.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('workflow.description')}
          </p>
        </div>

        <div className="mb-12 animate-fade-in">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-card p-8">
            <img
              src={workflowImage}
              alt="Step-by-step workflow diagram showing our home nursing service process"
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary to-primary/20" />
          
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative p-8 text-center hover:shadow-card transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>

              <div className="mb-6 flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-secondary mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
