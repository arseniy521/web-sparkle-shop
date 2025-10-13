import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Phone, Check, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import woundCareIcon from "@/assets/WoundDressingBandage.png";

const PostSurgeryCare = () => {
  const services = [
    "Wound care and bandage changes",
    "Surgical drain management",
    "Post-operative hygiene assistance",
    "Pain medication administration",
    "Hospital-to-hotel escort service",
    "IV line management and removal",
    "Compression garment assistance",
    "Recovery monitoring and vital signs"
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
                  Medical Tourism Support in Prague
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight">
                  Post-Surgery Recovery Care at Your Prague Hotel
                </h1>
                <p className="text-lg text-muted-foreground">
                  Professional post-operative nursing care for medical tourists. English-speaking nurses provide wound care, hygiene support, and recovery assistance at your hotel or Airbnb.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto group">
                      Book Recovery Care
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
                    <span className="text-sm font-medium">Plastic Surgery Specialists</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Licensed Nurses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">100+ Medical Tourists Served</span>
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
              Post-Operative Care Services
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
                Post-Surgery Recovery Packages
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-8">
                  <h3 className="text-2xl font-bold text-secondary mb-2">Hospital Escort</h3>
                  <div className="text-4xl font-bold text-primary mb-4">2,500 CZK</div>
                  <p className="text-muted-foreground mb-6">
                    Safe transport from hospital/clinic to your hotel with professional nurse escort
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
                    Most Popular
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">First 48 Hours</h3>
                  <div className="text-4xl font-bold text-primary mb-4">5,500 CZK</div>
                  <p className="text-muted-foreground mb-6">
                    Hospital escort + 2 hours aftercare at your hotel on day of surgery
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
                  <h3 className="text-2xl font-bold text-secondary mb-2">5-Day Recovery</h3>
                  <div className="text-4xl font-bold text-primary mb-4">25,000 CZK</div>
                  <p className="text-muted-foreground mb-6">
                    Complete recovery support for 5 days after surgery
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
                  <strong>Single visit pricing:</strong> 1,900 CZK per hour for wound care, bandage changes, or hygiene assistance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ideal For */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center">
              Ideal for Medical Tourists Having
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-3">Plastic Surgery</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Breast augmentation/lift</li>
                  <li>• Liposuction</li>
                  <li>• Tummy tuck</li>
                  <li>• Facelift</li>
                  <li>• Rhinoplasty</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-3">Dental Surgery</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Dental implants</li>
                  <li>• Full mouth reconstruction</li>
                  <li>• Bone grafts</li>
                  <li>• Sinus lifts</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold text-secondary mb-3">Other Procedures</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Orthopedic surgery</li>
                  <li>• Eye surgery</li>
                  <li>• Bariatric surgery</li>
                  <li>• Any procedure requiring aftercare</li>
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
                Medical Tourist Questions
              </h2>
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">I'm staying at a hotel/Airbnb. Can you visit there?</h3>
                  <p className="text-muted-foreground">Absolutely! We visit hotels, Airbnb accommodations, and apartments throughout Prague. This is our specialty for medical tourists.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">Do I need Czech health insurance?</h3>
                  <p className="text-muted-foreground">No. Our service is private pay - you don't need Czech insurance. We accept cash (CZK/EUR), bank transfer, or card payment.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">What if I have complications?</h3>
                  <p className="text-muted-foreground">Our nurses are trained to recognize complications and will coordinate with your surgeon or recommend emergency care if needed. With recovery packages, you have 24/7 phone support.</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-2">Can you help me with showering after surgery?</h3>
                  <p className="text-muted-foreground">Yes! Hygiene assistance is included in our packages. We help with safe showering, keeping surgical sites dry, and post-shower wound care.</p>
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
      <Footer />

      {/* JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "Post-Surgery Recovery Care Prague - Medical Tourism Support",
          "description": "Professional post-operative nursing care for medical tourists in Prague. Wound care, hygiene assistance, hospital escort service at your hotel. English-speaking nurses.",
          "url": "https://www.sestranahodinu.cz/post-surgery-recovery-care-prague",
          "telephone": "+420773629123",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Prague",
            "addressCountry": "CZ"
          },
          "priceRange": "2500-25000 CZK"
        })
      }} />
    </div>
  );
};

export default PostSurgeryCare;
