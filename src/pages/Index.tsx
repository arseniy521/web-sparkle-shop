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
  const { t, i18n } = useTranslation();
  
  const getCanonicalUrl = () => {
    const lang = i18n.language;
    const baseUrl = "https://www.nius.cz";
    return lang === "en" ? `${baseUrl}/en/` : `${baseUrl}/${lang}/`;
  };

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://www.nius.cz/#organization",
      "name": "Nurse in Prague",
      "alternateName": "Home Healthcare Prague",
      "legalName": "Nius Services s.r.o.",
      "url": "https://www.nius.cz/en/",
      "description": t('seo.home.description'),
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
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "IV Drip Therapy Prague",
      "provider": {
        "@id": "https://www.nius.cz/#organization"
      },
      "areaServed": {
        "@type": "City",
        "name": "Prague"
      },
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://www.nius.cz/en/",
        "servicePhone": "+420773629123"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Home Nursing Care Prague",
      "provider": {
        "@id": "https://www.nius.cz/#organization"
      },
      "areaServed": {
        "@type": "City",
        "name": "Prague"
      },
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://www.nius.cz/en/",
        "servicePhone": "+420773629123"
      }
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO 
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        canonical={getCanonicalUrl()}
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
