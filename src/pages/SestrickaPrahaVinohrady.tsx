import { Link } from "react-router-dom";
import { BookingLink } from '@/components/BookingLink';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Phone, MapPin, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";

const SestrickaPrahaVinohrady = () => {
  const { t } = useTranslation();
  
  const pageTitle = "Sestřička Praha Vinohrady | Domácí Zdravotní Péče";
  const pageDescription = "Sestřička na Vinohradech: IV kapačky, injekce, péče o rány a domácí ošetřovatelská péče. Návštěva ve stejný den, denně 8:00–21:00.";
  
  const neighborhoods = [
    "Vinohrady",
    "Královské Vinohrady",
    "Žižkov",
    "Vršovice",
    "Strašnice"
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords="sestřička vinohrady, sestra vinohrady praha, iv kapačky vinohrady, domácí péče vinohrady, zdravotní péče vinohrady"
        ogImage="https://www.nius.cz/og-image.jpg"
        hreflangLanguages={['cs']}
        schema={{
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "Sestřička Praha - Vinohrady",
          "description": pageDescription,
          "telephone": "+420773629123",
          "email": "info@nius.cz",
          "url": "https://www.nius.cz/sestricka-praha-vinohrady/",
          "priceRange": "1650-4550 CZK",
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "50.0773",
            "longitude": "14.4440"
          },
          "openingHours": "Mo-Su 08:00-21:00",
          "areaServed": {
            "@type": "Place",
            "name": "Vinohrady, Prague 2, Prague 3"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Vinohrady",
            "addressRegion": "Prague",
            "addressCountry": "CZ"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Služby na Vinohradech",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "IV Kapačky Vinohrady",
                  "description": "Profesionální IV kapačky a vitamínové infuze na Vinohradech",
                  "price": "1650",
                  "priceCurrency": "CZK"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Injekce Vinohrady",
                  "description": "Injekce předepsané lékařem nebo vaší klinikou",
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
        { label: "Sestřička Praha Vinohrady" }
      ]} />
      <main className="flex-1" role="main">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                Vinohrady, Praha 2 & 3
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight">
                Sestřička Praha Vinohrady
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Profesionální domácí zdravotní péče na Vinohradech. IV kapačky, injekce, péče o rány a komplexní ošetřovatelské služby přímo u vás doma.
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
                  <span>Celé Vinohrady, Praha 2, 3</span>
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
                Oblasti, které obsluhujeme na Vinohradech
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
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-secondary mb-12 text-center">
                Naše služby na Vinohradech
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link to="/iv-kapacky-praha/">
                  <Card className="p-6 hover:shadow-card transition-all">
                    <h3 className="text-xl font-semibold mb-3">IV Kapačky na Vinohradech</h3>
                    <p className="text-muted-foreground mb-4">
                      Profesionální podání IV kapačky přímo u vás doma na Vinohradech. Vitamíny a hydratace; každou infuzi indikuje lékař po krátkém zdravotním posouzení, konzultace je v ceně.
                    </p>
                    <p className="text-sm font-semibold">Od 1 650 Kč</p>
                  </Card>
                </Link>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Injekce a aplikace léků</h3>
                  <p className="text-muted-foreground mb-4">
                    Injekce předepsané lékařem nebo vaší klinikou, včetně IVF, podle jejich písemných pokynů.
                  </p>
                  <p className="text-sm font-semibold">Od 1 900 Kč</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Péče o rány a převazy</h3>
                  <p className="text-muted-foreground mb-4">
                    Pooperační péče, sterilní převazy, ošetření ran. Pravidelná kontrola hojení.
                  </p>
                  <p className="text-sm font-semibold">Od 1 890 Kč</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Denní péče o seniory</h3>
                  <p className="text-muted-foreground mb-4">
                    Hygienická asistence, pomoc s léky dle pokynů lékaře, měření tlaku, kompletní péče pro starší pacienty.
                  </p>
                  <p className="text-sm font-semibold">Individuální ceny</p>
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
                Proč si vybrat naši sestřičku na Vinohradech?
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
                  <h3 className="font-semibold">Místní znalost</h3>
                  <p className="text-sm text-muted-foreground">
                    Dobře známe Vinohrady a okolní čtvrti, včetně parkování
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Denní dostupnost 8–21</h3>
                  <p className="text-sm text-muted-foreground">
                    Naléhavá péče i večerní návštěvy na Vinohradech
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
                Potřebujete sestřičku na Vinohradech?
              </h2>
              <p className="text-lg text-muted-foreground">
                Rezervujte si profesionální zdravotní péči ještě dnes. Návštěva ve stejný den, anglicky i česky.
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

export default SestrickaPrahaVinohrady;
