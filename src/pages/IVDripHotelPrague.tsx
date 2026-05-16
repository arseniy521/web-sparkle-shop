import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedServices } from "@/components/RelatedServices";
import { StickyBookNow } from "@/components/StickyBookNow";
import { useTranslation } from "react-i18next";
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
  NIUS_BOOKING_URL,
  NIUS_PHONE_E164,
  NIUS_PHONE_WHATSAPP_DIGITS,
  NIUS_SITE_URL,
} from "@/constants/siteContacts";

const phone = NIUS_PHONE_E164;
const whatsappNumber = NIUS_PHONE_WHATSAPP_DIGITS;
const bookingUrl = NIUS_BOOKING_URL;
const siteUrl = NIUS_SITE_URL;

const whatsappMessage = "Hi, I'd like to book an IV drip at my hotel in Prague.";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const trustBadges: Array<{ label: string; Icon: LucideIcon }> = [
  { label: "Licensed Nurses", Icon: Shield },
  { label: "4.9/5 Rating", Icon: Star },
  { label: "All Prague Hotels", Icon: Hotel },
  { label: "Same-Day Service", Icon: Clock },
];

const steps = [
  { title: "Book Online or Call", description: "WhatsApp, phone, or online form. Tell us your hotel and preferred time." },
  { title: "Nurse Arrives at Hotel", description: "Licensed nurse comes to your room within ~60 minutes with all supplies." },
  { title: "IV Session (30-60 min)", description: "Relax on your bed while the drip does its work. Completely painless." },
  { title: "Feel Better Fast", description: "Most guests feel noticeably better before the session even ends." },
];

const drips = [
  {
    name: "Pure Hydrate",
    price: "2,450 CZK",
    tag: "Jet Lag & Dehydration",
    description: "1L isotonic saline with electrolytes and B-vitamins. Perfect after a long flight.",
    includes: ["1000 ml saline", "Electrolyte complex", "Vitamin B12", "B-complex"],
  },
  {
    name: "Immunity Power",
    price: "3,750 CZK",
    tag: "Travel Sickness",
    description: "High-dose Vitamin C and zinc to fight off colds picked up on planes or in crowds.",
    includes: ["High-dose Vitamin C", "Zinc", "Saline hydration", "B-vitamins", "Antioxidants"],
  },
  {
    name: "CEO Recharge",
    price: "3,950 CZK",
    tag: "Conference & Business Trips",
    description: "Energy, focus, and recovery for executives with packed schedules.",
    includes: ["NAD+ precursors", "Magnesium", "B-complex", "Amino acids", "Saline base"],
  },
  {
    name: "Nausea Relief",
    price: "2,850 CZK",
    tag: "Morning After",
    description: "Anti-nausea medication with hydration. Feel human again in 30 minutes.",
    includes: ["Anti-nausea medication", "1000 ml saline", "Electrolytes", "Vitamin B6"],
  },
];

const hotels = [
  "Four Seasons",
  "Mandarin Oriental",
  "Hilton Prague",
  "InterContinental",
  "Alcron (Radisson)",
  "Carlo IV",
  "Augustine",
  "Grand Mark",
  "MOODs Boutique Hotel",
  "Mosaic House",
];

const faqItems = [
  {
    key: "anyHotel",
    question: "Do you come to any hotel in Prague?",
    answer: "Yes. We serve all hotels, hostels, Airbnbs, and private apartments across Prague 1-10. Whether you're at a five-star on the Vltava or a boutique in Vinohrady, we'll be there.",
  },
  {
    key: "howFast",
    question: "How quickly can a nurse arrive?",
    answer: "Typical arrival time is 45-60 minutes from booking. During peak hours or late evenings, it may take up to 90 minutes. We always confirm an ETA before dispatching.",
  },
  {
    key: "reception",
    question: "What about hotel reception / security?",
    answer: "Our nurses carry professional ID and medical equipment in discreet bags. Most Prague hotels are familiar with mobile medical services. If your hotel requires advance notice, we can call ahead on your behalf.",
  },
  {
    key: "prescription",
    question: "Do I need a prescription?",
    answer: "No prescription is needed for vitamin and hydration drips. Our nurse performs a brief health check before the session. If you have specific medical conditions, let us know when booking so we can advise.",
  },
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalBusiness",
      name: "NIUS - IV Drip Hotel Service Prague",
      description:
        "Professional IV drip service delivered directly to your Prague hotel room. Vitamin C, hydration, immunity & recovery drips from 1,550 CZK. Licensed nurses, same-day booking.",
      url: `${siteUrl}/en/iv-drip-hotel-prague/`,
      image: "https://www.nius.cz/og-image.jpg",
      telephone: phone,
      priceRange: "2450-3950 CZK",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Prague",
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
        title="IV Drip at Your Hotel in Prague | Nurse to Your Room in 60 Min"
        description="Professional IV drip service delivered directly to your Prague hotel room. Vitamin C, hydration, immunity & recovery drips from 1,550 CZK. Licensed nurses, same-day booking."
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
        <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
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
                Licensed nurse at your door in ~60 minutes. No clinic visits needed.
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
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Book Online
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">From booking to feeling better in 4 simple steps</p>
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
                Chosen by tourists and business travellers staying in Prague
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
              for all available treatments and prices.
            </p>
          </div>
        </section>

        {/* Hotels We've Visited */}
        <section className="py-16 md:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Hotels We've Visited</h2>
              <p className="text-muted-foreground mb-6">
                Our nurses regularly deliver IV drips to guests at these Prague hotels (and many more):
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {hotels.map((hotel) => (
                  <div key={hotel} className="flex gap-2 items-center">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">{hotel}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                ...plus <strong>all Airbnbs and private apartments</strong> across Prague. If you have an address, we'll come to you.
              </p>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">Everything you need to know about hotel IV drips in Prague</p>
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
              Feel Better Without Leaving Your Hotel
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Book now and a licensed nurse will be at your door within the hour.
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
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Book Online
                </Button>
              </a>
            </div>
            <p className="text-sm opacity-80 mt-6">
              Licensed medical professionals. Discreet service. No clinic visits required.
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
                <Link to={`${langPrefix}/hangover-iv-drip-prague/`}>
                  <Button variant="outline" size="sm">Hangover IV Drip</Button>
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
