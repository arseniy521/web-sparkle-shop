import { Header } from "@/components/Header";
import { BookingLink } from '@/components/BookingLink';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedServices } from "@/components/RelatedServices";
import { StickyBookNow } from "@/components/StickyBookNow";
import { GOOGLE_RATING } from "@/constants/reviews";
import { useLocation, Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Hotel,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Star,
  Syringe,
  UserCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getLanguageFromPath, getLanguagePrefix } from "@/utils/languageUtils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  NIUS_PHONE_E164,
  NIUS_PHONE_WHATSAPP_DIGITS,
  NIUS_SITE_URL,
} from "@/constants/siteContacts";

const phone = NIUS_PHONE_E164;
const whatsappNumber = NIUS_PHONE_WHATSAPP_DIGITS;
const siteUrl = NIUS_SITE_URL;

const whatsappMessage = "Hi, I'd like to book an IV drip at my hotel in Prague.";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const trustBadges: Array<{ label: string; Icon: LucideIcon }> = [
  { label: "Registered Nurses", Icon: Shield },
  { label: `${GOOGLE_RATING.ratingValue}/${GOOGLE_RATING.bestRating} on Google`, Icon: Star },
  { label: "Any Hotel in Prague", Icon: Hotel },
  { label: "Same-Day Visits 8:00–21:00", Icon: Clock },
];

const steps = [
  { title: "Book Online or Call", description: "WhatsApp, phone, or online form. Tell us your hotel and preferred time." },
  { title: "Nurse Visits Your Hotel", description: "Same-day visits, daily 8:00–21:00. We confirm the arrival time after you book." },
  { title: "IV Session (30-60 min)", description: "Relax in your room while the drip runs, with the nurse by your side." },
  { title: "Wrap-Up", description: "The nurse removes the line and answers your questions. No clinic visit needed." },
];

const drips = [
  {
    name: "Pure Hydrate",
    price: "from 2,550 CZK",
    tag: "After Travel",
    description: "Fluids and electrolytes for rehydration after a long flight or a busy day.",
    includes: ["Saline fluids", "Electrolytes", "Vitamins"],
  },
  {
    name: "Immunity Power",
    price: "from 3,250 CZK",
    tag: "Vitamin C",
    description: "Vitamin C and fluids, a classic choice for travellers.",
    includes: ["Vitamin C", "Saline hydration", "B-vitamins"],
  },
  {
    name: "CEO Recharge",
    price: "from 4,550 CZK",
    tag: "Business Trips",
    description: "Vitamins, minerals and fluids for a packed conference or business-trip schedule.",
    includes: ["Magnesium", "B-complex", "Saline base"],
  },
  {
    name: "Jet Lag Recovery",
    price: "from 3,250 CZK",
    tag: "Long-Haul Flights",
    description: "Rehydration with vitamins and electrolytes after a long-haul flight.",
    includes: ["Saline fluids", "Electrolytes", "B-vitamins"],
  },
];

const faqItems = [
  {
    key: "anyHotel",
    question: "Do you come to any hotel in Prague?",
    answer: "Yes. We visit any hotel, hostel, Airbnb or private apartment across Prague.",
  },
  {
    key: "howFast",
    question: "When can a nurse visit?",
    answer: "Same-day visits, daily 8:00–21:00. We confirm the arrival time after you book.",
  },
  {
    key: "reception",
    question: "What about hotel reception / security?",
    answer: "Our nurses carry professional ID and equipment in discreet bags. If your hotel requires advance notice, we can call ahead on your behalf.",
  },
  {
    key: "prescription",
    question: "Do I need a prescription?",
    answer: "Every infusion is prescribed by a doctor after a short health assessment, and the consultation is included in the price.",
  },
];

const seoDescription =
  "IV drip visits to your Prague hotel room: vitamins and hydration from 1,650 CZK, given by registered nurses. Same-day visits, daily 8:00–21:00.";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalBusiness",
      name: "NIUS - IV Drip Hotel Service Prague",
      description: seoDescription,
      url: `${siteUrl}/en/iv-drip-hotel-prague/`,
      image: "https://www.nius.cz/og-image.jpg",
      telephone: phone,
      priceRange: "1650-4550 CZK",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Praha",
        addressCountry: "CZ",
      },
      areaServed: { "@type": "City", name: "Prague" },
      openingHours: "Mo-Su 08:00-21:00",
      medicalSpecialty: ["IV Therapy", "Mobile Nursing", "Hotel Medical Services"],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

