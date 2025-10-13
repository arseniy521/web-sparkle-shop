import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, Phone, Check, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import hygieneIcon from "@/assets/HygieneAssistance.png";
import { useTranslation } from "react-i18next";

const DisabledCare = () => {
  const { t } = useTranslation();
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
                  Compassionate Daily Care in Prague
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight">
                  Daily Comfort Care for Disabled & Chronic Patients in Prague
                </h1>
                <p className="text-lg text-muted-foreground">
                  Professional nursing care for disabled patients and expats needing daily assistance. English-speaking nurses provide compassionate hygiene, medication, and mobility support at your home.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto group">
                      Book Care Visit
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                  <a href="tel:+420773629123">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <Phone className="mr-2 h-5 w-5" />
                      Call: +420 773 629 123
                    </Button>
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Compassionate Care</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Flexible Scheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">English Speaking</span>
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
              Daily Comfort Care Services
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
                Daily Care Pricing & Packages
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-8">
                  <h3 className="text-2xl font-bold text-secondary mb-2">Single Visit</h3>
                  <div className="text-4xl font-bold text-primary mb-4">1,900 CZK</div>
                  <p className="text-muted-foreground mb-6">
                    Per hour for hygiene assistance, medication, or daily care needs
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Hygiene & bathing</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Medication administration</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Mobility assistance</span>
                    </li>
                  </ul>
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">Book Visit</Button>
                  </a>
                </Card>

                <Card className="p-8">
                  <h3 className="text-2xl font-bold text-secondary mb-2">10-Visit Package</h3>
                  <div className="text-4xl font-bold text-primary mb-4">18,000 CZK</div>
                  <p className="text-muted-foreground mb-6">
                    10 hours of care (save 1,000 CZK) - perfect for weekly visits
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">All single visit services</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Flexible scheduling</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Priority booking</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Save 1,000 CZK</span>
                    </li>
                  </ul>
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full">Buy Package</Button>
                  </a>
                </Card>

                <Card className="p-8 border-2 border-primary relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">Monthly Subscription</h3>
                  <div className="text-4xl font-bold text-primary mb-4">38,000 CZK</div>
                  <p className="text-muted-foreground mb-6">
                    20 hours per month - ideal for daily or regular care needs
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">20 hours of care monthly</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Consistent caregiver</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Flexible daily scheduling</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Priority 24/7 support</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Save 10% vs single visits</span>
                    </li>
                  </ul>
                  <a href="tel:+420773629123">
                    <Button className="w-full">Call to Subscribe</Button>
                  </a>
                </Card>
              </div>

              <div className="text-center mt-8 space-y-2">
                <p className="text-muted-foreground">
                  <strong>Extended care available:</strong> 40 hours/month = 72,000 CZK | 60 hours/month = 105,000 CZK
                </p>
                <p className="text-sm text-muted-foreground">
                  All packages include travel within Prague, supplies, and English-speaking nurses
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Help */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              We Provide Compassionate Care For
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-3">Disabled Patients</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive assistance with daily living activities, mobility, and personal care needs.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Bathing and hygiene</li>
                  <li>• Dressing assistance</li>
                  <li>• Mobility support</li>
                  <li>• Medication management</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-3">Expats & Foreigners</h3>
                <p className="text-muted-foreground mb-4">
                  English-speaking care for expats without family support or Czech language skills.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• English communication</li>
                  <li>• Cultural sensitivity</li>
                  <li>• Insurance navigation</li>
                  <li>• Doctor coordination</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-3">Chronic Conditions</h3>
                <p className="text-muted-foreground mb-4">
                  Regular support for patients managing ongoing health conditions requiring daily care.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Diabetes management</li>
                  <li>• Wound care</li>
                  <li>• Catheter care</li>
                  <li>• Pain management</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">Can I have the same nurse each visit?</h3>
                  <p className="text-muted-foreground">Yes! With our monthly subscription, we assign a consistent caregiver who gets to know your needs and preferences. This creates continuity and comfort.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">What if I need help with intimate care?</h3>
                  <p className="text-muted-foreground">Our nurses are professionally trained in all aspects of personal care, including bathing, toileting, suppository insertion, and catheter care. We provide dignified, respectful assistance.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">Do you speak English?</h3>
                  <p className="text-muted-foreground">Yes! All our nurses speak English, which is especially important for expats and foreigners without Czech language skills or family support in Prague.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">Can I adjust my monthly hours?</h3>
                  <p className="text-muted-foreground">Absolutely. Monthly subscriptions are flexible. If you need more or fewer hours, we can adjust your plan. Unused hours can roll over or be credited.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">What areas of Prague do you serve?</h3>
                  <p className="text-muted-foreground">We serve all Prague districts and surrounding areas up to 30km from city center. Travel is included in all pricing.</p>
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
                Ready to Schedule Daily Care?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Experience compassionate, professional nursing care in the comfort of your home. We're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto">
                    Book Care Visit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="tel:+420773629123">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    Discuss Subscription
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
          "name": "Disabled Daily Care Prague - Home Nursing for Expats",
          "description": "Daily comfort care for disabled patients and expats in Prague. English-speaking nurses provide hygiene assistance, medication management, and compassionate home support.",
          "url": "https://www.nius.cz/disabled-daily-care-prague",
          "telephone": "+420773629123",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Prague",
            "addressCountry": "CZ"
          },
          "priceRange": "1900-38000 CZK"
        })
      }} />
    </div>
  );
};

export default DisabledCare;
