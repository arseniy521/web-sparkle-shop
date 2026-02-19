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
  Cake,
  Building2,
} from "lucide-react";
import { getLanguagePrefix } from "@/utils/languageUtils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BirthdayGift = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const langPrefix = getLanguagePrefix(currentLang);

  const phone = "+420773629123";
  const whatsappLink = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    currentLang === "ru"
      ? "Здравствуйте! Хочу заказать подарочный сертификат на день рождения — Glow IV капельницу."
      : currentLang === "cs"
        ? "Dobrý den! Chci objednat dárkový voucher k narozeninám — Glow IV infuzi."
        : "Hi! I'd like to order a birthday gift voucher — Glow IV Drip."
  )}`;

  const hreflangMap: Record<string, string> = {
    cs: "https://www.nius.cz/narozeninovy-darek-praha",
    en: "https://www.nius.cz/en/birthday-gift-prague",
    ru: "https://www.nius.cz/ru/podatok-k-dnju-rozhdenija-praga",
  };

  // FAQ data for schema
  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"] as const;
  const faqItems = faqKeys.map((key) => ({
    question: t(`birthdayGift.faq.items.${key}.question`),
    answer: t(`birthdayGift.faq.items.${key}.answer`),
  }));

  // Schema markup
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Glow & Post-Flu IV Drip Birthday Gift Voucher — Prague",
      description: t("birthdayGift.seo.description"),
      brand: { "@type": "Brand", name: "NIUS — Nurse in Prague" },
      offers: {
        "@type": "Offer",
        price: "3650",
        priceCurrency: "CZK",
        availability: "https://schema.org/InStock",
        validFrom: "2026-01-01",
        priceValidUntil: "2026-12-31",
        url: hreflangMap[currentLang] || hreflangMap.en,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "4",
        bestRating: "5",
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
      name: "NIUS — Nurse in Prague",
      telephone: phone,
      url: "https://www.nius.cz",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Prague",
        addressCountry: "CZ",
      },
      areaServed: { "@type": "City", name: "Prague" },
      openingHours: "Mo-Su 08:00-22:00",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "4",
        bestRating: "5",
      },
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

  const includedItems: string[] = t("birthdayGift.included.items", { returnObjects: true }) as string[];
  const corporateBenefits: string[] = t("birthdayGift.corporate.benefits", { returnObjects: true }) as string[];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title={t("birthdayGift.seo.title")}
        description={t("birthdayGift.seo.description")}
        keywords={t("birthdayGift.seo.keywords")}
        ogImage="https://www.nius.cz/og-image.jpg"
        ogType="product"
        schema={schema}
        hreflangOverrides={hreflangMap}
        hreflangLanguages={["cs", "en", "ru"]}
      />
      <Header />
      <Breadcrumbs items={[{ label: t("birthdayGift.breadcrumb") }]} />

      <main className="flex-1" role="main">
        {/* ========== SECTION 1: HERO ========== */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-amber-50 via-purple-50/30 to-background overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {(["nurses", "rating", "available", "districts"] as const).map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-amber-200 rounded-full text-xs font-medium text-amber-700"
                  >
                    {badge === "rating" && <Star className="h-3 w-3 fill-amber-500 text-amber-500" />}
                    {badge === "nurses" && <Shield className="h-3 w-3 text-amber-500" />}
                    {badge === "available" && <Clock className="h-3 w-3 text-amber-500" />}
                    {badge === "districts" && <MapPin className="h-3 w-3 text-amber-500" />}
                    {t(`birthdayGift.hero.trustBadges.${badge}`)}
                  </span>
                ))}
              </div>

              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                <Cake className="h-4 w-4" />
                {t("birthdayGift.hero.badge")}
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
                {t("birthdayGift.hero.title")}
              </h1>

              <p className="text-xl md:text-2xl text-amber-700/80 font-medium mb-4">
                {t("birthdayGift.hero.subtitle")}
              </p>

              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                {t("birthdayGift.hero.description")}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-amber-600 hover:bg-amber-700">
                    <Gift className="mr-2 h-5 w-5" />
                    {t("birthdayGift.hero.cta")}
                  </Button>
                </a>
                <a href="#included">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-amber-300 text-amber-700 hover:bg-amber-50">
                    <ChevronDown className="mr-2 h-5 w-5" />
                    {t("birthdayGift.hero.ctaSecondary")}
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
                {t("birthdayGift.benefits.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("birthdayGift.benefits.subtitle")}
              </p>
            </div>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefitKeys.map((key) => {
                const Icon = benefitIcons[key];
                return (
                  <Card
                    key={key}
                    className="p-6 border-amber-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">
                      {t(`birthdayGift.benefits.items.${key}.title`)}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(`birthdayGift.benefits.items.${key}.description`)}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========== SECTION 3: WHAT'S INCLUDED ========== */}
        <section id="included" className="py-16 md:py-20 bg-amber-50/50 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                  {t("birthdayGift.included.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("birthdayGift.included.subtitle")}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {includedItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-amber-100"
                  >
                    <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-secondary font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to={`${langPrefix}/iv-drips-prague`}>
                  <Button variant="link" className="text-amber-600 hover:text-amber-700">
                    {t("birthdayGift.included.learnMore")}
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
                  {t("birthdayGift.experience.title")}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("birthdayGift.experience.subtitle")}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {experienceSteps.map((step, i) => (
                  <div key={step} className="relative flex gap-4 p-6 bg-gradient-to-br from-white to-amber-50/50 rounded-2xl border border-amber-100">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-amber-600">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary mb-1">
                        {t(`birthdayGift.experience.steps.${step}.title`)}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {t(`birthdayGift.experience.steps.${step}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 5: VOUCHER DETAILS ========== */}
        <section className="py-16 md:py-20 bg-purple-50/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8">
                {t("birthdayGift.voucher.title")}
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {(["validity", "redeemable", "transferable", "personalized", "instant"] as const).map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-purple-100 shadow-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-secondary">
                      {t(`birthdayGift.voucher.${key}`)}
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
              <Card className="p-8 md:p-12 border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50/30 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                  {t("birthdayGift.pricing.title")}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t("birthdayGift.pricing.subtitle")}
                </p>

                <div className="mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-amber-600">
                    {t("birthdayGift.pricing.price")}
                  </span>
                  <span className="text-2xl font-medium text-amber-600 ml-2">
                    {t("birthdayGift.pricing.currency")}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-1">
                  {t("birthdayGift.pricing.approximateEur")} · {t("birthdayGift.pricing.perSession")}
                </p>
                <p className="text-sm font-medium text-green-600 mb-8">
                  {t("birthdayGift.pricing.includes")}
                </p>

                <div className="flex flex-col gap-3">
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full text-base py-6 bg-green-600 hover:bg-green-700">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {t("birthdayGift.pricing.ctaWhatsApp")}
                    </Button>
                  </a>
                  <a href={`tel:${phone}`}>
                    <Button size="lg" variant="outline" className="w-full text-base py-6 border-amber-300 text-amber-700 hover:bg-amber-50">
                      <Phone className="mr-2 h-5 w-5" />
                      {t("birthdayGift.pricing.ctaCall")}
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
              {t("birthdayGift.testimonials.title")}
            </h2>
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
              {testimonialKeys.map((key) => (
                <Card key={key} className="p-6 border-amber-100">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 italic">
                    "{t(`birthdayGift.testimonials.items.${key}.text`)}"
                  </p>
                  <div className="text-sm">
                    <span className="font-semibold text-secondary">
                      {t(`birthdayGift.testimonials.items.${key}.author`)}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      — {t(`birthdayGift.testimonials.items.${key}.location`)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SECTION 8: CORPORATE / B2B ========== */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-3xl p-8 md:p-12 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-secondary">
                      {t("birthdayGift.corporate.title")}
                    </h2>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground mb-8">
                  {t("birthdayGift.corporate.subtitle")}
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {corporateBenefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3 p-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-slate-700 hover:bg-slate-800">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t("birthdayGift.corporate.cta")}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 9: HOW TO ORDER ========== */}
        <section className="py-16 md:py-20 bg-amber-50/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t("birthdayGift.howToOrder.title")}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t("birthdayGift.howToOrder.subtitle")}
              </p>
            </div>
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
              {orderSteps.map((step, i) => (
                <div key={step} className="text-center">
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-amber-600">{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">
                    {t(`birthdayGift.howToOrder.steps.${step}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t(`birthdayGift.howToOrder.steps.${step}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== SECTION 10: FAQ ========== */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary text-center mb-12">
                {t("birthdayGift.faq.title")}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="bg-white border border-amber-100 rounded-xl px-6 data-[state=open]:border-amber-200"
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

        {/* ========== SECTION 11: FINAL CTA ========== */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-amber-100/50 to-purple-100/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t("birthdayGift.finalCta.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                {t("birthdayGift.finalCta.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t("birthdayGift.finalCta.whatsapp")}
                  </Button>
                </a>
                <a href={`tel:${phone}`}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-amber-300 text-amber-700 hover:bg-amber-50">
                    <Phone className="mr-2 h-5 w-5" />
                    {phone}
                  </Button>
                </a>
                <a href="mailto:info@nius.cz">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-amber-300 text-amber-700 hover:bg-amber-50">
                    <Mail className="mr-2 h-5 w-5" />
                    {t("birthdayGift.finalCta.email")}
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

export default BirthdayGift;
