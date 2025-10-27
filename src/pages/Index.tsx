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
import { SEO } from "@/components/SEO";

const Index = () => {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://www.nius.cz/#localbusiness",
      "name": "Nurse in Prague",
      "alternateName": ["IV Drip Prague", "Home Healthcare Prague", "Mobile Nurse Prague"],
      "legalName": "Nius Services s.r.o.",
      "url": "https://www.nius.cz/",
      "description": "Professional nurse in Prague providing IV drip therapy, injections, wound care, and home healthcare services. Fast, reliable medical care at your location within Prague.",
      "slogan": "Professional Nurse in Prague - IV Drip Therapy & Home Healthcare",
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
      },
      "areaServed": {
        "@type": "City",
        "name": "Prague"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "IV Drip Therapy Prague",
      "provider": {
        "@type": "LocalBusiness",
        "@id": "https://www.nius.cz/#localbusiness"
      },
      "areaServed": {
        "@type": "City",
        "name": "Prague"
      },
      "offers": {
        "@type": "Offer",
        "priceRange": "699-1499 CZK",
        "priceCurrency": "CZK"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Home Nursing Care Prague",
      "provider": {
        "@type": "LocalBusiness",
        "@id": "https://www.nius.cz/#localbusiness"
      },
      "areaServed": {
        "@type": "City",
        "name": "Prague"
      }
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title="Nurse in Prague | IV Drip Therapy & Home Healthcare Services"
        description="Professional nurse in Prague offering IV drip therapy, vitamin infusions, injections, and home healthcare. Fast service within Prague. Book your nurse today!"
        canonical="https://www.nius.cz/"
        schema={schema}
      />
      <Header />
      <main role="main">
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
    </div>
  );
};

export default Index;