const IVDripHotelPrague = () => {
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="IV Drip at Your Hotel in Prague | NIUS"
        description={seoDescription}
        keywords="iv drip hotel prague, iv therapy hotel prague, mobile iv drip prague hotel, nurse to hotel prague, vitamin drip hotel prague"
        ogImage="https://www.nius.cz/og-image.jpg"
        ogType="website"
        schema={schema}
        hreflangLanguages={["en"]}
      />
      <Header />

      <main className="flex-1">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/#services" },
            { label: "IV Drips Prague", href: `${langPrefix}/iv-drips-prague/` },
            { label: "Hotel IV Drip" },
          ]}
        />

        {/* Hero */}
        <section className="py-16 md:py-20 px-4 bg-bone">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8 text-sm">
              {trustBadges.map(({ label, Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>

            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                IV Drip Delivered to Your Hotel Room in Prague
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Registered nurse at your hotel. Same-day visits, daily 8:00–21:00. We confirm the arrival time after you book.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a href={`tel:${phone}`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    Call {phone}
                  </Button>
                </a>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp Booking
                  </Button>
                </a>
                <BookingLink>
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Book Online
                  </Button>
                </BookingLink>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">From booking to wrap-up in 4 simple steps</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <Card key={step.title} className="p-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Hotel IV Drips */}
        <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Hotel IV Drips</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Popular with tourists and business travellers staying in Prague
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {drips.map((drip) => (
                <Card key={drip.name} className="p-6 flex flex-col">
                  <div className="text-xs font-semibold text-primary mb-3">{drip.tag}</div>
                  <h3 className="text-2xl font-semibold mb-2">{drip.name}</h3>
                  <div className="text-3xl font-bold mb-2">{drip.price}</div>
                  <p className="text-sm text-muted-foreground mb-4">{drip.description}</p>
                  <div className="space-y-2 mb-6 flex-1">
                    {drip.includes.map((item) => (
                      <div key={item} className="flex gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to book the ${drip.name} IV drip at my hotel in Prague.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">Book via WhatsApp</Button>
                  </a>
                </Card>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-6">
              <Link to={`${langPrefix}/iv-drips-prague/`} className="underline hover:text-primary">
                View full IV drip menu
              </Link>{" "}
              with current prices.
            </p>
          </div>
        </section>

        {/* Any hotel */}
        <section className="py-16 md:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Any Hotel in Prague</h2>
              <p className="text-muted-foreground mb-4">
                We visit guests at any hotel in Prague, as well as <strong>Airbnbs, hostels and private apartments</strong>. If you have an address, we'll come to you.
              </p>
              <p className="text-sm text-muted-foreground">
                Same-day visits, daily 8:00–21:00. We confirm the arrival time after you book.
              </p>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">Answers about hotel IV drip visits in Prague</p>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item) => (
                <AccordionItem key={item.key} value={`faq-${item.key}`} className="border rounded-lg px-5">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay in Your Hotel Room. We Come to You.
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Same-day visits, daily 8:00–21:00. We confirm the arrival time after you book.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`tel:${phone}`}>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Phone className="mr-2 h-5 w-5" />
                  Call {phone}
                </Button>
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Booking
                </Button>
              </a>
              <BookingLink>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Book Online
                </Button>
              </BookingLink>
            </div>
            <p className="text-sm opacity-80 mt-6">
              Registered nurses. Discreet service. NIUS is not an emergency service: call 155/112.
            </p>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-5xl">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">Explore More IV Drip Services</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Looking for something specific? Check out our full range of IV therapy services in Prague.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to={`${langPrefix}/iv-drips-prague/`}>
                  <Button variant="outline" size="sm">All IV Drips in Prague</Button>
                </Link>
                <Link to={`${langPrefix}/rehydration-iv-drip-prague/`}>
                  <Button variant="outline" size="sm">Rehydration IV Drip</Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        <RelatedServices />
      </main>

      <Footer />
      <StickyBookNow />
    </div>
  );
};

export default IVDripHotelPrague;
