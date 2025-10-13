import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Clock, Shield, Phone, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import ivDripIcon from "@/assets/drp-2.png";

const IVFSupport = () => {
  const benefits = [
    "Time-sensitive injection administration (any hour)",
    "Experienced with fertility medications",
    "English-speaking nurses familiar with IVF protocols",
    "Hotel and Airbnb visits throughout Prague",
    "Coordination with your fertility clinic",
    "Discreet, professional service",
    "Same-day availability",
    "Evening and weekend appointments"
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  Specialized IVF Care in Prague
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight">
                  Professional IVF Injection Support at Your Prague Hotel
                </h1>
                <p className="text-lg text-muted-foreground">
                  Time-sensitive fertility medication administration by experienced English-speaking nurses. We come to your hotel, Airbnb, or home anywhere in Prague - day or night.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto group">
                      Book IVF Support Now
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                  <a href="tel:+420773629123">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <Phone className="mr-2 h-5 w-5" />
                      Call 24/7: +420 773 629 123
                    </Button>
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">24/7 Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Licensed Nurses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">200+ IVF Patients Served</span>
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
              Why IVF Patients Flying to Prague Choose Our Service
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
                IVF Injection Support Pricing
              </h2>
              
              <Card className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h3 className="text-xl font-semibold text-secondary">Single Injection Visit</h3>
                      <p className="text-muted-foreground">Perfect for scheduled fertility medication administration</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">1,500 CZK</div>
                      <div className="text-sm text-muted-foreground">per visit</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h3 className="text-xl font-semibold text-secondary">Evening/Night Visit</h3>
                      <p className="text-muted-foreground">Time-sensitive injections after 8 PM or weekends</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">2,000 CZK</div>
                      <div className="text-sm text-muted-foreground">per visit</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-secondary">IVF Cycle Package</h3>
                      <p className="text-muted-foreground">5 scheduled injections throughout your cycle</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">7,000 CZK</div>
                      <div className="text-sm text-muted-foreground">save 500 CZK</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Includes:</strong> All nursing supplies, travel to your location in Prague, professional administration, and coordination with your clinic if needed.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="text-center mt-8">
                <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    Book Your IVF Support
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
              How IVF Injection Support Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">Book Online or Call</h3>
                <p className="text-muted-foreground">
                  Schedule your injection time - even last-minute requests accepted. Provide your hotel/accommodation address.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">Nurse Arrives at Your Location</h3>
                <p className="text-muted-foreground">
                  English-speaking nurse arrives with all supplies. We come to your hotel room, Airbnb, or home.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">Professional Administration</h3>
                <p className="text-muted-foreground">
                  Nurse administers your fertility medication following your clinic's protocol. Typical visit: 15-20 minutes.
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
                IVF Patient Questions
              </h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">Can you do injections at specific times like 8 PM?</h3>
                  <p className="text-muted-foreground">Yes! We understand IVF timing is critical. We offer evening appointments and can accommodate specific timing requirements for trigger shots and other time-sensitive medications.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">Do you work with major Prague IVF clinics?</h3>
                  <p className="text-muted-foreground">Yes, we've worked with patients from Reprofit, ISCARE, Gennet, and other Prague fertility clinics. We're familiar with standard IVF protocols and can coordinate with your clinic if needed.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">What if I'm staying in a hotel?</h3>
                  <p className="text-muted-foreground">Perfect! We visit hotels and Airbnb accommodations throughout Prague. Just provide your hotel name and room number when booking.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">How do I pay?</h3>
                  <p className="text-muted-foreground">We accept cash (CZK or EUR), bank transfer, or card payment. Payment is collected after service.</p>
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
                Ready to Book Your IVF Injection Support?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Don't stress about injection timing during your IVF cycle. Our experienced nurses are here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto">
                    Book Online Now
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
      <Footer />

      {/* JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "IVF Injection Support Prague - Nurse in Prague",
          "description": "Professional IVF injection support at your Prague hotel. Time-sensitive fertility medication administration by English-speaking nurses. 24/7 availability for IVF patients.",
          "url": "https://www.sestranahodinu.cz/ivf-injection-support-prague",
          "telephone": "+420773629123",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Prague",
            "addressCountry": "CZ"
          },
          "priceRange": "1500-2000 CZK",
          "availableService": {
            "@type": "MedicalProcedure",
            "name": "IVF Injection Administration",
            "description": "Professional fertility medication injection service at patient location"
          }
        })
      }} />
    </div>
  );
};

export default IVFSupport;
