import { Card } from "@/components/ui/card";
import { Phone, Mail, Instagram, MessageCircle, Send } from "lucide-react";

const contactMethods = [
  {
    icon: Phone,
    title: "Phone",
    value: "+420 773 629 123",
    href: "tel:+420773629123",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+420 773 629 123",
    href: "https://wa.me/420773629123",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: Send,
    title: "Telegram",
    value: "@sestra_na_hodinu",
    href: "https://t.me/sestra_na_hodinu",
    color: "bg-sky-500/10 text-sky-600",
  },
  {
    icon: Instagram,
    title: "Instagram",
    value: "@sestra_na_hodinu",
    href: "https://www.instagram.com/sestra_na_hodinu/",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: Mail,
    title: "Email",
    value: "sestranahodinu@gmail.com",
    href: "mailto:sestranahodinu@gmail.com",
    color: "bg-purple-500/10 text-purple-600",
  },
];

export const Contacts = () => {
  return (
    <section id="contacts" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Contact Us
            </h2>
            <p className="text-lg text-muted-foreground">
              We are available 7 days a week. Reach out in any way that suits you best.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block"
              >
                <Card className="p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl ${method.color} flex items-center justify-center`}>
                      <method.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary mb-1">
                        {method.title}
                      </h3>
                      <p className="text-sm text-muted-foreground break-all">
                        {method.value}
                      </p>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/10 text-center animate-fade-in">
            <p className="text-lg text-foreground">
              <strong>Available:</strong> 7 days a week, 8:00 AM - 10:00 PM
            </p>
            <p className="text-muted-foreground mt-2">
              For urgent cases outside standard hours, please call directly
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
