import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Phone, Check, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { RelatedServices } from "@/components/RelatedServices";
import woundCareIcon from "@/assets/WoundDressingBandage.png";
import { useTranslation } from "react-i18next";

const PostSurgeryCare = () => {
  const { t } = useTranslation();
  const services = [
    t('postSurgeryCare.services.woundCare'),
    t('postSurgeryCare.services.drainManagement'),
    t('postSurgeryCare.services.hygiene'),
    t('postSurgeryCare.services.painMeds'),
    t('postSurgeryCare.services.escort'),
    t('postSurgeryCare.services.ivManagement'),
    t('postSurgeryCare.services.compression'),
    t('postSurgeryCare.services.monitoring')
  ];

  const pageTitle = "Post-Surgery Recovery Care Prague | Medical Tourism Nursing Support";
  const pageDescription = "Professional post-operative nursing care for medical tourists in Prague. Wound care, hygiene assistance, hospital escort at your hotel. English-speaking nurses for plastic surgery, dental, orthopedic recovery.";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO 
        title={pageTitle}
        description={pageDescription}
        canonical="https://www.nius.cz/post-surgery-recovery-care-prague"
        ogImage="https://www.nius.cz/og-postsurgery.jpg"
        schema={{
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "Post-Surgery Recovery Care Prague - Medical Tourism Support",
          "description": pageDescription,
          "url": "https://www.nius.cz/post-surgery-recovery-care-prague",
          "telephone": "+420773629123",
          "image": "https://www.nius.cz/og-postsurgery.jpg",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Prague",
            "addressCountry": "CZ"
          },
          "priceRange": "2500-25000 CZK",
          "availableService": [
            {
              "@type": "MedicalProcedure",
              "name": "Post-Operative Wound Care",
              "description": "Professional wound dressing and monitoring for surgical recovery"
            },
            {
              "@type": "Service",
              "name": "Hospital Escort Service",
              "description": "Safe transportation and settlement assistance for medical tourists"
            },
            {
              "@type": "Service",
              "name": "Recovery Care Packages",
              "description": "Comprehensive post-surgery care from 2 days to 2 weeks"
            }
          ]
        }}
      />
      <Header />
      <Breadcrumbs items={[
        { label: "Services" },
        { label: "Post-Surgery Care" }
      ]} />
      <main className="flex-1" role="main">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  {t('postSurgeryCare.badge')}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight" itemProp="headline">
                  {t('postSurgeryCare.title')}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t('postSurgeryCare.description')} Our comprehensive care includes <Link to="/iv-drip-therapy-prague" className="text-primary hover:underline font-medium">IV drip therapy for faster recovery</Link> and specialized wound management to ensure optimal healing.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto group">
                      {t('postSurgeryCare.bookNow')}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                  <a href="tel:+420773629123">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <Phone className="mr-2 h-5 w-5" />
                      {t('postSurgeryCare.call')}
                    </Button>
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t('postSurgeryCare.plasticSurgery')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t('postSurgeryCare.licensedNurses')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{t('postSurgeryCare.touristsServed')}</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
                <div className="relative rounded-3xl overflow-hidden shadow-card bg-white p-8">
                  <img
                    src={woundCareIcon}
                    alt="Post-surgery wound care nurse in Prague"
                    className="w-full h-auto object-contain"
                    loading="eager"
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
              {t('postSurgeryCare.servicesTitle')}
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
                {t('postSurgeryCare.pricing.title')}
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-8">
                  <h3 className="text-2xl font-bold text-secondary mb-2">{t('postSurgeryCare.pricing.escort')}</h3>
                  <div className="text-4xl font-bold text-primary mb-4">{t('postSurgeryCare.pricing.escortPrice')}</div>
                  <p className="text-muted-foreground mb-6">
                    {t('postSurgeryCare.pricing.escortDesc')}
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Nurse escort service</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Vital signs monitoring</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Safe settlement at hotel</span>
                    </li>
                  </ul>
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">Book Escort</Button>
                  </a>
                </Card>

                <Card className="p-8 border-2 border-primary relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    {t('postSurgeryCare.pricing.popular')}
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">{t('postSurgeryCare.pricing.first48')}</h3>
                  <div className="text-4xl font-bold text-primary mb-4">{t('postSurgeryCare.pricing.first48Price')}</div>
                  <p className="text-muted-foreground mb-6">
                    {t('postSurgeryCare.pricing.first48Desc')}
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Hospital escort included</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">2 hours post-op care</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Wound care & hygiene</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Medication assistance</span>
                    </li>
                  </ul>
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">Book Package</Button>
                  </a>
                </Card>

                <Card className="p-8">
                  <h3 className="text-2xl font-bold text-secondary mb-2">{t('postSurgeryCare.pricing.fiveDay')}</h3>
                  <div className="text-4xl font-bold text-primary mb-4">{t('postSurgeryCare.pricing.fiveDayPrice')}</div>
                  <p className="text-muted-foreground mb-6">
                    {t('postSurgeryCare.pricing.fiveDayDesc')}
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Hospital escort included</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Daily 2-hour visits (5 days)</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">All wound care & dressings</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Hygiene assistance</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">24/7 phone support</span>
                    </li>
                  </ul>
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">Book Package</Button>
                  </a>
                </Card>
              </div>

              <div className="text-center mt-8">
                <p className="text-muted-foreground">
                  <strong>{t('postSurgeryCare.pricing.singleVisit').split(':')[0]}:</strong> {t('postSurgeryCare.pricing.singleVisit').split(':')[1]}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ideal For */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              {t('postSurgeryCare.idealFor.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-3">{t('postSurgeryCare.idealFor.plastic')}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Breast augmentation/lift</li>
                  <li>• Liposuction</li>
                  <li>• Tummy tuck</li>
                  <li>• Facelift</li>
                  <li>• Rhinoplasty</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-3">{t('postSurgeryCare.idealFor.dental')}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Dental implants</li>
                  <li>• Full mouth reconstruction</li>
                  <li>• Bone grafts</li>
                  <li>• Sinus lifts</li>
                </ul>
              </Card>

               <Card className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-3">{t('postSurgeryCare.idealFor.other')}</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Orthopedic surgery</li>
                  <li>• Eye surgery</li>
                  <li>• Bariatric surgery</li>
                  <li>• Any procedure requiring aftercare</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Need specialized support? We also offer <Link to="/disabled-daily-care-prague" className="text-primary hover:underline">daily care for disabled patients</Link> and <Link to="/ivf-injection-support-prague" className="text-primary hover:underline">IVF injection support Prague</Link>.
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
              {t('postSurgeryCare.faq.title')}
            </h2>
              <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-secondary mb-2">{t('postSurgeryCare.faq.q1')}</h3>
                <p className="text-muted-foreground">{t('postSurgeryCare.faq.a1')}</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-secondary mb-2">{t('postSurgeryCare.faq.q2')}</h3>
                <p className="text-muted-foreground">{t('postSurgeryCare.faq.a2')}</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-secondary mb-2">{t('postSurgeryCare.faq.q3')}</h3>
                <p className="text-muted-foreground">{t('postSurgeryCare.faq.a3')}</p>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-secondary mb-2">{t('postSurgeryCare.faq.q4')}</h3>
                <p className="text-muted-foreground">{t('postSurgeryCare.faq.a4')}</p>
              </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Planning Surgery in Prague?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Book your post-operative care in advance for peace of mind. We're here to support your recovery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto">
                    Book Recovery Care
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="tel:+420773629123">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    Call: +420 773 629 123
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

export default PostSurgeryCare;
