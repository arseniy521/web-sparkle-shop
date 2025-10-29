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
    "name": t('schema.businessName'),
    "alternateName": [t('schema.services.homeNurse.alternateName'), t('schema.services.ivDrip.alternateName')],
    "legalName": t('schema.businessLegalName'),
    "url": "https://www.nius.cz/",
    "description": t('schema.businessDescription'),
    "slogan": t('schema.businessSlogan'),
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Prague City Center",
      "addressLocality": t('schema.areaServed'),
      "addressRegion": t('schema.areaServed'),
      "addressCountry": "CZ",
      "postalCode": "110 00"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": t('schema.areaServed'),
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
        "name": t('schema.bookingAction')
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
            "name": t('schema.services.ivDrip.name'),
            "alternateName": t('schema.services.ivDrip.alternateName'),
            "description": t('schema.services.ivDrip.description'),
            "serviceType": t('schema.services.ivDrip.type'),
            "areaServed": "Prague and surrounding areas"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": t('schema.services.homeNurse.name'),
            "alternateName": t('schema.services.homeNurse.alternateName'),
            "description": t('schema.services.homeNurse.description'),
            "serviceType": t('schema.services.homeNurse.type'),
            "areaServed": "Prague 1-10, Vinohrady, Old Town"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": t('schema.services.ivf.name'),
            "description": t('schema.services.ivf.description')
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": t('schema.services.postSurgery.name'),
            "description": t('schema.services.postSurgery.description')
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
