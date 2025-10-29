import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Phone, MapPin, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";

const SestrickaPrahaZizkov = () => {
  const { t } = useTranslation();
  
  const pageTitle = "Sestřička Praha Žižkov | Domácí Zdravotní Péče 24/7";
  const pageDescription = "Profesionální sestřička na Žižkově v Praze 3. IV kapačky, injekce, péče o rány a domácí ošetřovatelská péče. Rychlá dostupnost pro Žižkov a okolí.";
  
  const neighborhoods = [
    "Žižkov",
    "Flora",
    "Olšanské náměstí",
    "Parukářka",
    "Nákladové nádraží Žižkov"
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO 
        title={pageTitle}
        description={pageDescription}
        keywords="sestřička žižkov, sestra praha 3, iv kapačky žižkov, domácí péče žižkov, zdravotní péče praha 3"
        ogImage="https://www.nius.cz/og-image.jpg"
        schema={{
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "Sestřička Praha - Žižkov",
          "description": pageDescription,
          "telephone": "+420773629123",
          "areaServed": {
            "@type": "Place",
            "name": "Žižkov, Prague 3"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Žižkov",
            "addressRegion": "Prague 3",
            "addressCountry": "CZ"
          }
        }}
      />
      <Header />
      <Breadcrumbs items={[
        { label: "Služby" },
        { label: "Sestřička Praha Žižkov" }
      ]} />
      <main className="flex-1" role="main">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                Žižkov, Praha 3
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight">
                Sestřička Praha Žižkov
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Profesionální domácí zdravotní péče na Žižkově. IV kapačky, injekce, péče o rány a komplexní ošetřovatelské služby přímo u vás doma.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Rezervovat sestřičku
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </a>
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
                  <span>Obvykle 1-2 hodiny na Žižkově</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Celý Žižkov, Praha 3</span>
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
                Oblasti, které obsluhujeme na Žižkově
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {neighborhoods.map((area, index) => (
                  <Card key={index} className="p-6 text-center hover:shadow-card transition-all">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-lg">{area}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Rychlý příjezd 1-2 hodiny
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
                Naše služby na Žižkově
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3">IV Kapačky na Žižkově</h3>
                  <p className="text-muted-foreground mb-4">
                    Profesionální podání IV kapačky u vás doma. Vitamíny, hydratace, předepsané léky.
                  </p>
                  <p className="text-sm font-semibold">Od 1299 Kč</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Injekce a aplikace léků</h3>
                  <p className="text-muted-foreground mb-4">
                    Inzulín, antibiotika, vitaminová terapie. Přesné a bezpečné podání na Žižkově.
                  </p>
                  <p className="text-sm font-semibold">Od 699 Kč</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Péče o rány a převazy</h3>
                  <p className="text-muted-foreground mb-4">
                    Pooperační péče, sterilní převazy, ošetření ran. Pravidelná kontrola hojení.
                  </p>
                  <p className="text-sm font-semibold">Od 899 Kč</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-3">Denní péče o seniory</h3>
                  <p className="text-muted-foreground mb-4">
                    Hygienická asistence, podávání léků, měření tlaku pro starší obyvatele Žižkova.
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
                Proč si vybrat naši sestřičku na Žižkově?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Rychlý příjezd</h3>
                  <p className="text-sm text-muted-foreground">
                    Na Žižkov obvykle dorazíme do 1-2 hodin
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Místní znalost</h3>
                  <p className="text-sm text-muted-foreground">
                    Výborně známe Žižkov a jeho okolí
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">24/7 dostupnost</h3>
                  <p className="text-sm text-muted-foreground">
                    Naléhavá péče i večerní návštěvy
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
                Potřebujete sestřičku na Žižkově?
              </h2>
              <p className="text-lg text-muted-foreground">
                Rezervujte si profesionální zdravotní péči ještě dnes. Rychlý příjezd, česky i anglicky.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto">
                    Rezervovat online
                  </Button>
                </a>
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

export default SestrickaPrahaZizkov;
