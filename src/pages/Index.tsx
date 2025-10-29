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
    "alternateName": ["Home Healthcare Prague", "IV Drips Prague", "Sestřička Praha"],
    "legalName": "Nius Services s.r.o.",
    "url": "https://www.nius.cz/",
    "description": "Professional home healthcare services in Prague: IV drip therapy, IV drips, IV infusions, injections, wound care and nursing services directly at your home or hotel throughout Prague.",
    "slogan": "Fast, reliable and professional healthcare in the comfort of your home",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Prague City Center",
      "addressLocality": "Prague",
      "addressRegion": "Prague",
      "addressCountry": "CZ",
      "postalCode": "110 00"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Prague",
        "containsPlace": [
          {"@type": "Place", "name": "Prague 1"},
          {"@type": "Place", "name": "Prague 2"},
          {"@type": "Place", "name": "Prague 3"},
          {"@type": "Place", "name": "Prague 4"},
          {"@type": "Place", "name": "Prague 5"},
          {"@type": "Place", "name": "Prague 6"},
          {"@type": "Place", "name": "Prague 7"},
          {"@type": "Place", "name": "Prague 8"},
          {"@type": "Place", "name": "Prague 9"},
          {"@type": "Place", "name": "Prague 10"},
          {"@type": "Place", "name": "Vinohrady"},
          {"@type": "Place", "name": "Žižkov"},
          {"@type": "Place", "name": "Old Town Prague"},
          {"@type": "Place", "name": "New Town Prague"}
        ]
      }
    ],
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 50.0755,
      "longitude": 14.4378
    },
    "telephone": "+420773629123",
    "email": "nius.prague@gmail.com",
    "priceRange": "699-2000 CZK",
    "currenciesAccepted": "CZK, EUR",
    "paymentAccepted": ["Cash", "Bank Transfer", "Card"],
    "openingHours": "Mo-Su 08:00-22:00",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "52",
      "bestRating": "5",
      "worstRating": "4"
    },
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.nius.cz/#contacts",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "Reservation",
        "name": "Book Nurse Service"
      }
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
            "alternateName": "IV Drips Prague",
            "description": "Professional IV drip therapy and vitamin infusions at your Prague location - hotels, homes, Airbnb",
            "serviceType": "IV Drips Prague",
            "areaServed": "Prague and surrounding areas"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Home Nurse Prague",
            "alternateName": "Sestřička Praha",
            "description": "Professional nursing care at your home or hotel in Prague - English and Czech speaking nurses",
            "serviceType": "Home Nurse Prague",
            "areaServed": "Prague 1-10, Vinohrady, Old Town"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "IVF Injection Support",
            "description": "Specialized IVF medication administration for fertility patients at Prague hotels"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Post-Surgery Recovery Care",
            "description": "Professional post-operative care for medical tourists in Prague"
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
        keywords={t('seo.home.keywords')}
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
