import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedServices } from "@/components/RelatedServices";
import { StickyBookNow } from "@/components/StickyBookNow";
import { Trans, useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  Clock,
  Droplets,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getLanguageFromPath, getLanguagePrefix, getLocalizedUrl } from "@/utils/languageUtils";
import { I18nSafeAnchor } from "@/utils/i18nSafeAnchor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  NIUS_BOOKING_URL,
  NIUS_PHONE_E164,
  NIUS_PHONE_WHATSAPP_DIGITS,
  NIUS_SITE_URL,
} from "@/constants/siteContacts";

const phone = NIUS_PHONE_E164;
const whatsappNumber = NIUS_PHONE_WHATSAPP_DIGITS;
const bookingUrl = NIUS_BOOKING_URL;
const siteUrl = NIUS_SITE_URL;
const supportedLanguages = ["cs", "en", "ru", "uk"] as const;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stripHtml(value: string): string {
  if (typeof DOMParser !== "undefined") {
    return new DOMParser().parseFromString(value, "text/html").body.textContent ?? "";
  }
  if (typeof document !== "undefined") {
    const element = document.createElement("div");
    element.innerHTML = value;
    return element.textContent ?? "";
  }
  return value.replace(/<[^>]*>/g, "");
}

const HangoverIVDripPrague = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  const hreflangMap = Object.fromEntries(
    supportedLanguages.map((lang) => [
      lang,
      `${siteUrl}${getLocalizedUrl("/hangover-iv-drip-prague", lang) ?? "/en/hangover-iv-drip-prague/"}`,
    ]),
  ) as Record<string, string>;

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    t("hangoverIVDrip.whatsappMessage")
  )}`;

  const symptomKeys = ["dehydration", "nausea", "fatigue", "brainFog"] as const;
  const symptomIcons = {
    dehydration: Droplets,
    nausea: Activity,
    fatigue: Zap,
    brainFog: Sparkles,
  };

  const alternativeKeys = ["pureHydrate", "electrolyteReset", "immunityLite"] as const;
  const stepKeys = ["step1", "step2", "step3", "step4"] as const;
  const testimonialKeys = ["t1", "t2", "t3"] as const;
  const faqKeys = ["howFast", "cost", "safe", "hotels", "whatsInside", "howLong", "prescription", "hours"] as const;
  const trustBadges: Array<readonly [string, LucideIcon]> = [
    ["licensedNurses", Shield],
    ["rating", Star],
    ["available", Clock],
    ["allDistricts", MapPin],
  ];

  const featuredIncludes = asStringArray(t("hangoverIVDrip.featured.includes", { returnObjects: true }));
  const faqItems = faqKeys.map((key) => ({
    key,
    question: t(`hangoverIVDrip.faq.items.${key}.question`),
    answer: t(`hangoverIVDrip.faq.items.${key}.answer`),
    answerKey: `hangoverIVDrip.faq.items.${key}.answer`,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalBusiness",
        name: "NIUS - Hangover IV Drip Prague",
        description: t("hangoverIVDrip.seo.description"),
        url: hreflangMap[currentLang] || hreflangMap.en,
        image: "https://www.nius.cz/og-image.jpg",
        telephone: phone,
        priceRange: "2450-2950 CZK",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Prague",
          addressCountry: "CZ",
        },
        areaServed: { "@type": "City", name: "Prague" },
        openingHours: "Mo-Su 08:00-20:00",
        medicalSpecialty: ["IV Therapy", "Mobile Nursing"],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: stripHtml(item.answer),
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t("hangoverIVDrip.seo.title")}
        description={t("hangoverIVDrip.seo.description")}
        keywords={t("hangoverIVDrip.seo.keywords")}
        ogImage="https://www.nius.cz/og-image.jpg"
        ogType="website"
        schema={schema}
        hreflangOverrides={hreflangMap}
        hreflangLanguages={["cs", "en", "ru", "uk"]}
      />
      <Header />

      <main className="flex-1">
        <Breadcrumbs
          items={[
            { label: t("hangoverIVDrip.breadcrumbs.services"), href: "/#services" },
            { label: t("hangoverIVDrip.breadcrumbs.ivDrips"), href: `${langPrefix}/iv-drips-prague/` },
            { label: t("hangoverIVDrip.breadcrumbs.hangover") },
          ]}
        />

        <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8 text-sm">
              {trustBadges.map(([key, Icon]) => (
                <div key={key} className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{t(`hangoverIVDrip.trustBadges.${key}`)}</span>
                </div>
              ))}
            </div>

            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t("hangoverIVDrip.hero.h1")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {t("hangoverIVDrip.hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a href={`tel:${phone}`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Phone className="mr-2 h-5 w-5" />
                    {t("hangoverIVDrip.hero.callBtn", { phone })}
                  </Button>
                </a>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t("hangoverIVDrip.hero.whatsappBtn")}
                  </Button>
                </a>
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    {t("hangoverIVDrip.hero.bookBtn")}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("hangoverIVDrip.symptoms.title")}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t("hangoverIVDrip.symptoms.subtitle")}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {symptomKeys.map((key) => {
                const Icon = symptomIcons[key];
                return (
                  <Card key={key} className="p-6">
                    <Icon className="h-9 w-9 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{t(`hangoverIVDrip.symptoms.items.${key}.title`)}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t(`hangoverIVDrip.symptoms.items.${key}.symptom`)}</p>
                    <p className="text-sm leading-relaxed">{t(`hangoverIVDrip.symptoms.items.${key}.solution`)}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <Card className="p-6 md:p-10 border-primary/20">
              <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
                <div>
                  <p className="text-sm font-semibold text-primary mb-2">{t("hangoverIVDrip.featured.title")}</p>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("hangoverIVDrip.featured.name")}</h2>
                  <p className="text-muted-foreground text-lg mb-6">{t("hangoverIVDrip.featured.short")}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {featuredIncludes.map((item) => (
                      <div key={item} className="flex gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:text-right">
                  <div className="text-4xl font-bold text-primary">
                    {t("hangoverIVDrip.featured.price")} {t("hangoverIVDrip.featured.currency")}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{t("hangoverIVDrip.featured.duration")}</div>
                  <div className="text-sm font-medium mt-4">{t("hangoverIVDrip.featured.priceNote")}</div>
                  <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t("hangoverIVDrip.featured.bookMessage"))}`} target="_blank" rel="noopener noreferrer">
                    <Button className="mt-6 w-full md:w-auto">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {t("hangoverIVDrip.featured.bookBtn")}
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("hangoverIVDrip.alternatives.title")}</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t("hangoverIVDrip.alternatives.subtitle")}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {alternativeKeys.map((key) => {
                const includes = asStringArray(t(`hangoverIVDrip.alternatives.items.${key}.includes`, { returnObjects: true }));
                return (
                  <Card key={key} className="p-6 flex flex-col">
                    <div className="text-xs font-semibold text-primary mb-3">{t(`hangoverIVDrip.alternatives.items.${key}.tag`)}</div>
                    <h3 className="text-2xl font-semibold mb-2">{t(`hangoverIVDrip.alternatives.items.${key}.name`)}</h3>
                    <div className="text-3xl font-bold mb-2">
                      {t(`hangoverIVDrip.alternatives.items.${key}.price`)} {t(`hangoverIVDrip.alternatives.items.${key}.currency`)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{t(`hangoverIVDrip.alternatives.items.${key}.short`)}</p>
                    <div className="space-y-2 mb-6 flex-1">
                      {includes.map((item) => (
                        <div key={item} className="flex gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t(`hangoverIVDrip.alternatives.items.${key}.bookMessage`))}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full">{t("hangoverIVDrip.alternatives.bookBtn")}</Button>
                    </a>
                  </Card>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground text-center mt-6">{t("hangoverIVDrip.alternatives.compareNote")}</p>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("hangoverIVDrip.howItWorks.title")}</h2>
              <p className="text-lg text-muted-foreground">{t("hangoverIVDrip.howItWorks.subtitle")}</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {stepKeys.map((key, index) => (
                <Card key={key} className="p-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold mb-2">{t(`hangoverIVDrip.howItWorks.steps.${key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground">{t(`hangoverIVDrip.howItWorks.steps.${key}.description`)}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <Card className="p-6 md:p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("hangoverIVDrip.whereWeCome.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                <Trans i18nKey="hangoverIVDrip.whereWeCome.description" components={{ strong: <strong /> }} />
              </p>
            </Card>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t("hangoverIVDrip.testimonials.title")}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonialKeys.map((key) => (
                <Card key={key} className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-4">"{t(`hangoverIVDrip.testimonials.items.${key}.text`)}"</p>
                  <p className="font-semibold">{t(`hangoverIVDrip.testimonials.items.${key}.author`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`hangoverIVDrip.testimonials.items.${key}.context`)}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("hangoverIVDrip.faq.title")}</h2>
              <p className="text-lg text-muted-foreground">{t("hangoverIVDrip.faq.subtitle")}</p>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item) => (
                <AccordionItem key={item.key} value={`faq-${item.key}`} className="border rounded-lg px-5">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-muted-foreground leading-relaxed">
                      <Trans
                        i18nKey={item.answerKey}
                        components={{
                          strong: <strong />,
                          a: <I18nSafeAnchor />,
                        }}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-16 md:py-20 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("hangoverIVDrip.cta.title")}</h2>
            <p className="text-lg opacity-90 mb-8">{t("hangoverIVDrip.cta.subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`tel:${phone}`}>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Phone className="mr-2 h-5 w-5" />
                  {t("hangoverIVDrip.cta.callBtn", { phone })}
                </Button>
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t("hangoverIVDrip.cta.whatsappBtn")}
                </Button>
              </a>
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  {t("hangoverIVDrip.cta.bookBtn")}
                </Button>
              </a>
            </div>
            <p className="text-sm opacity-80 mt-6">{t("hangoverIVDrip.cta.reassurance")}</p>
          </div>
        </section>

        <RelatedServices />
        <div className="px-4 py-10">
          <div className="container mx-auto max-w-5xl">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">{t("hangoverIVDrip.llmSummary.title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("hangoverIVDrip.llmSummary.content")}</p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <StickyBookNow />
    </div>
  );
};

export default HangoverIVDripPrague;
