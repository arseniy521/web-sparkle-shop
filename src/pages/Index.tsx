import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Workflow } from "@/components/Workflow";
import { Benefits } from "@/components/Benefits";
import { Team } from "@/components/Team";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { Location } from "@/components/Location";
import { Contacts } from "@/components/Contacts";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StickyBookNow } from "@/components/StickyBookNow";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main>
        <Hero />
        <Services />
        <Workflow />
        <Benefits />
        <Team />
        <Pricing />
        <Testimonials />
        <Location />
        <Contacts />
        <FAQ />
      </main>
      <Footer />
      <StickyBookNow />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "Nurse in Prague",
          "alternateName": "Home Healthcare Prague",
          "legalName": "Nius Services s.r.o.",
          "url": "https://www.nius.cz/en/",
          "description": "Professional home healthcare services in Prague: IV infusions, injections, wound care and nursing services directly at your home.",
          "slogan": "Fast, reliable and professional healthcare in the comfort of your home",
          "foundingDate": "2024",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Prague",
            "addressRegion": "Prague",
            "addressCountry": "CZ",
            "postalCode": "110 00"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 50.0755,
            "longitude": 14.4378
          },
          "telephone": "+420773629123",
          "email": "sestranahodinu@gmail.com",
          "priceRange": "699-1499 CZK",
          "currenciesAccepted": "CZK",
          "paymentAccepted": ["Cash", "Bank Transfer", "Card"],
          "openingHours": "Mo-Su 08:00-20:00",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "47",
            "bestRating": "5",
            "worstRating": "1"
          }
        })
      }} />
    </div>
  );
};

export default Index;
