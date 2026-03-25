import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, Phone, Check, Heart, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { RelatedServices } from "@/components/RelatedServices";
import hygieneIcon from "@/assets/HygieneAssistance.webp";
import { useTranslation } from "react-i18next";

const DisabledCare = () => {
  const { t } = useTranslation();
  
  const pageTitle = "Home Nursing Care Prague | Daily Support for Your Loved One";
  const pageDescription = "Professional daily nursing care in Prague for elderly, disabled, and chronic patients. Give your loved one compassionate hygiene, medication, and mobility support by English-speaking nurses — at home.";
  
  const services = [
    t('disabledCare.services.hygiene'),
    t('disabledCare.services.dressing'),
    t('disabledCare.services.medication'),
    t('disabledCare.services.suppository'),
    t('disabledCare.services.mobility'),
    t('disabledCare.services.meals'),
    t('disabledCare.services.vitals'),
    t('disabledCare.services.companionship')
  ];

  const faqKeys = ['1', '2', '3', '4', '5'] as const;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": "Disabled Daily Care Prague - Home Nursing for Expats",
      "description": pageDescription,
      "url": "https://www.nius.cz/disabled-daily-care-prague/",
      "telephone": "+420773629123",
      "email": "info@nius.cz",
      "image": "https://www.nius.cz/og-disabled.jpg",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Prague",
        "addressCountry": "CZ"
      },
      "priceRange": "2190-118200 CZK",
      "availableService": [
        {
          "@type": "Service",
          "name": "Personal Hygiene Assistance",
          "description": "Bathing, grooming, and personal care for disabled patients"
        },
        {
          "@type": "Service",
          "name": "Mobility Support",
          "description": "Safe transfers and positioning assistance"
        },
        {
          "@type": "Service",
          "name": "Medication Management",
          "description": "Timely medication administration and monitoring"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqKeys.map(key => ({
        "@type": "Question",
        "name": t(`disabledCare.faq.q${key}`),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t(`disabledCare.faq.a${key}`)
        }
      }))
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title={pageTitle}
        description={pageDescription}
        ogImage="https://www.nius.cz/og-disabled.jpg"
        schema={schema}
      />
      <Header />
      <Breadcrumbs items={[
        { label: "Services", href: "/#services" },
        { label: "Disabled Care" }
      ]} />
      <main className="flex-1" role="main">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  {t('disabledCare.badge')}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight" itemProp="headline">
                  {t('disabledCare.title')}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t('disabledCare.description')} We also offer specialized services including <Link to="/post-surgery-recovery-care-prague/" className="text-primary hover:underline font-medium">post-surgery care Prague</Link> and <Link to="/iv-drips-prague/" className="text-primary hover:underline font-medium">IV vitamin therapy</Link>.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto group">
                      {t('disabledCare.bookVisit')}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                  <a href="tel:+420773629123">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <Phone className="mr-2 h-5 w-5" />
                      {t('disabledCare.call')}
                    </Button>
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t('disabledCare.compassionate')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t('disabledCare.flexible')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t('disabledCare.englishSpeaking')}</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
                <div className="relative rounded-3xl overflow-hidden shadow-card bg-white p-8">
                  <img
                    src={hygieneIcon}
                    alt="Disabled care and hygiene assistance nurse in Prague"
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

        {/* Services Included */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('disabledCare.servicesTitle')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {services.map((service, index) => (
                <div key={index} className="flex gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-lg text-muted-foreground">{service}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 text-center">
                {t('disabledCare.pricing.title')}
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-8">
                  <h3 className="text-2xl font-bold text-secondary mb-2">{t('disabledCare.pricing.single')}</h3>
                  <div className="text-4xl font-bold text-primary mb-4">{t('disabledCare.pricing.singlePrice')}</div>
                  <p className="text-muted-foreground mb-6">
                    {t('disabledCare.pricing.singleDesc')}
                  </p>
                  <a href="tel:+420773629123">
                    <Button className="w-full">{t('disabledCare.pricing.subscribe')}</Button>
                  </a>
                </Card>

                <Card className="p-8 border-2 border-primary relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    {t('disabledCare.pricing.bestValue')}
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">{t('disabledCare.pricing.monthly')}</h3>
                  <div className="text-4xl font-bold text-primary mb-4">{t('disabledCare.pricing.monthlyPrice')}</div>
                  <p className="text-muted-foreground mb-6">
                    {t('disabledCare.pricing.monthlyDesc')}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {(t('disabledCare.pricing.monthlyFeatures', { returnObjects: true, defaultValue: ['20 hours of care monthly', 'Consistent caregiver', 'Flexible daily scheduling', 'Priority phone support', 'Save 10% vs single visits'] }) as string[]).map((feature, i) => (
                      <li key={i} className="flex gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="tel:+420773629123">
                    <Button className="w-full">{t('disabledCare.pricing.subscribe')}</Button>
                  </a>
                </Card>
              </div>

              <div className="text-center mt-8 space-y-2">
                <p className="text-muted-foreground">
                  <strong>{t('disabledCare.pricing.extended')}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('disabledCare.pricing.includes')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Help */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('disabledCare.whoWeHelp.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {(['disabled', 'expats', 'chronic'] as const).map(key => (
                <Card key={key} className="p-6">
                  <h3 className="text-xl font-semibold text-secondary mb-3">
                    {t(`disabledCare.whoWeHelp.${key}.title`)}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t(`disabledCare.whoWeHelp.${key}.description`)}
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {(t(`disabledCare.whoWeHelp.${key}.items`, { returnObjects: true }) as string[]).map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('disabledCare.testimonials.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {(t('disabledCare.testimonials.items', { returnObjects: true }) as { text: string; author: string; context: string }[]).map((item, index) => (
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

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
                {t('disabledCare.faq.title')}
              </h2>
              <div className="space-y-6">
                {faqKeys.map(key => (
                  <Card key={key} className="p-6">
                    <h3 className="text-lg font-semibold text-secondary mb-2">{t(`disabledCare.faq.q${key}`)}</h3>
                    <p className="text-muted-foreground">{t(`disabledCare.faq.a${key}`)}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t('disabledCare.cta.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('disabledCare.cta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/420773629123" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t('disabledCare.bookVisit')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="tel:+420773629123">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    {t('disabledCare.call')}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <RelatedServices />
      <Footer />
    </div>
  );
};

export default DisabledCare;
