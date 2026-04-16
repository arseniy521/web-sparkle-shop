import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StickyBookNow } from "@/components/StickyBookNow";
import { useTranslation } from "react-i18next";
import { Syringe, Droplets, Heart, User, ArrowRight, AlertCircle } from "lucide-react";
import { getLanguagePrefix, getLocalizedUrl } from "@/utils/languageUtils";

const SpecializedServices = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const langPrefix = getLanguagePrefix(currentLang);

  const pageTitle = t('specializedServices.seo.title');
  const pageDescription = t('specializedServices.seo.description');

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Nurse in Prague - Specialized Services for International Patients",
    "description": pageDescription,
    "url": `https://www.nius.cz${langPrefix}/specialized-services`,
    "image": "https://www.nius.cz/og-image.jpg",
    "priceRange": "€€",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Prague",
      "addressCountry": "CZ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "50.0755",
      "longitude": "14.4378"
    },
    "medicalSpecialty": [
      "IVF Support",
      "IV Therapy",
      "Hangover IV Drip",
      "Post-Surgery Care",
      "Disabled Care",
      "Home Nursing"
    ]
  };

  const hangoverHref = getLocalizedUrl('/hangover-iv-drip-prague', currentLang) || `${langPrefix}/hangover-iv-drip-prague/`;

  const services = [
    {
      icon: Syringe,
      title: t('specializedServices.ivf'),
      description: t('specializedServices.ivfDesc'),
      link: `${langPrefix}/ivf-support-prague/`,
      image: "/assets/injection.png"
    },
    {
      icon: Droplets,
      title: t('specializedServices.ivDrip'),
      description: t('specializedServices.ivDripDesc'),
      link: `${langPrefix}/iv-drips-prague/`,
      image: "/assets/drips_cl2.png"
    },
    {
      icon: AlertCircle,
      title: t('specializedServices.hangover'),
      description: t('specializedServices.hangoverDesc'),
      link: hangoverHref,
      image: "/assets/drips_cl2.png"
    },
    {
      icon: Heart,
      title: t('specializedServices.postSurgery'),
      description: t('specializedServices.postSurgeryDesc'),
      link: `${langPrefix}/post-surgery-recovery-care-prague/`,
      image: "/assets/WoundDressingBandage.png"
    },
    {
      icon: User,
      title: t('specializedServices.disabled'),
      description: t('specializedServices.disabledDesc'),
      link: `${langPrefix}/disabled-daily-care-prague/`,
      image: "/assets/HygieneAssistance.png"
    }
  ];

  return (
    <>
      <SEO 
        title={pageTitle}
        description={pageDescription}
        canonical={`https://www.nius.cz${langPrefix}/specialized-services/`}
        ogImage="https://www.nius.cz/og-image.jpg"
        ogType="website"
        schema={schema}
      />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <Breadcrumbs items={[
            { label: t('specializedServices.title') }
          ]} />

          {/* Hero Section */}
          <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  {t('specializedServices.title')}
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  {t('specializedServices.heroDescription')}
                </p>
                <div className="flex flex-wrap gap-4 justify-center pt-4">
                  <Button size="lg" asChild>
                    <a href="https://wa.me/420773629123">{t('nav.bookNow')}</a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="tel:+420773629123">{t('specializedServices.call')}</a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Services Grid */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t('specializedServices.ourServices')}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t('specializedServices.servicesDescription')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <Icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                            <p className="text-muted-foreground mb-4">{service.description}</p>
                          </div>
                        </div>
                        <Button 
                          className="w-full group"
                          onClick={() => window.location.href = service.link}
                        >
                          {t('specializedServices.learnMore')}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-20 px-4 bg-muted/50">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                {t('specializedServices.whyChoose')}
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="p-6 text-center">
                  <div className="text-4xl mb-4">🌍</div>
                  <h3 className="text-xl font-semibold mb-3">{t('specializedServices.international')}</h3>
                  <p className="text-muted-foreground">
                    {t('specializedServices.internationalDesc')}
                  </p>
                </Card>
                
                <Card className="p-6 text-center">
                  <div className="text-4xl mb-4">⏰</div>
                  <h3 className="text-xl font-semibold mb-3">{t('specializedServices.flexible')}</h3>
                  <p className="text-muted-foreground">
                    {t('specializedServices.flexibleDesc')}
                  </p>
                </Card>
                
                <Card className="p-6 text-center">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-semibold mb-3">{t('specializedServices.experienced')}</h3>
                  <p className="text-muted-foreground">
                    {t('specializedServices.experiencedDesc')}
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('specializedServices.ctaTitle')}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t('specializedServices.ctaDescription')}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="https://wa.me/420773629123">{t('specializedServices.bookWhatsApp')}</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:info@nius.cz">{t('specializedServices.emailUs')}</a>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <StickyBookNow />
      </div>
    </>
  );
};

export default SpecializedServices;
