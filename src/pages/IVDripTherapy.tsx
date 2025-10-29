import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StickyBookNow } from "@/components/StickyBookNow";
import { useTranslation } from "react-i18next";
import { Droplets, Sparkles, Shield, Zap, Heart, Activity } from "lucide-react";

const IVDripTherapy = () => {
  const { t } = useTranslation();

  const pageTitle = "IV Drip Therapy Prague | Vitamin C, Glutathione, Biotin Infusions";
  const pageDescription = "Professional IV drip therapy in Prague. Biotin, Glutathione, Vitamin C infusions for immunity, recovery, and wellness. Cold & Flu treatment, All-in-One IV, MEGA RECOVERY packages.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Nurse in Prague - IV Drip Therapy",
    "description": pageDescription,
    "url": "https://www.nius.cz/iv-drip-therapy-prague",
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
      "IV Therapy",
      "Vitamin Infusion",
      "Wellness Treatment"
    ],
    "availableService": [
      {
        "@type": "MedicalProcedure",
        "name": "Biotin IV Drip",
        "description": "Biotin infusion for hair, skin, and nail health"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Glutathione IV Drip",
        "description": "Powerful antioxidant therapy for detox and skin brightening"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Vitamin C IV Drip",
        "description": "High-dose Vitamin C for immune support and recovery"
      },
      {
        "@type": "MedicalProcedure",
        "name": "Cold & Flu Recovery IV",
        "description": "IV therapy for early symptoms and flu recovery"
      },
      {
        "@type": "MedicalProcedure",
        "name": "All-in-One IV Drip",
        "description": "Complete multivitamin and mineral formula"
      },
      {
        "@type": "MedicalProcedure",
        "name": "MEGA RECOVERY IV Drip",
        "description": "Ultimate recovery formula for maximum wellness"
      }
    ]
  };

  const treatments = [
    {
      icon: Sparkles,
      title: "Biotin IV Drip",
      description: "Biotin infusions promote healthy hair growth, strengthen nails, and improve skin elasticity. Essential B-vitamin for cellular energy and metabolism.",
      benefits: ["Stronger hair and nails", "Improved skin health", "Enhanced energy metabolism"]
    },
    {
      icon: Shield,
      title: "Glutathione IV Drip",
      description: "Powerful antioxidant therapy that detoxifies the body, brightens skin tone, and protects cells from oxidative stress. Known as the 'master antioxidant'.",
      benefits: ["Skin brightening", "Powerful detox", "Anti-aging effects"]
    },
    {
      icon: Heart,
      title: "Vitamin C IV Drip",
      description: "High-dose Vitamin C infusions boost immunity, support collagen production, and accelerate recovery. Essential for immune function and tissue repair.",
      benefits: ["Immune system boost", "Collagen synthesis", "Faster recovery"]
    },
    {
      icon: Activity,
      title: "Cold & Flu Recovery IV",
      description: "Specialized formula for early symptoms and recovery from cold and flu. Contains immune-boosting vitamins and minerals to help you feel better faster.",
      benefits: ["Symptom relief", "Faster recovery", "Immune support"]
    },
    {
      icon: Droplets,
      title: "All-in-One IV Drip",
      description: "Complete multivitamin and mineral formula designed for overall wellness. Perfect for busy professionals and those seeking comprehensive nutritional support.",
      benefits: ["Complete nutrition", "Energy boost", "Overall wellness"]
    },
    {
      icon: Zap,
      title: "MEGA RECOVERY IV Drip",
      description: "Our most comprehensive recovery formula combining multiple vitamins, minerals, and antioxidants. Ideal for post-workout, post-surgery, or general recovery needs.",
      benefits: ["Maximum recovery", "Peak performance", "Complete rejuvenation"]
    }
  ];

  return (
    <>
      <SEO 
        title={pageTitle}
        description={pageDescription}
        canonical="https://www.nius.cz/iv-drip-therapy-prague"
        ogImage="https://www.nius.cz/og-image.jpg"
        ogType="website"
        schema={schema}
      />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <Breadcrumbs items={[
            { label: "IV Drip Therapy", href: "/iv-drip-therapy-prague" }
          ]} />

          {/* Hero Section */}
          <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                  IV Drip Therapy in Prague
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Professional vitamin infusions delivered by registered nurses. Biotin, Glutathione, Vitamin C, and specialized recovery formulas for optimal wellness.
                </p>
                <div className="flex flex-wrap gap-4 justify-center pt-4">
                  <Button size="lg" asChild>
                    <a href="https://wa.me/420773629123">Book IV Therapy</a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="mailto:nius.prague@gmail.com">Email Us</a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Key Nutrients Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Key Nutrients & IV Treatments
                </h2>
                <p className="text-lg text-muted-foreground">
                  Specialized IV drip formulas tailored to your wellness needs
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {treatments.map((treatment, index) => {
                  const Icon = treatment.icon;
                  return (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                      <Icon className="w-12 h-12 text-primary mb-4" />
                      <h3 className="text-xl font-semibold mb-3">{treatment.title}</h3>
                      <p className="text-muted-foreground mb-4">{treatment.description}</p>
                      <ul className="space-y-2">
                        {treatment.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-1">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-20 px-4 bg-muted/50">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Why Choose IV Drip Therapy?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">100% Absorption</h3>
                  <p className="text-muted-foreground">
                    Unlike oral supplements, IV therapy delivers nutrients directly into your bloodstream for complete absorption and immediate effectiveness.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Fast Results</h3>
                  <p className="text-muted-foreground">
                    Feel the benefits within hours. IV therapy bypasses the digestive system for rapid nutrient delivery and quick symptom relief.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Professional Care</h3>
                  <p className="text-muted-foreground">
                    All IV drips administered by registered nurses in the comfort of your home, hotel, or office. Safe, sterile, and professional.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Customized Formulas</h3>
                  <p className="text-muted-foreground">
                    From immune support to beauty treatments, we offer specialized IV formulas tailored to your specific health and wellness goals.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                How It Works
              </h2>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Book Your Appointment</h3>
                    <p className="text-muted-foreground">
                      Contact us via WhatsApp or email to schedule your IV therapy session. Choose your preferred formula and location.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Nurse Arrives at Your Location</h3>
                    <p className="text-muted-foreground">
                      Our registered nurse comes to your home, hotel, or office with all necessary medical equipment and IV formula.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Relax During Treatment</h3>
                    <p className="text-muted-foreground">
                      The IV drip typically takes 30-60 minutes. Relax, work, or watch TV while the nutrients flow directly into your system.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Feel the Difference</h3>
                    <p className="text-muted-foreground">
                      Many clients report feeling energized and refreshed within hours. Results vary by treatment type and individual needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 px-4 bg-muted/50">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Is IV therapy safe?</h3>
                  <p className="text-muted-foreground">
                    Yes, IV therapy is safe when administered by trained medical professionals. All our nurses are registered and experienced in IV administration. We use sterile equipment and pharmaceutical-grade nutrients.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-2">How long does a session take?</h3>
                  <p className="text-muted-foreground">
                    Most IV drip sessions take 30-60 minutes depending on the formula. The nurse will stay with you throughout the entire treatment.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Which IV drip is right for me?</h3>
                  <p className="text-muted-foreground">
                    It depends on your goals. Vitamin C for immunity, Glutathione for detox and skin, Biotin for hair/nails, Cold & Flu for illness recovery, All-in-One for general wellness, and MEGA RECOVERY for intensive needs. Contact us for personalized recommendations.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-2">When will I feel the effects?</h3>
                  <p className="text-muted-foreground">
                    Many people feel energized and refreshed within a few hours. Some benefits like improved skin or hair health develop over time with regular treatments.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Do you come to hotels?</h3>
                  <p className="text-muted-foreground">
                    Yes! We provide IV therapy at your home, hotel, Airbnb, or office anywhere in Prague. Perfect for travelers and busy professionals.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Experience IV Therapy?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Book your IV drip session today and feel the difference of professional nutrient infusion therapy in Prague.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="https://wa.me/420773629123">Book on WhatsApp</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:nius.prague@gmail.com">Email for Consultation</a>
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

export default IVDripTherapy;
