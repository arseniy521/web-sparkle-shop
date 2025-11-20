import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Clock, Shield, Phone, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { RelatedServices } from "@/components/RelatedServices";
import ivDripIcon from "@/assets/drp-2.png";
import { useTranslation } from "react-i18next";

const IVFSupport = () => {
  const { t } = useTranslation();
  const benefits = [
    t('ivfSupport.benefits.timing'),
    t('ivfSupport.benefits.experienced'),
    t('ivfSupport.benefits.english'),
    t('ivfSupport.benefits.location'),
    t('ivfSupport.benefits.coordination'),
    t('ivfSupport.benefits.discreet'),
    t('ivfSupport.benefits.sameDay'),
    t('ivfSupport.benefits.flexible')
  ];

  // Update meta tags
  const pageTitle = "IVF Injection Support Prague | Home Nurse for Fertility Treatment";
  const pageDescription = "Professional IVF injection support at your Prague hotel. Time-sensitive fertility medication administration by English-speaking nurses. 24/7 availability for Gonal-F, Menopur, Cetrotide injections.";
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO 
        title={pageTitle}
        description={pageDescription}
        ogImage="https://www.nius.cz/og-ivf.jpg"
        schema={{
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "IVF Injection Support Prague - Nurse in Prague",
          "description": pageDescription,
          "url": "https://www.nius.cz/ivf-injection-support-prague",
          "telephone": "+420773629123",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Prague",
            "addressCountry": "CZ"
          },
          "priceRange": "1890-8450 CZK",
          "image": "https://www.nius.cz/og-ivf.jpg",
          "availableService": [
            {
              "@type": "MedicalProcedure",
              "name": "IVF Injection Administration",
              "description": "Professional fertility medication injection service at patient location",
              "serviceType": "Home Healthcare"
            },
            {
              "@type": "Service",
              "name": "Evening & Weekend IVF Support",
              "description": "Flexible scheduling for time-sensitive fertility medications"
            }
          ]
        }}
      />
      <Header />
      <Breadcrumbs items={[
        { label: "Services", href: "/#services" },
        { label: "IVF Injection Support" }
      ]} />
      <main className="flex-1" role="main">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  {t('ivfSupport.badge')}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight" itemProp="headline">
                  {t('ivfSupport.title')}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t('ivfSupport.description')} Our experienced nurses also provide <Link to="/iv-drip-therapy-prague" className="text-primary hover:underline font-medium">vitamin IV drip therapy Prague</Link> to support your overall wellness during treatment.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto group">
                      {t('ivfSupport.bookNow')}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                  <a href="tel:+420773629123">
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
                    alt="IVF injection support nurse in Prague"
                    className="w-full h-auto object-contain"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why IVF Patients Choose Us */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('ivfSupport.whyChoose')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-lg text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 text-center">
                {t('ivfSupport.pricing.title')}
              </h2>
              
              <Card className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h3 className="text-xl font-semibold text-secondary">{t('ivfSupport.pricing.single')}</h3>
                      <p className="text-muted-foreground">{t('ivfSupport.pricing.singleDesc')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{t('ivfSupport.pricing.singlePrice')}</div>
                      <div className="text-sm text-muted-foreground">per visit</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h3 className="text-xl font-semibold text-secondary">{t('ivfSupport.pricing.evening')}</h3>
                      <p className="text-muted-foreground">{t('ivfSupport.pricing.eveningDesc')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{t('ivfSupport.pricing.eveningPrice')}</div>
                      <div className="text-sm text-muted-foreground">per visit</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-secondary">{t('ivfSupport.pricing.package')}</h3>
                      <p className="text-muted-foreground">{t('ivfSupport.pricing.packageDesc')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{t('ivfSupport.pricing.packagePrice')}</div>
                      <div className="text-sm text-muted-foreground">{t('ivfSupport.pricing.save')}</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Includes:</strong> {t('ivfSupport.pricing.includes')}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="text-center mt-8">
                <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    {t('ivfSupport.pricing.bookButton')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('ivfSupport.howItWorks.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">{t('ivfSupport.howItWorks.step1Title')}</h3>
                <p className="text-muted-foreground">
                  {t('ivfSupport.howItWorks.step1Desc')}
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">{t('ivfSupport.howItWorks.step2Title')}</h3>
                <p className="text-muted-foreground">
                  {t('ivfSupport.howItWorks.step2Desc')}
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">{t('ivfSupport.howItWorks.step3Title')}</h3>
                <p className="text-muted-foreground">
                  {t('ivfSupport.howItWorks.step3Desc')}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
                {t('ivfSupport.faq.title')}
              </h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">{t('ivfSupport.faq.q1')}</h3>
                  <p className="text-muted-foreground">{t('ivfSupport.faq.a1')}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">{t('ivfSupport.faq.q2')}</h3>
                  <p className="text-muted-foreground">{t('ivfSupport.faq.a2')}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">{t('ivfSupport.faq.q3')}</h3>
                  <p className="text-muted-foreground">{t('ivfSupport.faq.a3')}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">{t('ivfSupport.faq.q4')}</h3>
                  <p className="text-muted-foreground">{t('ivfSupport.faq.a4')}</p>
                </Card>
              </div>
            </div>
          </div>
          
          {/* FAQ Schema */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": t('ivfSupport.faq.q1'),
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": t('ivfSupport.faq.a1')
                  }
                },
                {
                  "@type": "Question",
                  "name": t('ivfSupport.faq.q2'),
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": t('ivfSupport.faq.a2')
                  }
                },
                {
                  "@type": "Question",
                  "name": t('ivfSupport.faq.q3'),
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": t('ivfSupport.faq.a3')
                  }
                },
                {
                  "@type": "Question",
                  "name": t('ivfSupport.faq.q4'),
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": t('ivfSupport.faq.a4')
                  }
                }
              ]
            })
          }} />
        </section>

        {/* Related Services */}
        <RelatedServices />

        {/* CTA */}
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
                <a href="tel:+420773629123">
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
