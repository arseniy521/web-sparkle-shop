import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Clock, Shield, Phone, Check, Star, Heart, MessageCircle } from "lucide-react";
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
import { getLanguagePrefix, getLanguageFromPath } from "@/utils/languageUtils";

const IVFSupport = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  const phone = "+420773629123";
  const whatsappLink = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hi! I need IVF injection support in Prague."
  )}`;

  // FAQ items
  const faqItems = (t('ivfSupport.faq.items', { returnObjects: true }) as { question: string; answer: string }[]);

  // Benefits
  const benefitItems = (t('ivfSupport.benefits.items', { returnObjects: true }) as string[]);

  // Testimonials
  const testimonialItems = (t('ivfSupport.testimonials.items', { returnObjects: true }) as { text: string; author: string; context: string }[]);

  // Why Matters points
  const whyMattersPoints = (t('ivfSupport.whyMatters.points', { returnObjects: true }) as string[]);

  // Services data
  const serviceKeys = ['medication', 'intralipid', 'wellness'] as const;

  // Schema markup (JSON-LD array)
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": "IVF Support Prague — Nurse in Prague",
      "description": t('ivfSupport.seo.description'),
      "url": "https://www.nius.cz/ivf-support-prague",
      "telephone": "+420773629123",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Prague",
        "addressCountry": "CZ"
      },
      "areaServed": { "@type": "City", "name": "Prague" },
      "priceRange": "1290-8450 CZK",
      "image": "https://www.nius.cz/og-ivf.jpg",
      "openingHours": "Mo-Su 00:00-23:59",
      "availableService": [
        {
          "@type": "MedicalProcedure",
          "name": "IVF Injection Administration",
          "description": "Professional fertility medication injection service including Gonal-F, Menopur, Cetrotide, trigger shots, and progesterone",
          "serviceType": "Home Healthcare"
        },
        {
          "@type": "MedicalProcedure",
          "name": "Intralipid Infusion for NK Cell Treatment",
          "description": "Intravenous Intralipid therapy to suppress elevated Natural Killer cells before embryo transfer",
          "serviceType": "Home Healthcare"
        },
        {
          "@type": "Service",
          "name": "Fertility Wellness IV Drips",
          "description": "Glutathione, NAD+, and Vitamin C IV drips to support IVF patients"
        }
      ]
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
      "@type": "Product",
      "name": "IVF Medication Administration — Single Visit",
      "description": "Professional IVF injection visit at your Prague location",
      "brand": { "@type": "Brand", "name": "NIUS — Nurse in Prague" },
      "offers": {
        "@type": "Offer",
        "price": "1890",
        "priceCurrency": "CZK",
        "availability": "https://schema.org/InStock",
        "url": "https://www.nius.cz/ivf-support-prague"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Intralipid Infusion — NK Cell Support",
      "description": "Intralipid IV infusion for NK cell suppression before embryo transfer in Prague",
      "brand": { "@type": "Brand", "name": "NIUS — Nurse in Prague" },
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "url": "https://www.nius.cz/ivf-support-prague"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Wellness IV Drips — Fertility-Focused",
      "description": "Glutathione, NAD+, and Vitamin C IV drips for IVF patients in Prague",
      "brand": { "@type": "Brand", "name": "NIUS — Nurse in Prague" },
      "offers": {
        "@type": "Offer",
        "price": "1290",
        "priceCurrency": "CZK",
        "availability": "https://schema.org/InStock",
        "url": "https://www.nius.cz/ivf-support-prague"
      }
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
          "item": `https://www.nius.cz${langPrefix}/ivf-support-prague`
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
      />
      <Header />
      <Breadcrumbs items={[
        { label: "Services", href: "/#services" },
        { label: t('ivfSupport.breadcrumb') }
      ]} />
      <main className="flex-1" role="main">

        {/* ========== SECTION 1: HERO ========== */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  {t('ivfSupport.badge')}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight">
                  {t('ivfSupport.title')}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t('ivfSupport.description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto group">
                      {t('ivfSupport.bookNow')}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {t('ivfSupport.whatsapp')}
                    </Button>
                  </a>
                  <a href={`tel:${phone}`}>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <Phone className="mr-2 h-5 w-5" />
                      {t('ivfSupport.call247')}
                    </Button>
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t('ivfSupport.available247')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t('ivfSupport.licensedNurses')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t('ivfSupport.patientsServed')}</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
                <div className="relative rounded-3xl overflow-hidden shadow-card bg-white p-8">
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
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6 text-center">
                {t('ivfSupport.whyMatters.title')}
              </h2>
              <p className="text-lg text-muted-foreground text-center mb-10">
                {t('ivfSupport.whyMatters.description')}
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {whyMattersPoints.map((point, index) => (
                  <div key={index} className="flex gap-3">
                    <Heart className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <p className="text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 3: SERVICE PACKAGES ========== */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('ivfSupport.services.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {serviceKeys.map((key) => {
                const benefits = t(`ivfSupport.services.${key}.benefits`, { returnObjects: true }) as string[];
                const isHighlighted = key === 'intralipid';
                return (
                  <Card
                    key={key}
                    className={`p-6 flex flex-col ${isHighlighted ? 'border-primary border-2 relative' : ''}`}
                  >
                    {isHighlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
                        NK Cell Support
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-secondary mb-1">
                      {t(`ivfSupport.services.${key}.name`)}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-3">
                      {t(`ivfSupport.services.${key}.subtitle`)}
                    </p>
                    <p className="text-muted-foreground text-sm mb-4 flex-1">
                      {t(`ivfSupport.services.${key}.description`)}
                    </p>

                    <div className="space-y-2 mb-6">
                      {benefits.map((benefit, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-primary">
                          {t(`ivfSupport.services.${key}.price`)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {t(`ivfSupport.services.${key}.duration`)}
                        </span>
                      </div>
                      {key === 'wellness' ? (
                        <Link to={`${langPrefix}/iv-drips-prague`}>
                          <Button variant="outline" className="w-full group">
                            {t(`ivfSupport.services.${key}.cta`)}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      ) : key === 'intralipid' ? (
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                          <Button className="w-full group">
                            {t(`ivfSupport.services.${key}.cta`)}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </a>
                      ) : (
                        <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                          <Button className="w-full group">
                            {t(`ivfSupport.services.${key}.cta`)}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </a>
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

        {/* ========== SECTION 4: BENEFITS / WHY CHOOSE US ========== */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('ivfSupport.benefits.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {benefitItems.map((benefit, index) => (
                <div key={index} className="flex gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-lg text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SECTION 5: HOW IT WORKS ========== */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('ivfSupport.howItWorks.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {(['step1', 'step2', 'step3'] as const).map((step, index) => (
                <Card key={step} className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-3">
                    {t(`ivfSupport.howItWorks.${step}.title`)}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(`ivfSupport.howItWorks.${step}.description`)}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SECTION 6: TESTIMONIALS ========== */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('ivfSupport.testimonials.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonialItems.map((item, index) => (
                <Card key={index} className="p-6">
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

        {/* ========== SECTION 7: FAQ WITH ACCORDION ========== */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
                {t('ivfSupport.faq.title')}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-lg font-semibold text-secondary hover:text-primary">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ========== SECTION 8: RELATED SERVICES ========== */}
        <RelatedServices />

        {/* ========== SECTION 9: FINAL CTA ========== */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t('ivfSupport.cta.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('ivfSupport.cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t('ivfSupport.cta.bookOnline')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t('ivfSupport.cta.whatsapp')}
                  </Button>
                </a>
                <a href={`tel:${phone}`}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    {t('ivfSupport.cta.call')}
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
