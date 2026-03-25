import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StickyBookNow } from "@/components/StickyBookNow";
import { RelatedServices } from "@/components/RelatedServices";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Droplets,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Activity,
  Clock,
  MapPin,
  CheckCircle2,
  Star,
  Award,
  Phone,
  MessageCircle
} from "lucide-react";
import { useEffect, useState } from "react";

const IVDripsPrague = () => {
  const { t } = useTranslation();
  const [recentBookings, setRecentBookings] = useState(3);

  // ✅ Exact-match title with primary keyword first
  const pageTitle = "IV Drips Prague | Mobile IV Therapy at Your Hotel/Home 24/7";
  const pageDescription =
      "Professional IV drips in Prague delivered to your hotel, home, or Airbnb by registered nurses. Vitamin C, Glutathione, Biotin, hydration & recovery IVs. Same-day service in Prague 1, Vinohrady, Old Town. Book 24/7.";

  const phone = "+420773629123";
  const whatsappLink = `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;

  // Simulate recent bookings counter
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentBookings(prev => (prev >= 8 ? 2 : prev + 1));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  /**
   * MENU: Exact prices and descriptions matching actual service offerings
   */
  const menu = [
    {
      category: "🛡️ Immunity & Recovery",
      items: [
        {
          name: "Immunity Lite",
          priceCZK: 2800,
          durationMin: 45,
          short: "Baseline Vitamin C boost for immune support and prevention.",
          includes: ["Vitamin C infusion", "Hydration support", "Registered nurse visit", "All equipment included"],
          popular: false,
        },
        {
          name: "Immunity Power",
          priceCZK: 3150,
          durationMin: 60,
          short: "High-dose Vitamin C (15g) for viral defense and intensive immune support.",
          includes: ["Vitamin C 15g high-dose", "Supportive hydration", "Registered nurse monitoring", "All sterile equipment"],
          popular: true,
        },
        {
          name: "Defense Shield (Hero)",
          priceCZK: 4250,
          durationMin: 60,
          short: "The ultimate flu & virus recovery with Vitamin C and trace elements.",
          includes: ["Vitamin C + trace elements", "Essential microelements", "Hydration therapy", "Registered nurse visit"],
          popular: true,
        },
        {
          name: "Glow & Post-Flu",
          priceCZK: 3650,
          durationMin: 60,
          short: "Recovery support for skin, hair, and immune resilience after illness.",
          includes: [
            "Microelements for skin & hair",
            "Immune support nutrients",
            "Trace elements & vitamins",
            "Registered nurse visit"
          ],
          popular: false,
        },
      ],
    },
    {
      category: "⚡ Energy & Performance",
      items: [
        {
          name: "CEO Recharge (Hero)",
          priceCZK: 4450,
          durationMin: 60,
          short: "Peak focus & mental clarity with B-Complex, minerals, and magnesium for high performers.",
          includes: ["B-Complex vitamins", "Essential minerals", "2000mg Magnesium", "Registered nurse visit"],
          popular: true,
        },
        {
          name: "Metabolic Reset",
          priceCZK: 3950,
          durationMin: 60,
          short: "Energy metabolism boost and detox support for overall vitality.",
          includes: ["Metabolic nutrients", "Detox support elements", "B-vitamins complex", "Registered nurse visit"],
          popular: false,
        },
        {
          name: "B-Power Shot",
          priceCZK: 1550,
          durationMin: 10,
          short: "Quick 900mcg B12 energy injection (intramuscular, 10 minutes only).",
          includes: ["Vitamin B12 900mcg IM", "Quick 10-minute procedure", "Registered nurse visit", "Immediate energy boost"],
          popular: false,
        },
      ],
    },
    {
      category: "💧 Hydration & Balance",
      items: [
        {
          name: "Pure Hydrate",
          priceCZK: 2450,
          durationMin: 45,
          short: "Rapid rehydration with 500ml–1000ml saline for dehydration relief.",
          includes: ["0.9% NaCl saline (500ml–1000ml)", "Rapid rehydration", "Registered nurse visit", "All equipment included"],
          popular: false,
        },
        {
          name: "Electrolyte Reset",
          priceCZK: 2950,
          durationMin: 45,
          short: "Hydration plus 2000mg Magnesium for muscle recovery and better sleep.",
          includes: ["Balanced electrolyte fluids", "2000mg Magnesium", "Muscle & sleep support", "Registered nurse visit"],
          popular: true,
        },
        {
          name: "Nausea Relief",
          priceCZK: 2850,
          durationMin: 45,
          short: "Rapid help for food poisoning, severe hangovers, or digestive distress.",
          includes: ["Anti-nausea medication", "Hydration support", "Electrolyte balance", "Registered nurse visit"],
          popular: false,
        },
      ],
    },
    {
      category: "🩸 Specialized Care",
      items: [
        {
          name: "Standard Iron",
          priceCZK: 2750,
          durationMin: 45,
          short: "Gentle iron replenishment with Ferrlecit for mild anemia.",
          includes: ["Ferrlecit iron infusion", "Gentle formula", "Registered nurse monitoring", "All equipment included"],
          popular: false,
        },
        {
          name: "Premium Iron",
          priceCZK: 6350,
          durationMin: 60,
          short: "High-potency iron infusion (Ferinject) for chronic fatigue and severe anemia.",
          includes: ["Ferinject high-potency iron", "Extended monitoring", "Registered nurse visit", "Post-treatment guidance"],
          popular: false,
        },
        {
          name: "Nerve Regen",
          priceCZK: 3350,
          durationMin: 45,
          short: "Back pain & neurological recovery support with B-Complex intramuscular injection.",
          includes: ["B-Complex IM injection", "Nerve support nutrients", "Pain relief support", "Registered nurse visit"],
          popular: false,
        },
        {
          name: "🦴 Backache Relief",
          priceCZK: 3250,
          durationMin: 45,
          short: "Acute muscle & nerve pain relief for back and joint discomfort.",
          includes: ["Pain relief medication", "Anti-inflammatory support", "Muscle relaxation", "Registered nurse visit"],
          popular: false,
        },
        {
          name: "🌸 Allergy Stop",
          priceCZK: 2650,
          durationMin: 45,
          short: "Rapid relief from allergic reactions and seasonal allergy symptoms.",
          includes: ["Antihistamine support", "Anti-inflammatory agents", "Symptom relief", "Registered nurse visit"],
          popular: false,
        },
      ],
    },
  ];

  const treatments = [
    {
      icon: Shield,
      title: "Vitamin C IV Drip Prague",
      description:
          "High-dose Vitamin C infusions (up to 15g) for immune system defense, viral protection, and faster recovery from illness.",
      benefits: ["Powerful immune support", "Viral defense", "Antioxidant protection"],
      link: "#menu",
    },
    {
      icon: Zap,
      title: "CEO Recharge IV Drip",
      description:
          "Peak mental performance formula with B-Complex, minerals, and magnesium. Designed for executives and high performers needing focus and clarity.",
      benefits: ["Enhanced mental clarity", "Improved focus", "Stress resilience"],
      link: "#menu",
    },
    {
      icon: Droplets,
      title: "Hydration & Electrolyte IV",
      description:
          "Medical-grade hydration therapy with electrolytes and magnesium. Perfect for hangovers, travel fatigue, dehydration, or muscle recovery.",
      benefits: ["Rapid rehydration", "Electrolyte balance", "Muscle recovery support"],
      link: "#menu",
    },
    {
      icon: Heart,
      title: "Iron Infusion Prague",
      description:
          "Gentle or high-potency iron infusions (Ferrlecit or Ferinject) for anemia, chronic fatigue, and iron deficiency treatment.",
      benefits: ["Treats iron deficiency", "Boosts energy levels", "Reduces fatigue"],
      link: "#menu",
    },
    {
      icon: Activity,
      title: "Defense Shield (Hero)",
      description:
          "Ultimate flu & virus recovery with Vitamin C and trace elements. Comprehensive support for cold/flu symptoms and post-illness recovery.",
      benefits: ["Complete flu recovery", "Trace element support", "Immune reinforcement"],
      link: "#menu",
    },
    {
      icon: Sparkles,
      title: "Glow & Post-Flu Recovery",
      description:
          "Recovery support for skin, hair, and immune resilience. Combines beauty nutrients with post-illness recovery elements.",
      benefits: ["Skin & hair support", "Post-illness recovery", "Immune resilience"],
      link: "#menu",
    },
  ];

  // ✅ Enhanced schema with more detail
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalBusiness",
        "name": "NIUS – IV Drips Prague",
        "description": pageDescription,
        "url": "https://www.nius.cz/iv-drips-prague/",
        "image": "https://www.nius.cz/og-image.jpg",
        "telephone": phone,
        "priceRange": "1550-6350 CZK",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Prague",
          "addressRegion": "Prague",
          "addressCountry": "CZ",
        },
        "areaServed": [
          { "@type": "City", "name": "Prague" },
          { "@type": "Place", "name": "Prague 1" },
          { "@type": "Place", "name": "Prague 2" },
          { "@type": "Place", "name": "Vinohrady" },
          { "@type": "Place", "name": "Old Town Prague" },
          { "@type": "Place", "name": "New Town Prague" },
        ],
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "50.0755",
          "longitude": "14.4378",
        },
        "openingHours": "Mo,Tu,We,Th,Fr,Sa,Su 00:00-23:59",
        "medicalSpecialty": ["IV Therapy", "Vitamin Infusion", "Mobile Nursing", "IV Drip Therapy"],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "4",
          "bestRating": "5",
          "worstRating": "4"
        }
      },
      {
        "@type": "OfferCatalog",
        "name": "IV Drips Prague Menu",
        "itemListElement": menu.flatMap((cat) =>
            cat.items
                .filter((i) => i.priceCZK && i.priceCZK > 0)
                .map((i) => ({
                  "@type": "Offer",
                  "name": i.name,
                  "price": i.priceCZK,
                  "priceCurrency": "CZK",
                  "description": i.short,
                  "url": "https://www.nius.cz/iv-drips-prague/#menu",
                  "availability": "https://schema.org/InStock",
                  "itemOffered": {
                    "@type": "Service",
                    "name": i.name,
                    "provider": {
                      "@type": "MedicalBusiness",
                      "name": "NIUS Prague"
                    }
                  }
                }))
        ),
      },
    ],
  };

  return (
      <>
        <SEO
            title={pageTitle}
            description={pageDescription}
            ogImage="https://www.nius.cz/og-image.jpg"
            ogType="website"
            schema={schema}
            canonical="https://www.nius.cz/iv-drips-prague/"
        />

        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">
            <Breadcrumbs
                items={[
                  { label: "Services", href: "/#services" },
                  { label: "IV Drips Prague", href: "/iv-drips-prague/" },
                ]}
            />

            {/* ✅ ENHANCED Hero Section with Social Proof */}
            <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
              <div className="container mx-auto max-w-6xl">
                {/* Trust Badge Bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="font-medium">Licensed Nurses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">4.9/5 Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-medium">24/7 Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-medium">All Prague Districts</span>
                  </div>
                </div>

                <div className="text-center space-y-6">
                  {/* ✅ H1 with exact keyword match + location */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    IV Drips Prague
                  </h1>

                  <p className="text-xl md:text-2xl font-semibold text-primary">
                    Mobile IV Therapy Delivered to Your Hotel, Home, or Airbnb
                  </p>

                  {/* ✅ Enhanced opening paragraph with keyword density + locations */}
                  <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                    Professional <strong>IV drips in Prague</strong> administered by registered nurses at your location.
                    We serve <strong>Prague 1, Prague 2, Vinohrady, Old Town, New Town</strong>, and all surrounding districts.
                    Choose from hydration, immunity, beauty, and recovery <strong>IV drips in Prague</strong> with same-day availability.
                    Perfect for medical tourists, expats, and travelers seeking{" "}
                    <Link
                        to="/post-surgery-recovery-care-prague/"
                        className="text-primary hover:underline font-medium"
                    >
                      post-surgery recovery care in Prague
                    </Link>.
                  </p>

                  {/* ✅ Social Proof Widget */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background" />
                      <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-background" />
                      <div className="w-8 h-8 rounded-full bg-primary/40 border-2 border-background" />
                    </div>
                    <span className="text-muted-foreground">
                    <strong className="text-foreground">{recentBookings} people</strong> booked IV drips in Prague today
                  </span>
                  </div>

                  {/* ✅ Dual CTA - Phone + WhatsApp */}
                  <div className="flex flex-wrap gap-4 justify-center pt-4">
                    <Button size="lg" className="text-lg px-8" asChild>
                      <a href={`tel:${phone}`} className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Call {phone}
                      </a>
                    </Button>
                    <Button size="lg" variant="default" className="text-lg px-8" asChild>
                      <a href={whatsappLink} className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Book on WhatsApp
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                      <a href="#menu">View Menu & Prices</a>
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    45–60 minute sessions
                  </span>
                    <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Same-day availability
                  </span>
                    <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    All equipment included
                  </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ✅ NEW: Why Choose NIUS? - Competitive Positioning */}
            <section className="py-16 px-4 bg-muted/30">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Why Choose NIUS for IV Drips in Prague?
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Prague's most trusted mobile IV therapy service for medical tourists, expats, and travelers since 2023
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Only Full-Service Mobile Clinic</h3>
                    <p className="text-muted-foreground">
                      Unlike other providers, we offer <strong>IV drips + IVF injection support + wound care + post-surgery recovery</strong>.
                      Complete medical care at your location.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">True 24/7 Availability</h3>
                    <p className="text-muted-foreground">
                      Actual round-the-clock service, not just "business hours". <strong>Same-day IV drips in Prague</strong> available
                      365 days a year, including weekends and holidays.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Registered Nurses, Not Technicians</h3>
                    <p className="text-muted-foreground">
                      All IV drips administered by <strong>fully licensed registered nurses</strong> with hospital experience.
                      Medical-grade protocols, sterile equipment, proper monitoring.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">We Come to ANY Location</h3>
                    <p className="text-muted-foreground">
                      Hotels (Four Seasons, Mandarin Oriental, etc.), Airbnbs, private homes, offices.
                      Serving <strong>all Prague districts</strong> within 20km of city center.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">4.9★ Patient Rating</h3>
                    <p className="text-muted-foreground">
                      Rated by real patients for professionalism, punctuality, and care quality.
                      Check our <strong>verified reviews on Google</strong>.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">English-Speaking Team</h3>
                    <p className="text-muted-foreground">
                      Fluent English communication for international patients.
                      Clear explanations, easy booking, no language barriers.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            {/* ✅ NEW: NIUS vs. Competitors Comparison */}
            <section className="py-16 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    NIUS vs. Other IV Drip Services in Prague
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Why medical tourists and expats choose NIUS for IV therapy in Prague
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                    <tr className="border-b-2 border-primary">
                      <th className="text-left p-4 font-semibold">Feature</th>
                      <th className="text-center p-4 font-semibold bg-primary/5">
                        <div className="text-primary text-lg">NIUS</div>
                      </th>
                      <th className="text-center p-4 font-semibold">Other Mobile Services</th>
                      <th className="text-center p-4 font-semibold">Hospital/Clinic</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    <tr>
                      <td className="p-4 font-medium">Mobile Service (Hotel/Home)</td>
                      <td className="text-center p-4 bg-primary/5">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4 text-muted-foreground">✗</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">True 24/7 Availability</td>
                      <td className="text-center p-4 bg-primary/5">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4 text-muted-foreground">Limited hours</td>
                      <td className="text-center p-4 text-muted-foreground">ER only</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Registered Nurses (Not Technicians)</td>
                      <td className="text-center p-4 bg-primary/5">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4 text-muted-foreground">Varies</td>
                      <td className="text-center p-4">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">IVF Injection Support</td>
                      <td className="text-center p-4 bg-primary/5">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4 text-muted-foreground">✗</td>
                      <td className="text-center p-4 text-muted-foreground">✗</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Post-Surgery Care</td>
                      <td className="text-center p-4 bg-primary/5">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4 text-muted-foreground">✗</td>
                      <td className="text-center p-4 text-muted-foreground">Outpatient only</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Same-Day Availability</td>
                      <td className="text-center p-4 bg-primary/5">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4 text-muted-foreground">Sometimes</td>
                      <td className="text-center p-4 text-muted-foreground">Long wait</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Transparent Pricing</td>
                      <td className="text-center p-4 bg-primary/5">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4 text-muted-foreground">Variable fees</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">English-Speaking Staff</td>
                      <td className="text-center p-4 bg-primary/5">
                        <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4 text-muted-foreground">Varies</td>
                      <td className="text-center p-4 text-muted-foreground">Limited</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Average Session Time</td>
                      <td className="text-center p-4 bg-primary/5">45–60 min</td>
                      <td className="text-center p-4">45–90 min</td>
                      <td className="text-center p-4">2–4 hours</td>
                    </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-center mt-8">
                  <Button size="lg" asChild>
                    <a href={whatsappLink}>Book Your IV Drip Now</a>
                  </Button>
                </div>
              </div>
            </section>

            {/* ✅ Menu & Prices Section */}
            <section id="menu" className="py-20 px-4 bg-muted/50">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    IV Drips Prague: Menu & Transparent Pricing
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    All prices in CZK include registered nurse visit, monitoring, equipment, and aftercare guidance.
                    Book same-day <strong>IV drips in Prague 1, Vinohrady, Old Town</strong>, or any Prague district.
                  </p>
                </div>

                <div className="space-y-12">
                  {menu.map((cat) => (
                      <div key={cat.category} className="space-y-6">
                        <h3 className="text-2xl md:text-3xl font-semibold text-center">{cat.category}</h3>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {cat.items.map((item) => (
                              <Card
                                  key={item.name}
                                  className={`p-6 relative hover:shadow-xl transition-all ${
                                      item.popular ? 'border-2 border-primary' : ''
                                  }`}
                              >
                                {item.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                                      Most Popular
                                    </div>
                                )}

                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div>
                                    <h4 className="text-xl font-semibold">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {item.durationMin}–60 minutes
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">
                                      {item.priceCZK && item.priceCZK > 0 ? `${item.priceCZK} Kč` : "On Request"}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      ≈ €{Math.round(item.priceCZK / 25)}
                                    </div>
                                  </div>
                                </div>

                                <p className="text-muted-foreground mb-4 leading-relaxed">{item.short}</p>

                                {item.includes?.length ? (
                                    <ul className="space-y-2 mb-6">
                                      {item.includes.map((x, idx) => (
                                          <li key={idx} className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                            <span>{x}</span>
                                          </li>
                                      ))}
                                    </ul>
                                ) : null}

                                <Button className="w-full" size="lg" asChild>
                                  <a href={whatsappLink}>Book {item.name}</a>
                                </Button>
                              </Card>
                          ))}
                        </div>
                      </div>
                  ))}
                </div>

                <div className="text-center mt-12 space-y-4">
                  <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                    <strong>Medical Screening Required:</strong> All IV drips in Prague require brief health screening.
                    Final composition may vary based on medical indication and doctor consultation (when needed).
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Pricing:</strong> 10% discount on packages of 2+ visits. Doctor prescription (if required): +900 CZK
                  </p>
                </div>
              </div>
            </section>

            {/* ✅ Key Nutrients & Treatments */}
            <section className="py-20 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Popular IV Drip Treatments in Prague
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    From <strong>Vitamin C IV drips</strong> to <strong>Glutathione infusions</strong> —
                    choose the right IV therapy for your health goals in Prague
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {treatments.map((treatment, index) => {
                    const Icon = treatment.icon;
                    return (
                        <Card key={index} className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                          <Icon className="w-12 h-12 text-primary mb-4" />
                          <h3 className="text-xl font-semibold mb-3">{treatment.title}</h3>
                          <p className="text-muted-foreground mb-4 flex-grow">{treatment.description}</p>
                          <ul className="space-y-2 mb-4">
                            {treatment.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span>{benefit}</span>
                                </li>
                            ))}
                          </ul>
                          <Button variant="outline" className="w-full mt-auto" asChild>
                            <a href={treatment.link}>View Pricing</a>
                          </Button>
                        </Card>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ✅ Benefits Section - Enhanced */}
            <section className="py-20 px-4 bg-muted/50">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                  Benefits of Mobile IV Drips in Prague
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="p-8 hover:shadow-lg transition-shadow">
                    <Zap className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-2xl font-semibold mb-4">Faster Than Pills or Drinks</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      IV drips deliver nutrients <strong>directly into your bloodstream</strong>, bypassing the digestive system.
                      100% bioavailability means faster results — ideal for rapid hydration, immune support, or recovery.
                    </p>
                  </Card>

                  <Card className="p-8 hover:shadow-lg transition-shadow">
                    <MapPin className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-2xl font-semibold mb-4">We Come to You in Prague</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      No waiting rooms, no traffic. Our nurses bring <strong>hospital-grade IV drips to your hotel, home, or Airbnb</strong> anywhere in Prague.
                      Same-day service in Prague 1, Vinohrady, Old Town, and beyond.
                    </p>
                  </Card>

                  <Card className="p-8 hover:shadow-lg transition-shadow">
                    <Shield className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-2xl font-semibold mb-4">Registered Nurses, Medical-Grade Safety</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      All IV drips in Prague administered by <strong>registered nurses with hospital experience</strong>.
                      Sterile equipment, proper monitoring, medical protocols. We also provide{" "}
                      <Link to="/ivf-support-prague/" className="text-primary hover:underline font-medium">
                        IVF injection support
                      </Link>{" "}
                      and{" "}
                      <Link to="/disabled-daily-care-prague/" className="text-primary hover:underline font-medium">
                        long-term nursing care
                      </Link>.
                    </p>
                  </Card>

                  <Card className="p-8 hover:shadow-lg transition-shadow">
                    <Heart className="w-10 h-10 text-primary mb-4" />
                    <h3 className="text-2xl font-semibold mb-4">Customized for Your Goals</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Whether you need <strong>hydration after travel</strong>, immune support during flu season,
                      beauty IV drips for events, or recovery support — we tailor each session to your health goals.
                    </p>
                  </Card>
                </div>
              </div>
            </section>

            {/* ✅ How It Works - More Visual */}
            <section className="py-20 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                  How Our IV Drip Service Works in Prague
                </h2>
                <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                  From booking to aftercare — here's what to expect with NIUS mobile IV therapy
                </p>

                <div className="space-y-8">
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg">
                      1
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-semibold mb-3">Contact Us & Choose Your IV Drip</h3>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        Call <strong>{phone}</strong> or message us on <strong>WhatsApp</strong>.
                        Tell us your location (hotel name, address in Prague), symptoms, and goals.
                        We'll recommend the best IV drip and confirm same-day availability.
                      </p>
                      <div className="flex gap-3">
                        <Button size="sm" asChild>
                          <a href={`tel:${phone}`}>Call Now</a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={whatsappLink}>WhatsApp</a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg">
                      2
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-semibold mb-3">Quick Health Screening</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We'll ask basic health questions (allergies, current medications, medical history).
                        This ensures your <strong>IV drip in Prague is safe and appropriate</strong> for your situation.
                        Doctor consultation arranged if needed (additional 900 CZK).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg">
                      3
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-semibold mb-3">Registered Nurse Arrives at Your Location</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Our nurse comes to your <strong>hotel, home, or Airbnb in Prague</strong> with all sterile equipment,
                        IV supplies, and emergency kit. Typical arrival time: <strong>1–3 hours for same-day bookings</strong>,
                        or schedule in advance for exact timing.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg">
                      4
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-semibold mb-3">45–60 Minute IV Therapy Session</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Relax during your IV drip. The nurse will insert the IV line, start the infusion,
                        and monitor you throughout. Most sessions take <strong>45–60 minutes</strong>.
                        Feel free to read, work, or rest during treatment.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg">
                      5
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-semibold mb-3">Aftercare Guidance & Payment</h3>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        After your IV drip, the nurse provides <strong>aftercare instructions</strong> and answers questions.
                        Payment via cash, card, or bank transfer. We'll follow up if you have any concerns.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Tip:</strong> Stay hydrated and avoid alcohol for 24 hours after IV therapy for best results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ✅ NEW: What to Expect / Preparation */}
            <section className="py-16 px-4 bg-muted/50">
              <div className="container mx-auto max-w-4xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                  Preparing for Your IV Drip in Prague
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                      Before Your Session
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Eat a light meal 1–2 hours before</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Drink water to stay hydrated</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Wear comfortable clothing with loose sleeves</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Have your medication list ready (if applicable)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Ensure nurse can access your location easily</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                      After Your Session
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Rest for 15–30 minutes before activities</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Drink plenty of water (2–3 liters over 24 hours)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Avoid alcohol for 24 hours</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Light exercise is fine; avoid intense workouts same day</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Contact us if you have any concerns or questions</span>
                      </li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-6 mt-8 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-amber-600" />
                    Contraindications & Safety
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    IV drips may not be suitable if you have:
                  </p>
                  <ul className="space-y-2 text-muted-foreground mb-4">
                    <li className="flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Severe kidney or heart disease (without medical approval)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Known allergies to IV components</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Uncontrolled high blood pressure</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Active cancer treatment (consult your oncologist first)</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    <strong>Important:</strong> Always disclose your full medical history during screening.
                    Our nurses will assess suitability before proceeding.
                  </p>
                </Card>
              </div>
            </section>

            {/* ✅ FAQ Section with Schema */}
            <section className="py-20 px-4">
              <div className="container mx-auto max-w-4xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                  Frequently Asked Questions About IV Drips in Prague
                </h2>
                <p className="text-center text-lg text-muted-foreground mb-12">
                  Everything you need to know about mobile IV therapy in Prague
                </p>

                <div className="space-y-6">
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">Are IV drips safe?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes, when administered by trained medical professionals. All our <strong>IV drips in Prague are performed by registered nurses</strong> using
                      sterile equipment and medical-grade protocols. We screen all patients before treatment and monitor throughout the session.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">How long does an IV drip take in Prague?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Most IV drip sessions take <strong>45–60 minutes</strong> including setup, infusion, and monitoring.
                      Complex formulas (like MEGA Recovery) may take up to 75 minutes. Same-day bookings available.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">Do you come to hotels in Prague?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Absolutely! We provide <strong>mobile IV drips at hotels, Airbnbs, private homes, and offices</strong> throughout Prague.
                      Popular hotels: Four Seasons, Mandarin Oriental, Hilton, any hotel in Prague 1, Vinohrady, Old Town, and beyond.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">What's the best IV drip for hangovers?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      For hangovers, try our <strong>Nausea Relief (2,850 CZK)</strong> for immediate symptom relief,
                      or <strong>Electrolyte Reset (2,950 CZK)</strong> with 2000mg Magnesium for hydration and muscle recovery.
                      Pure Hydrate (2,450 CZK) is also effective for rapid rehydration.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">Can I get Vitamin C IV drips in Prague?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes! We offer three levels: <strong>Immunity Lite (2,800 CZK)</strong> for baseline support,
                      <strong>Immunity Power (3,150 CZK)</strong> with 15g high-dose Vitamin C, and
                      <strong>Defense Shield Hero (4,250 CZK)</strong> for ultimate flu & virus recovery.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">Do you offer iron infusions in Prague?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes, we offer <strong>Standard Iron with Ferrlecit (2,750 CZK)</strong> for gentle iron replenishment
                      and <strong>Premium Iron with Ferinject (6,350 CZK)</strong> for high-potency treatment of chronic fatigue and severe anemia.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">How much do IV drips cost in Prague?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Prices range from <strong>1,550 CZK to 6,350 CZK</strong> (€60–€250) depending on the treatment.
                      Most popular IV drips are 2,450–4,450 CZK. All prices include nurse visit, equipment,
                      and monitoring. 10% discount on packages of 2+ visits. See our <a href="#menu" className="text-primary hover:underline">full menu above</a>.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">Can I get same-day IV drips in Prague?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Yes! We offer <strong>same-day IV drip service in Prague</strong> with typical arrival within 1–3 hours.
                      Available 24/7 including weekends and holidays. Book in advance for exact scheduling.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">Which Prague districts do you serve?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We serve <strong>all Prague districts</strong>: Prague 1, Prague 2, Vinohrady, Žižkov, Old Town, New Town,
                      Karlín, Holešovice, and surrounding areas within 20km of city center.
                    </p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold mb-3">Do I need a prescription for IV drips?</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Some IV formulas require a doctor's prescription or consultation (additional 900 CZK if needed).
                      We'll assess during health screening and arrange if necessary. Many formulas don't require prescription.
                    </p>
                  </Card>
                </div>
              </div>

              <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      "mainEntity": [
                        {
                          "@type": "Question",
                          "name": "Are IV drips safe?",
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, when administered by trained medical professionals. All our IV drips in Prague are performed by registered nurses using sterile equipment and medical-grade protocols. We screen all patients before treatment and monitor throughout the session."
                          }
                        },
                        {
                          "@type": "Question",
                          "name": "How long does an IV drip take in Prague?",
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Most IV drip sessions take 45–60 minutes including setup, infusion, and monitoring. Complex formulas may take up to 75 minutes. Same-day bookings available."
                          }
                        },
                        {
                          "@type": "Question",
                          "name": "Do you come to hotels in Prague?",
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Absolutely! We provide mobile IV drips at hotels, Airbnbs, private homes, and offices throughout Prague including Prague 1, Vinohrady, Old Town, and all other districts."
                          }
                        },
                        {
                          "@type": "Question",
                          "name": "How much do IV drips cost in Prague?",
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Prices range from 1,550 CZK to 6,350 CZK depending on the treatment. Most popular IV drips are 2,450–4,450 CZK. All prices include nurse visit, equipment, and monitoring. 10% discount on packages of 2+ visits."
                          }
                        },
                        {
                          "@type": "Question",
                          "name": "Can I get same-day IV drips in Prague?",
                          "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes! We offer same-day IV drip service in Prague with typical arrival within 1–3 hours. Available 24/7 including weekends and holidays."
                          }
                        }
                      ]
                    })
                  }}
              />
            </section>

            {/* ✅ Location-Specific Section */}
            <section className="py-16 px-4 bg-muted/50">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    IV Drips Across All Prague Districts
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Mobile IV therapy service available throughout Prague and surrounding areas
                  </p>
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    "Prague 1 (Old Town)",
                    "Prague 2 (Vinohrady, Nové Město)",
                    "Prague 3 (Žižkov, Vinohrady)",
                    "Prague 4 (Nusle, Podolí)",
                    "Prague 5 (Smíchov)",
                    "Prague 6 (Dejvice, Hradčany)",
                    "Prague 7 (Holešovice)",
                    "Prague 8 (Karlín, Libeň)",
                    "Prague 9 (Vysočany)",
                    "Prague 10 (Vršovice, Strašnice)",
                  ].map((district) => (
                      <Card key={district} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="font-medium">{district}</span>
                        </div>
                      </Card>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <p className="text-muted-foreground mb-4">
                    <strong>Service Area:</strong> All Prague districts plus surrounding areas within 20km of city center.
                    Hotels, Airbnbs, private homes, and offices.
                  </p>
                  <Button size="lg" asChild>
                    <a href={whatsappLink}>Book IV Drip in Your District</a>
                  </Button>
                </div>
              </div>
            </section>

            {/* Related Services */}
            <RelatedServices />

            {/* ✅ Enhanced CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
              <div className="container mx-auto max-w-4xl text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Book Your IV Drip in Prague?
                </h2>
                <p className="text-xl text-muted-foreground mb-4">
                  Same-day mobile IV therapy available 24/7 at your hotel, home, or Airbnb
                </p>
                <p className="text-lg text-muted-foreground mb-8">
                  Serving Prague 1, Vinohrady, Old Town, and all Prague districts • Registered nurses • 4.9★ rating
                </p>

                <div className="flex flex-wrap gap-4 justify-center mb-8">
                  <Button size="lg" className="text-lg px-8" asChild>
                    <a href={`tel:${phone}`} className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Call {phone}
                    </a>
                  </Button>
                  <Button size="lg" className="text-lg px-8" asChild>
                    <a href={whatsappLink} className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp Booking
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <a href="mailto:nius.prague@gmail.com">Email Us</a>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Available every day 8:00–20:00 • For urgent cases outside hours, please call directly
                </p>
              </div>
            </section>
          </main>

          <Footer />
          <StickyBookNow />
        </div>
      </>
  );
};

export default IVDripsPrague;