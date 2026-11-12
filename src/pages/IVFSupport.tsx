import { Link, useLocation } from "react-router-dom";
import { BookingLink } from '@/components/BookingLink';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Clock, Shield, Phone, Check, Star, Heart, MessageCircle, CheckCircle2, Mail, Syringe } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { RelatedServices } from "@/components/RelatedServices";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ivDripIcon from "@/assets/drp-2.webp";
import { useTranslation } from "react-i18next";
import { getIvDripsUrl, getLanguagePrefix, getLanguageFromPath } from "@/utils/languageUtils";

const IVFSupport = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  const phone = "+420773629123";
  const whatsappMessages: Record<string, string> = {
    cs: "Dobrý den! Potřebuji podporu s IVF injekcemi v Praze.",
    en: "Hi! I need IVF injection support in Prague.",
    ru: "Здравствуйте! Мне нужна поддержка с инъекциями ЭКО в Праге.",
    uk: "Доброго дня! Мені потрібна підтримка з ін'єкціями ЕКЗ у Празі.",
  };
  const whatsappLink = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    whatsappMessages[currentLang] || whatsappMessages.en
  )}`;

  // Hreflang map for SEO
  const hreflangMap: Record<string, string> = {
    cs: "https://www.nius.cz/ivf-support-prague/",
    en: "https://www.nius.cz/en/ivf-support-prague/",
    ru: "https://www.nius.cz/ru/ivf-support-prague/",
    uk: "https://www.nius.cz/uk/ivf-support-prague/",
  };

  // Data from translations
  const faqItems = t('ivfSupport.faq.items', { returnObjects: true }) as { question: string; answer: string }[];
  const testimonialItems = t('ivfSupport.testimonials.items', { returnObjects: true }) as { text: string; author: string; context: string }[];
  const includedItems = t('ivfSupport.included.items', { returnObjects: true }) as string[];

  // Why Matters keyed items
  const whyMattersKeys = ['timing', 'expertise', 'comfort', 'safety'] as const;
  const whyMattersIcons = { timing: Clock, expertise: Syringe, comfort: Heart, safety: Shield };

  // Service keys
  const serviceKeys = ['medication', 'wellness'] as const;

  // Experience steps
  const experienceSteps = ['step1', 'step2', 'step3', 'step4'] as const;

  // Schema markup (JSON-LD array)
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": "IVF Support Prague | Nurse in Prague",
      "description": t('ivfSupport.seo.description'),
      "url": "https://www.nius.cz/ivf-support-prague/",
      "telephone": "+420773629123",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Praha",
        "addressCountry": "CZ"
      },
      "areaServed": { "@type": "City", "name": "Prague" },
      "priceRange": "1650-4550 CZK",
      "availableLanguage": ["en", "cs", "ru", "uk"],
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "50.0755",
        "longitude": "14.4378"
      },
      "image": "https://www.nius.cz/og-ivf.jpg",
      "openingHours": "Mo-Su 08:00-21:00",
      "availableService": [
        {
          "@type": "Service",
          "name": "IVF Injection Administration",
          "description": "We administer medication prescribed by your clinic, following their written instructions.",
          "serviceType": "Home Healthcare"
        },
        {
          "@type": "Service",
          "name": "Vitamins and Hydration IV Drips",
          "description": "Every infusion is prescribed by a doctor after a short health assessment, and the consultation is included in the price."
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "IVF Support Prague",
      "provider": { "@type": "MedicalBusiness", "name": "NIUS (Nurse in Prague)" },
      "areaServed": { "@type": "City", "name": "Prague" },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "IVF Support Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": { "@type": "Service", "name": "IVF Injection Administration, Single Visit" },
            "price": "1900",
            "priceCurrency": "CZK"
          }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `https://www.nius.cz${langPrefix || '/'}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": t('ivfSupport.breadcrumb'),
          "item": `https://www.nius.cz${langPrefix}/ivf-support-prague/`
        }
      ]
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title={t('ivfSupport.seo.title')}
        description={t('ivfSupport.seo.description')}
        keywords={t('ivfSupport.seo.keywords')}
        ogImage="https://www.nius.cz/og-ivf.jpg"
        schema={schema}
        hreflangOverrides={hreflangMap}
        hreflangLanguages={["cs", "en", "ru", "uk"]}
      />
      <Header />
      <Breadcrumbs items={[
        { label: "Services", href: "/#services" },
        { label: t('ivfSupport.breadcrumb') }
      ]} />
      <main className="flex-1" role="main">

        {/* ========== SECTION 1: HERO ========== */}
        <section className="py-20 bg-bone">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {/* Trust Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo/20 rounded-full text-xs font-medium text-indigo">
                    <Shield className="h-3.5 w-3.5" />
                    {t('ivfSupport.trustBadges.nurses')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo/20 rounded-full text-xs font-medium text-indigo">
                    <Star className="h-3.5 w-3.5 fill-indigo text-indigo" />
                    {t('ivfSupport.trustBadges.rating')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo/20 rounded-full text-xs font-medium text-indigo">
                    <Clock className="h-3.5 w-3.5" />
                    {t('ivfSupport.trustBadges.available')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo/20 rounded-full text-xs font-medium text-indigo">
                    <Heart className="h-3.5 w-3.5" />
                    {t('ivfSupport.trustBadges.patients')}
                  </span>
                </div>

                <div className="inline-block px-4 py-2 bg-bone text-indigo rounded-full text-sm font-medium">
                  {t('ivfSupport.badge')}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight">
                  {t('ivfSupport.title')}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t('ivfSupport.description')}
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
                  <BookingLink>
                    <Button size="lg" className="w-full sm:w-auto group">
                      {t('ivfSupport.bookNow')}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </BookingLink>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo/20 text-indigo hover:bg-bone">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {t('ivfSupport.whatsapp')}
                    </Button>
                  </a>
                  <a href={`tel:${phone}`}>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo/20 text-indigo hover:bg-bone">
                      <Phone className="mr-2 h-5 w-5" />
                      {t('ivfSupport.call247')}
                    </Button>
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-xl overflow-hidden shadow-card bg-white p-8">
                  <img
                    src={ivDripIcon}
                    alt="IVF support nurse in Prague administering fertility injection"
                    className="w-full h-auto object-contain"
                    loading="eager"
                    fetchPriority="high"
                    width="500"
                    height="500"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 2: WHY IVF SUPPORT MATTERS ========== */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t('ivfSupport.whyMatters.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('ivfSupport.whyMatters.description')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {whyMattersKeys.map((key) => {
                const Icon = whyMattersIcons[key];
                return (
                  <Card key={key} className="p-6 border-indigo/20 hover:border-indigo/20 hover:shadow-lg hover:shadow-indigo/10 transition-all duration-300">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-bone rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-indigo" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-secondary mb-2">
                          {t(`ivfSupport.whyMatters.items.${key}.title`)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t(`ivfSupport.whyMatters.items.${key}.description`)}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========== SECTION 3: SERVICE PACKAGES ========== */}
        <section className="py-16 md:py-20 bg-bone">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('ivfSupport.services.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {serviceKeys.map((key) => {
                const benefits = t(`ivfSupport.services.${key}.benefits`, { returnObjects: true }) as string[];
                const isHighlighted = false;
                return (
                  <Card
                    key={key}
                    className={`p-6 flex flex-col transition-all duration-300 hover:shadow-lg ${isHighlighted ? 'border-indigo/20 border-2 relative hover:shadow-indigo/10' : 'border-indigo/20 hover:border-indigo/20 hover:shadow-indigo/10'}`}
                  >
                    <h3 className="text-xl font-bold text-secondary mb-1">
                      {t(`ivfSupport.services.${key}.name`)}
                    </h3>
                    <p className="text-sm text-indigo font-medium mb-3">
                      {t(`ivfSupport.services.${key}.subtitle`)}
                    </p>
                    <p className="text-muted-foreground text-sm mb-4 flex-1">
                      {t(`ivfSupport.services.${key}.description`)}
                    </p>

                    <div className="space-y-2 mb-6">
                      {benefits.map((benefit, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <Check className="h-4 w-4 text-indigo flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-indigo">
                          {t(`ivfSupport.services.${key}.price`)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {t(`ivfSupport.services.${key}.duration`)}
                        </span>
                      </div>
                      {key === 'wellness' ? (
                        <Link to={getIvDripsUrl(currentLang)}>
                          <Button variant="outline" className="w-full group border-indigo/20 text-indigo hover:bg-bone">
                            {t(`ivfSupport.services.${key}.cta`)}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      ) : (
                        <BookingLink>
                          <Button className="w-full group">
                            {t(`ivfSupport.services.${key}.cta`)}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </BookingLink>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
              {t('ivfSupport.pricing.note')}
            </p>
          </div>
        </section>

        {/* ========== SECTION 4: WHAT'S INCLUDED ========== */}
        <section id="included" className="py-16 md:py-20 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                  {t('ivfSupport.included.title')}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t('ivfSupport.included.subtitle')}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {includedItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-indigo/20">
                    <CheckCircle2 className="h-5 w-5 text-indigo mt-0.5 flex-shrink-0" />
                    <span className="text-secondary font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 5: THE IVF VISIT EXPERIENCE ========== */}
        <section className="py-16 md:py-20 bg-bone">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t('ivfSupport.experience.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('ivfSupport.experience.subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {experienceSteps.map((step, index) => (
                <div key={step} className="bg-bone rounded-xl p-6 border border-indigo/20">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-bone text-indigo flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-secondary">
                      {t(`ivfSupport.experience.steps.${step}.title`)}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm pl-14">
                    {t(`ivfSupport.experience.steps.${step}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SECTION 6: PRICING OVERVIEW ========== */}
        <section id="pricing" className="py-16 md:py-20 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 md:p-12 border-2 border-indigo/20 bg-bone text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
                  {t('ivfSupport.pricingCard.title')}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t('ivfSupport.pricingCard.subtitle')}
                </p>
                <div className="mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-indigo">
                    {t('ivfSupport.pricingCard.price')}
                  </span>
                  <span className="text-2xl font-medium text-indigo ml-2">
                    {t('ivfSupport.pricingCard.currency')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('ivfSupport.pricingCard.perVisit')}
                </p>
                <p className="text-sm font-medium text-green-600 mb-4">
                  {t('ivfSupport.pricingCard.multiVisit')}
                </p>
                <p className="text-xs text-muted-foreground mb-8">
                  {t('ivfSupport.pricingCard.includes')}
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {t('ivfSupport.pricingCard.ctaWhatsApp')}
                    </Button>
                  </a>
                  <a href={`tel:${phone}`}>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo/20 text-indigo hover:bg-bone">
                      <Phone className="mr-2 h-5 w-5" />
                      {t('ivfSupport.pricingCard.ctaCall')}
                    </Button>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ========== SECTION 8: TESTIMONIALS ========== */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('ivfSupport.testimonials.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonialItems.map((item, index) => (
                <Card key={index} className="p-6 border-indigo/20">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{item.text}"</p>
                  <div>
                    <p className="font-semibold text-secondary">{item.author}</p>
                    <p className="text-sm text-muted-foreground">{item.context}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SECTION 9: FAQ ========== */}
        <section className="py-16 md:py-20 bg-bone">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
                {t('ivfSupport.faq.title')}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="bg-white border border-indigo/20 rounded-xl px-6 data-[state=open]:border-indigo/20">
                    <AccordionTrigger className="text-left text-base font-semibold text-secondary hover:text-indigo hover:no-underline py-5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ========== SECTION 10: RELATED SERVICES ========== */}
        <RelatedServices />

        {/* ========== SECTION 11: FINAL CTA ========== */}
        <section className="py-16 md:py-20 bg-bone">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t('ivfSupport.finalCta.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('ivfSupport.finalCta.description')}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 py-6">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t('ivfSupport.finalCta.whatsapp')}
                  </Button>
                </a>
                <a href={`tel:${phone}`}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo/20 text-indigo hover:bg-bone py-6">
                    <Phone className="mr-2 h-5 w-5" />
                    {t('ivfSupport.finalCta.call')}
                  </Button>
                </a>
                <a href="mailto:info@nius.cz">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo/20 text-indigo hover:bg-bone py-6">
                    <Mail className="mr-2 h-5 w-5" />
                    {t('ivfSupport.finalCta.email')}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IVFSupport;
