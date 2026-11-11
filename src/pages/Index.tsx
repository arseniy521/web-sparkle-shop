import { lazy, Suspense } from "react";
import { NavBar } from "@/components/NavBar";
import { HeroNew } from "@/components/HeroNew";
import { TrustStrip } from "@/components/TrustStrip";
import { MenuSection, BundlesSection, SubscriptionSection } from "@/components/MenuSection";
import { MobileStickyBar } from "@/components/MobileStickyBar";
import { WhoWeServe } from "@/components/WhoWeServe";
import { HowItWorks } from "@/components/HowItWorks";
import { OurNurses } from "@/components/OurNurses";
import { FooterNew } from "@/components/FooterNew";
import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";
import { GOOGLE_RATING } from "@/constants/reviews";

const TestimonialsNew = lazy(() => import("@/components/TestimonialsNew").then(m => ({ default: m.TestimonialsNew })));
const ServiceArea = lazy(() => import("@/components/ServiceArea").then(m => ({ default: m.ServiceArea })));
const FinalCTA = lazy(() => import("@/components/FinalCTA").then(m => ({ default: m.FinalCTA })));
const FAQNew = lazy(() => import("@/components/FAQNew").then(m => ({ default: m.FAQNew })));

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
      "addressLocality": "Praha",
      "addressCountry": "CZ"
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
    "email": "info@nius.cz",
    "priceRange": "1650-4550 CZK",
    "currenciesAccepted": "CZK, EUR",
    "paymentAccepted": ["Cash", "Bank Transfer", "Card"],
    "openingHours": "Mo-Su 08:00-21:00",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "08:00",
      "closes": "21:00"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": GOOGLE_RATING.ratingValue,
      "reviewCount": GOOGLE_RATING.reviewCount,
      "bestRating": GOOGLE_RATING.bestRating,
      "worstRating": GOOGLE_RATING.worstRating
    },
    "availableLanguage": ["en", "cs", "ru", "uk"],
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

  const faqItems = t('faqNew.items', { returnObjects: true }) as Array<{ q: string; a: string }>;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": Array.isArray(faqItems) ? faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.q ? item.a : '' }
    })) : []
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "IV Drip Services Prague",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "item": { "@type": "Service", "name": "Immunity Lite", "description": "Vitamins and fluids IV drip", "offers": { "@type": "Offer", "price": "2900", "priceCurrency": "CZK" } } },
      { "@type": "ListItem", "position": 2, "item": { "@type": "Service", "name": "Immunity Power", "description": "Vitamin C and fluids IV drip", "offers": { "@type": "Offer", "price": "3250", "priceCurrency": "CZK" } } },
      { "@type": "ListItem", "position": 3, "item": { "@type": "Service", "name": "Vitamin & Mineral Classic", "description": "Vitamins, minerals and fluids IV drip", "offers": { "@type": "Offer", "price": "3750", "priceCurrency": "CZK" } } },
      { "@type": "ListItem", "position": 4, "item": { "@type": "Service", "name": "Vitamin & Mineral Plus", "description": "Extended vitamin and mineral IV drip", "offers": { "@type": "Offer", "price": "4350", "priceCurrency": "CZK" } } },
      { "@type": "ListItem", "position": 5, "item": { "@type": "Service", "name": "CEO Recharge", "description": "Vitamins, minerals and fluids IV drip", "offers": { "@type": "Offer", "price": "4550", "priceCurrency": "CZK" } } },
      { "@type": "ListItem", "position": 6, "item": { "@type": "Service", "name": "Pure Hydrate", "description": "Hydration IV drip", "offers": { "@type": "Offer", "price": "2550", "priceCurrency": "CZK" } } }
    ]
  };

  const schemaArray = [
    enhancedSchema,
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Nurse in Prague",
      "legalName": "Nius Services s.r.o.",
      "url": "https://www.nius.cz/",
      "logo": "https://www.nius.cz/brand/logo-mark-dark.svg",
      "foundingDate": "2024",
      "founders": [{ "@type": "Person", "name": "Nigina Jebrak" }],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Prague",
        "addressCountry": "CZ"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+420773629123",
        "contactType": "customer service",
        "availableLanguage": ["English", "Czech", "Russian", "Ukrainian"],
        "areaServed": "Prague"
      },
      "sameAs": [
        "https://www.instagram.com/nius.prague/",
        "https://t.me/nius_prague",
        "https://g.page/r/Cb4BmqPTZRSSEBE"
      ]
    },
    faqSchema,
    serviceSchema
  ];

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <SEO
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        ogImage="https://www.nius.cz/og-image.jpg"
        schema={schemaArray}
        keywords={t('seo.home.keywords')}
      />
      <NavBar />
      <main role="main" id="main-content">
        <HeroNew />
        <TrustStrip />
        <MenuSection />
        <WhoWeServe />
        <HowItWorks />
        <OurNurses />
        <BundlesSection />
        <SubscriptionSection />
        <Suspense fallback={null}>
          <TestimonialsNew />
          <ServiceArea />
          <FinalCTA />
          <FAQNew />
        </Suspense>
        <MobileStickyBar />
      </main>
      <FooterNew />
    </div>
  );
};

export default Index;
