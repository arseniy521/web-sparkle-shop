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
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  
  const enhancedSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Nurse in Prague",
    "alternateName": "Home Healthcare Prague",
    "legalName": "Nius Services s.r.o.",
    "url": "https://www.nius.cz/",
    "description": "Professional home healthcare services in Prague: IV drip therapy, IV infusions, injections, wound care and nursing services directly at your home.",
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
    "email": "nius.prague@gmail.com",
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
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Nursing Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "IV Drip Therapy Prague",
            "description": "Professional IV drip therapy and vitamin infusions at your Prague location",
            "serviceType": "IV Drip Prague"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Home Nurse Prague",
            "description": "Professional nursing care at your home or hotel in Prague",
            "serviceType": "Nurse in Prague"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "IVF Injection Support",
            "description": "Specialized IVF medication administration for fertility patients"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Post-Surgery Recovery Care",
            "description": "Professional post-operative care for medical tourists"
          }
        }
      ]
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO 
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        canonical="https://www.nius.cz/"
        ogImage="https://www.nius.cz/og-image.jpg"
        schema={enhancedSchema}
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
