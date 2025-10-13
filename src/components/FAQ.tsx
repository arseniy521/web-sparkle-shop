import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const faqKeys = [
  {
    question: "How can I book a nurse?",
    answer:
      "You can book a nurse through several methods: by filling out the online booking form, calling us at +420 773 629 123, via email at sestranahodinu@gmail.com, or through WhatsApp/Telegram. After booking, we will contact you to confirm the appointment time.",
  },
  {
    question: "How quickly can a nurse arrive?",
    answer:
      "We strive to provide care as quickly as possible. Depending on your location in Prague and current nurse availability, we can typically arrive within 2-3 hours of confirming your booking. For planned visits, we recommend booking a nurse at least one day in advance.",
  },
  {
    question: "Do you visit hotels and Airbnb accommodations?",
    answer:
      "Yes! We regularly visit international patients staying in hotels, Airbnb, and short-term rentals throughout Prague. This is especially common for IVF patients and medical tourists needing post-surgery care. Just provide your accommodation address when booking.",
  },
  {
    question: "Do you work with IVF patients and fertility clinics?",
    answer:
      "Absolutely. We have extensive experience with IVF patients, including time-sensitive hormone injections and trigger shots. We're familiar with protocols from major Prague fertility clinics like Reprofit, ISCARE, and Gennet. We offer evening and weekend appointments for precise timing requirements.",
  },
  {
    question: "Can you help with post-surgery recovery for medical tourists?",
    answer:
      "Yes, this is one of our specialties. We provide wound care, bandage changes, drain management, hygiene assistance, and escort services for patients recovering from plastic surgery, dental procedures, or other medical treatments in Prague. We understand the unique needs of international patients.",
  },
  {
    question: "Do I need a medical prescription for IV therapy?",
    answer:
      "Yes, prescribed IV therapies require a medical prescription. Our nurses can only administer medications prescribed by a doctor. If you're interested in vitamin or hydration IVs, these can be administered without a prescription as they are considered dietary supplements.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash (CZK or EUR), bank transfers, and card payments. Payment is collected after service. For package deals and subscription services, we can invoice monthly. Most insurance companies do not cover home nursing, but we provide receipts for potential reimbursement.",
  },
  {
    question: "Do you provide services outside of Prague?",
    answer:
      "We primarily operate in Prague, but we can provide services in the surrounding areas (up to 30 km) by individual arrangement. For travel outside Prague, we charge an additional fee of 10 CZK/km above the base rate.",
  },
  {
    question: "What are your operating hours?",
    answer:
      "We are available 7 days a week from 8:00 AM to 10:00 PM. For urgent cases and IVF injections requiring specific timing, we also offer evening/night visits by arrangement. Call +420 773 629 123 anytime for 24/7 booking.",
  },
  {
    question: "Do you offer long-term care for disabled patients?",
    answer:
      "Yes, we provide daily assistance care for disabled and chronic patients, including hygiene support, medication administration, mobility assistance, and companionship. We offer flexible subscription packages for ongoing care needs.",
  },
  {
    question: "Are your services covered by insurance?",
    answer:
      "Currently, our services are not covered by health insurance. This is a direct payment by the client. Upon request, we will issue a receipt for payment that you can use for possible claims with your insurance company if you have additional insurance for premium healthcare.",
  },
  {
    question: "Do I need to prepare anything before the nurse arrives?",
    answer:
      "For the smoothest possible visit, we recommend: having your medical prescription ready (if required), ensuring a calm and clean space for the procedure, informing us in advance about your health condition and any allergies, and having your doctor's contact information handy.",
  },
];

export const FAQ = () => {
  const { t } = useTranslation();
  
  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('faq.description')}
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4 animate-slide-up">
            {faqKeys.map((key, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-2xl px-6 border-0 shadow-sm hover:shadow-card transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-secondary hover:text-primary">
                  {t(`faq.items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {t(`faq.items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
