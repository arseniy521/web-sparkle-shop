import { Card } from "@/components/ui/card";
import ivDripIcon from "@/assets/drp.png";
import injectionIcon from "@/assets/drp.png";
import woundCareIcon from "@/assets/WoundDressingBandage.png";
import hygieneIcon from "@/assets/HygieneAssistance.png";
import escortIcon from "@/assets/escort.png";
import massageIcon from "@/assets/massage.png";

const services = [
  {
    image: ivDripIcon,
    title: "IV Infusion",
    description:
      "💡 For hydration, vitamin therapy, or prescribed IV treatments. 👉 Nurse-administered IV with monitoring at your home or hotel.",
  },
  {
    image: ivDripIcon,
    title: "Injection",
    description:
      "💡 For IVF, antibiotics, insulin, or vitamin therapy. 👉 Timely, precise administration of prescribed injections.",
  },
  {
    image: woundCareIcon,
    title: "Wound Dressing & Bandage",
    description:
      "💡 For patients recovering from surgery or injuries. 👉 Sterile dressing change, wound cleaning, and infection check.",
  },
  {
    image: hygieneIcon,
    title: "Hygiene Assistance",
    description:
      "💡 For elderly or disabled clients needing daily care. 👉 Gentle support with personal hygiene and comfort.",
  },
  {
    image: escortIcon,
    title: "Escort to/from Hospital",
    description:
      "💡 For patients needing support during travel or hospital visits. 👉 Nurse escort with mobility help and translation.",
  },
  {
    image: massageIcon,
    title: "Therapeutic Massage",
    description:
      "💡 For clients with pain, swelling, or limited mobility. 👉 Medical massage to relieve pain and improve circulation.",
  },
];

export const Services = () => {
  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground">
            We provide professional home healthcare services tailored to your needs. All services are performed by qualified nurses with proper medical oversight.
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
