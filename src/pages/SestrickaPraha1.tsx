import { Button } from "@/components/ui/button";
import { BookingLink } from '@/components/BookingLink';
import { Card } from "@/components/ui/card";
import { ArrowRight, Phone, MapPin, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const SestrickaPraha1 = () => {
  const { t } = useTranslation();
  
  const pageTitle = "Sestřička Praha 1 | Domácí péče v centru";
  const pageDescription = "Sestřička v centru Prahy: IV kapačky, injekce a ošetřovatelská péče v Praze 1. Návštěva ve stejný den, denně 8:00–21:00.";
  
  const neighborhoods = [
    "Staré Město",
    "Nové Město",
    "Malá Strana",
    "Josefov",
    "Hradčany"
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords="sestřička praha 1, sestra staré město, iv kapačky centrum praha, domácí péče praha 1, zdravotní péče nové město"
        ogImage="https://www.nius.cz/og-image.jpg"
        hreflangLanguages={['cs']}
        schema={{
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "Sestřička Praha 1 - Staré & Nové Město",
          "description": pageDescription,
          "telephone": "+420773629123",
          "email": "info@nius.cz",
          "url": "https://www.nius.cz/sestricka-praha-1/",
          "priceRange": "1650-4550 CZK",
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "50.0875",
            "longitude": "14.4208"
          },
          "openingHours": "Mo-Su 08:00-21:00",
          "areaServed": {
            "@type": "Place",
            "name": "Prague 1 - Old Town, New Town, Lesser Town"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Prague 1",
            "addressRegion": "Prague",
            "addressCountry": "CZ"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Služby v centru Prahy",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "IV Kapačky Praha 1",
                  "description": "IV kapačky v hotelích a domech v centru Prahy",
                  "price": "1650",
                  "priceCurrency": "CZK"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "IVF Injekce pro turisty",
                  "description": "Podání léků předepsaných vaší klinikou v hotelu",
                  "price": "1900",
                  "priceCurrency": "CZK"
                }
              }
            ]
          }
        }}
      />
      <Header />
      <Breadcrumbs items={[
        { label: "Služby", href: "/#services" },
        { label: "Sestřička Praha 1" }
      ]} />
      <main className="flex-1" role="main">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                Praha 1 - Centrum
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight">
                Sestřička Praha 1 - Centrum
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Profesionální domácí zdravotní péče v centru Prahy. IV kapačky, injekce a kompletní ošetřovatelské služby ve Starém Městě, Novém Městě a Malé Straně.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <BookingLink>
                  <Button size="lg" className="w-full sm:w-auto group">
                    Rezervovat sestřičku
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </BookingLink>
                <a href="tel:+420773629123">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    +420 773 629 123
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap gap-6 justify-center pt-8 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Návštěva ve stejný den, denně 8:00–21:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Celá Praha 1</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-secondary mb-8 text-center">
                Oblasti v Praze 1, které obsluhujeme
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {neighborhoods.map((area, index) => (
                  <Card key={index} className="p-6 text-center hover:shadow-card transition-all">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-lg">{area}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Čas příjezdu potvrdíme po objednání
                    </p>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-3 text-center">Obsluhujeme také hotely v centru Prahy:</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Přijedeme do kteréhokoli hotelu, apartmánu nebo Airbnb v Praze 1
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-secondary mb-12 text-center">
                Naše služby v centru Prahy
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/iv-kapacky-praha/">
                  <Card className="p-6 hover:shadow-card transition-all">
                    <h3 className="text-xl font-semibold mb-3">IV Kapačky Praha 1</h3>
                    <p className="text-muted-foreground mb-4">
                      Podání IV kapačky v hotelu nebo apartmánu. Vitamíny a hydratace; každou infuzi indikuje lékař po krátkém zdravotním posouzení, konzultace je v ceně.
                    </p>
                    <p className="text-sm font-semibold">Od 1 650 Kč</p>
                  </Card>
                </Link>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3">IVF Injekce pro zahraniční pacienty</h3>
                  <p className="text-muted-foreground mb-4">
                    Podáváme léky předepsané vaší klinikou podle jejích písemných pokynů, i v pražských hotelech. Anglicky mluvící personál.
                  </p>
                  <p className="text-sm font-semibold">Od 1 900 Kč</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Pooperační péče pro zdravotní turisty</h3>
                  <p className="text-muted-foreground mb-4">
                    Péče o rány, převazy, odstraňování stehů po plastických operacích a zákrocích v Praze.
                  </p>
                  <p className="text-sm font-semibold">Od 1 890 Kč</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Injekce a aplikace léků</h3>
                  <p className="text-muted-foreground mb-4">
                    Aplikace injekcí předepsaných lékařem nebo vaší klinikou, podle jejich písemných pokynů, v hotelu nebo doma.
                  </p>
                  <p className="text-sm font-semibold">Od 2 190 Kč</p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-bold text-secondary">
                Proč si vybrat naši sestřičku v Praze 1?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Návštěva ve stejný den</h3>
                  <p className="text-sm text-muted-foreground">
                    Denně 8:00–21:00. Čas příjezdu potvrdíme po objednání.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Hotely & Airbnb</h3>
                  <p className="text-sm text-muted-foreground">
                    Přijedeme do jakéhokoli hotelu v centru
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Anglicky & česky</h3>
                  <p className="text-sm text-muted-foreground">
                    Komunikace pro zahraniční pacienty
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary">
                Potřebujete sestřičku v centru Prahy?
              </h2>
              <p className="text-lg text-muted-foreground">
                Profesionální péče v hotelu nebo doma. Ideální pro turisty a expaty.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <BookingLink>
                  <Button size="lg" className="w-full sm:w-auto">
                    Rezervovat online
                  </Button>
                </BookingLink>
                <a href="tel:+420773629123">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    Zavolat: +420 773 629 123
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

export default SestrickaPraha1;
