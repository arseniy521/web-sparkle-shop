import { Card } from "@/components/ui/card";
import milanImage from "@/assets/milan.jpg";
import niginImage from "@/assets/nigin.jpg";

const nurses = [
  {
    name: "Nigina Jebrak",
    role: "Managing Nurse",
    image: niginImage,
    description:
      "With unwavering dedication to patient care, Nigina stands as our most senior nurse, celebrated for her clinical acumen and visionary leadership.",
  },
  {
    name: "Jana Králová",
    role: "Internal Medicine Nurse",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070",
    description:
      "She spent 10 years working in internal medicine at Thomayer Hospital, where she gained deep knowledge in managing chronic and acute conditions.",
  },
  {
    name: "Tomáš Dvořák",
    role: "Emergency Nurse",
    image: milanImage,
    description:
      "An experienced nurse with a strong background in emergency care. He worked for 8 years in emergency departments, handling critical situations with precision.",
  },
];

export const Team = () => {
  return (
    <section id="nurses" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Meet Our Nurses
          </h2>
          <p className="text-lg text-muted-foreground">
            Our team of professional and experienced nurses is here to provide you with the best care possible.
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
