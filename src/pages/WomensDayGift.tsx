import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Heart,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  Star,
  Gift,
  Phone,
  MessageCircle,
  Mail,
  ChevronDown,
  Droplets,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getIvDripsUrl } from "@/utils/languageUtils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const WOMENS_DAY_TARGET_TIMESTAMP = new Date("2026-03-08T00:00:00+01:00").getTime();

const WomensDayGift = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const phone = "+420773629123";
  const whatsappLink = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    currentLang === "ru"
      ? "Здравствуйте! Хочу заказать подарочный сертификат на 8 марта, капельницу «Витамины и минералы Классик»."
      : currentLang === "cs"
        ? "Dobrý den! Chci objednat dárkový voucher na 8. března: infuzi „Vitamíny a minerály Classic“."
        : "Hi! I'd like to order a Women's Day gift voucher: Vitamin & Mineral Classic IV Drip."
  )}`;

  const hreflangMap: Record<string, string> = {
    cs: "https://www.nius.cz/darek-8-brezna/",
    en: "https://www.nius.cz/en/womens-day-gift-prague/",
    ru: "https://www.nius.cz/ru/podarok-na-8-marta/",
  };

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPastDate, setIsPastDate] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = WOMENS_DAY_TARGET_TIMESTAMP - now.getTime();
      if (diff <= 0) {
        setIsPastDate(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // FAQ data for schema
  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"] as const;
  const faqItems = faqKeys.map((key) => ({
    question: t(`womensDayGift.faq.items.${key}.question`),
    answer: t(`womensDayGift.faq.items.${key}.answer`),
  }));

  // Schema markup
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Vitamin & Mineral Classic IV Drip Gift Voucher, Women's Day Prague",
      description: t("womensDayGift.seo.description"),
      image: "https://www.nius.cz/og-image.jpg",
      brand: { "@type": "Brand", name: "NIUS (Nurse in Prague)" },
      offers: {
        "@type": "Offer",
        price: "3750",
        priceCurrency: "CZK",
        availability: "https://schema.org/InStock",
        validFrom: "2026-02-01",
        priceValidUntil: "2026-05-31",
        url: hreflangMap[currentLang] || hreflangMap.en,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      name: "NIUS (Nurse in Prague)",
      telephone: phone,
      url: "https://www.nius.cz",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Praha",
        addressCountry: "CZ",
      },
      areaServed: { "@type": "City", name: "Prague" },
      openingHours: "Mo-Su 08:00-21:00",
    },
  ];

  const benefitKeys = ["unique", "luxury", "health", "professional", "convenient", "voucher"] as const;
  const benefitIcons = {
    unique: Sparkles,
    luxury: Heart,
    health: Droplets,
    professional: Shield,
    convenient: MapPin,
    voucher: Gift,
  };

  const experienceSteps = ["step1", "step2", "step3", "step4"] as const;
  const orderSteps = ["step1", "step2", "step3"] as const;
  const testimonialKeys = ["t1", "t2", "t3"] as const;

  const includedItems: string[] = t("womensDayGift.included.items", { returnObjects: true }) as string[];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title={t("womensDayGift.seo.title")}
        description={t("womensDayGift.seo.description")}
        keywords={t("womensDayGift.seo.keywords")}
        ogImage="https://www.nius.cz/og-image.jpg"
        ogType="product"
        schema={schema}
        hreflangOverrides={hreflangMap}
        hreflangLanguages={["cs", "en", "ru"]}
      />
      <Header />
      <Breadcrumbs items={[{ label: t("womensDayGift.breadcrumb") }]} />

      <main className="flex-1" role="main">
        {/* ========== SECTION 1: HERO + COUNTDOWN ========== */}
        <section className="relative py-16 md:py-24 bg-bone overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {(["nurses", "rating", "available", "districts"] as const).map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-indigo/20 rounded-full text-xs font-medium text-indigo"
                  >
                    {badge === "rating" && <Star className="h-3 w-3 fill-indigo text-indigo" />}
                    {badge === "nurses" && <Shield className="h-3 w-3 text-indigo" />}
                    {badge === "available" && <Clock className="h-3 w-3 text-indigo" />}
                    {badge === "districts" && <MapPin className="h-3 w-3 text-indigo" />}
                    {t(`womensDayGift.hero.trustBadges.${badge}`)}
                  </span>
                ))}
              </div>

              <span className="inline-block px-4 py-1.5 mb-6 bg-bone text-indigo rounded-full text-sm font-semibold">
                {t("womensDayGift.hero.badge")}
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
                {t("womensDayGift.hero.title")}
              </h1>

              <p className="text-xl md:text-2xl text-indigo font-medium mb-4">
                {t("womensDayGift.hero.subtitle")}
              </p>

              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                {t("womensDayGift.hero.description")}
              </p>

              {/* Countdown Timer */}
              <div className="mb-10">
                {isPastDate ? (
                  <p className="text-lg font-medium text-indigo">
                    {t("womensDayGift.countdown.expired")}
                  </p>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-indigo uppercase tracking-wider mb-3">
                      {t("womensDayGift.countdown.title")}
                    </p>
                    <div className="flex justify-center gap-3 md:gap-4">
                      {([
                        { value: timeLeft.days, label: t("womensDayGift.countdown.days") },
                        { value: timeLeft.hours, label: t("womensDayGift.countdown.hours") },
                        { value: timeLeft.minutes, label: t("womensDayGift.countdown.minutes") },
                        { value: timeLeft.seconds, label: t("womensDayGift.countdown.seconds") },
                      ]).map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-indigo/20 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-2xl md:text-3xl font-bold text-indigo">
                              {String(item.value).padStart(2, "0")}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1.5">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-indigo hover:bg-indigo-deep">
                    <Gift className="mr-2 h-5 w-5" />
                    {t("womensDayGift.hero.cta")}
                  </Button>
                </a>
                <a href="#included">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-indigo/20 text-indigo hover:bg-bone">
                    <ChevronDown className="mr-2 h-5 w-5" />
                    {t("womensDayGift.hero.ctaSecondary")}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 2: BENEFITS ========== */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t("womensDayGift.benefits.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("womensDayGift.benefits.subtitle")}
              </p>
            </div>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefitKeys.map((key) => {
                const Icon = benefitIcons[key];
                return (
                  <Card
                    key={key}
                    className="p-6 border-indigo/20 hover:border-indigo/20 hover:shadow-lg hover:shadow-indigo/10 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-bone rounded-xl flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-indigo" />
                    </div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">
                      {t(`womensDayGift.benefits.items.${key}.title`)}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(`womensDayGift.benefits.items.${key}.description`)}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========== SECTION 3: WHAT'S INCLUDED ========== */}
        <section id="included" className="py-16 md:py-20 bg-bone scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                  {t("womensDayGift.included.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("womensDayGift.included.subtitle")}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {includedItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-indigo/20"
                  >
                    <CheckCircle2 className="h-5 w-5 text-indigo mt-0.5 flex-shrink-0" />
                    <span className="text-secondary font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to={getIvDripsUrl(currentLang)}>
                  <Button variant="link" className="text-indigo hover:text-indigo">
                    {t("womensDayGift.included.learnMore")}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 4: THE GIFT EXPERIENCE ========== */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                  {t("womensDayGift.experience.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("womensDayGift.experience.subtitle")}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {experienceSteps.map((step, i) => (
                  <div key={step} className="relative flex gap-4 p-6 bg-bone rounded-xl border border-indigo/20">
                    <div className="w-10 h-10 bg-bone rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-indigo">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary mb-1">
                        {t(`womensDayGift.experience.steps.${step}.title`)}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {t(`womensDayGift.experience.steps.${step}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 5: VOUCHER DETAILS ========== */}
        <section className="py-16 md:py-20 bg-bone">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8">
                {t("womensDayGift.voucher.title")}
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {(["validity", "redeemable", "transferable", "personalized", "instant"] as const).map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-indigo/20 shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-indigo flex-shrink-0" />
                    <span className="text-sm font-medium text-secondary">
                      {t(`womensDayGift.voucher.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 6: PRICING & CTA ========== */}
        <section id="pricing" className="py-16 md:py-20 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 md:p-12 border-2 border-indigo/20 bg-bone text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                  {t("womensDayGift.pricing.title")}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t("womensDayGift.pricing.subtitle")}
                </p>

                <div className="mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-indigo">
                    {t("womensDayGift.pricing.price")}
                  </span>
                  <span className="text-2xl font-medium text-indigo ml-2">
                    {t("womensDayGift.pricing.currency")}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-1">
                  {t("womensDayGift.pricing.approximateEur")} · {t("womensDayGift.pricing.perSession")}
                </p>
                <p className="text-sm font-medium text-green-600 mb-8">
                  {t("womensDayGift.pricing.includes")}
                </p>

                <div className="flex flex-col gap-3">
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full text-base py-6 bg-green-600 hover:bg-green-700">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {t("womensDayGift.pricing.ctaWhatsApp")}
                    </Button>
                  </a>
                  <a href={`tel:${phone}`}>
                    <Button size="lg" variant="outline" className="w-full text-base py-6 border-indigo/20 text-indigo hover:bg-bone">
                      <Phone className="mr-2 h-5 w-5" />
                      {t("womensDayGift.pricing.ctaCall")}
                    </Button>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ========== SECTION 7: TESTIMONIALS ========== */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-12">
              {t("womensDayGift.testimonials.title")}
            </h2>
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
              {testimonialKeys.map((key) => (
                <Card key={key} className="p-6 border-indigo/20">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-indigo text-indigo" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 italic">
                    "{t(`womensDayGift.testimonials.items.${key}.text`)}"
                  </p>
                  <div className="text-sm">
                    <span className="font-semibold text-secondary">
                      {t(`womensDayGift.testimonials.items.${key}.author`)}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {t(`womensDayGift.testimonials.items.${key}.location`)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SECTION 8: HOW TO ORDER ========== */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t("womensDayGift.howToOrder.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("womensDayGift.howToOrder.subtitle")}
              </p>
            </div>
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
              {orderSteps.map((step, i) => (
                <div key={step} className="text-center">
                  <div className="w-14 h-14 bg-bone rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-indigo">{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">
                    {t(`womensDayGift.howToOrder.steps.${step}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(`womensDayGift.howToOrder.steps.${step}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SECTION 9: FAQ ========== */}
        <section className="py-16 md:py-20 bg-bone">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-12">
                {t("womensDayGift.faq.title")}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="bg-white border border-indigo/20 rounded-xl px-6 data-[state=open]:border-indigo/20"
                  >
                    <AccordionTrigger className="text-left font-semibold text-secondary hover:no-underline py-5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ========== SECTION 10: FINAL CTA ========== */}
        <section className="py-16 md:py-20 bg-bone">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t("womensDayGift.finalCta.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                {t("womensDayGift.finalCta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t("womensDayGift.finalCta.whatsapp")}
                  </Button>
                </a>
                <a href={`tel:${phone}`}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-indigo/20 text-indigo hover:bg-bone">
                    <Phone className="mr-2 h-5 w-5" />
                    {phone}
                  </Button>
                </a>
                <a href="mailto:info@nius.cz">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-indigo/20 text-indigo hover:bg-bone">
                    <Mail className="mr-2 h-5 w-5" />
                    {t("womensDayGift.finalCta.email")}
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

export default WomensDayGift;
