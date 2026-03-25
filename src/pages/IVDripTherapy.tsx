import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StickyBookNow } from "@/components/StickyBookNow";
import { RelatedServices } from "@/components/RelatedServices";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
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
  MessageCircle,
  Calendar
} from "lucide-react";
import { getLanguageFromPath, getLanguagePrefix } from "@/utils/languageUtils";
import { useState } from "react";

const IVDripsPrague = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const phone = "+420773629123";
  const whatsappMessage = t('ivDripTherapy.whatsappMessage');
  const whatsappLink = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

  const pageTitle = t('ivDripTherapy.seo.title');
  const pageDescription = t('ivDripTherapy.seo.description');

  const hreflangMap: Record<string, string> = {
    cs: "https://www.nius.cz/iv-drips-prague/",
    en: "https://www.nius.cz/en/iv-drips-prague/",
    ru: "https://www.nius.cz/ru/iv-drips-prague/",
    uk: "https://www.nius.cz/uk/iv-drips-prague/",
  };


  const categoryKeys = ['immunity', 'energy', 'hydration', 'specialized'] as const;
  const categoryItemKeys: Record<string, string[]> = {
    immunity: ['immunityLite', 'immunityPower', 'defenseShield', 'glowPostFlu'],
    energy: ['ceoRecharge', 'metabolicReset', 'bPowerShot'],
    hydration: ['pureHydrate', 'electrolyteReset', 'nauseaRelief'],
    specialized: ['standardIron', 'premiumIron', 'nerveRegen', 'backacheRelief', 'allergyStop'],
  };

  const menu = categoryKeys.map(catKey => ({
    category: t(`ivDripTherapy.menu.categories.${catKey}.name`),
    catKey,
    items: categoryItemKeys[catKey].map(itemKey => ({
      name: t(`ivDripTherapy.menu.categories.${catKey}.items.${itemKey}.name`),
      priceCZK: Number(t(`ivDripTherapy.menu.categories.${catKey}.items.${itemKey}.price`)),
      durationMin: Number(t(`ivDripTherapy.menu.categories.${catKey}.items.${itemKey}.duration`)),
      short: t(`ivDripTherapy.menu.categories.${catKey}.items.${itemKey}.short`),
      includes: t(`ivDripTherapy.menu.categories.${catKey}.items.${itemKey}.includes`, { returnObjects: true }) as string[],
      popular: t(`ivDripTherapy.menu.categories.${catKey}.items.${itemKey}.popular`) === 'true' || t(`ivDripTherapy.menu.categories.${catKey}.items.${itemKey}.popular`) === true as any,
      bestFor: t(`ivDripTherapy.menu.categories.${catKey}.items.${itemKey}.bestFor`, { defaultValue: '' }),
    })),
  }));

  const filteredMenu = activeFilter === 'all'
    ? menu
    : menu.filter(cat => cat.catKey === activeFilter);

  const treatmentKeys = ['vitaminC', 'ceo', 'hydration', 'iron', 'defense', 'glow'] as const;
  const treatmentIcons = { vitaminC: Shield, ceo: Zap, hydration: Droplets, iron: Heart, defense: Activity, glow: Sparkles };

  const treatments = treatmentKeys.map(key => ({
    icon: treatmentIcons[key],
    title: t(`ivDripTherapy.treatments.items.${key}.title`),
    description: t(`ivDripTherapy.treatments.items.${key}.description`),
    benefits: t(`ivDripTherapy.treatments.items.${key}.benefits`, { returnObjects: true }) as string[],
    link: "#menu",
  }));

  const whyChooseKeys = ['fullService', 'availability', 'nurses', 'location', 'rating', 'english'] as const;
  const whyChooseIcons = { fullService: Award, availability: Clock, nurses: Shield, location: MapPin, rating: Star, english: Heart };

  const benefitKeys = ['faster', 'comesToYou', 'safety', 'customized'] as const;
  const benefitIcons = { faster: Zap, comesToYou: MapPin, safety: Shield, customized: Heart };

  const faqKeys = ['safe', 'duration', 'hotels', 'hangover', 'vitaminC', 'iron', 'cost', 'sameDay', 'districts', 'prescription'] as const;

  const stepKeys = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;

  const districts = t('ivDripTherapy.districts.list', { returnObjects: true }) as string[];
  const beforeItems = t('ivDripTherapy.preparation.before.items', { returnObjects: true }) as string[];
  const afterItems = t('ivDripTherapy.preparation.after.items', { returnObjects: true }) as string[];
  const contraindicationItems = t('ivDripTherapy.preparation.contraindications.items', { returnObjects: true }) as string[];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalBusiness",
        "name": "NIUS – IV Drips Prague",
        "description": pageDescription,
        "url": hreflangMap[currentLang] || hreflangMap.en,
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
        "openingHours": "Mo,Tu,We,Th,Fr,Sa,Su 08:00-20:00",
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
                  "url": `${hreflangMap[currentLang] || hreflangMap.en}#menu`,
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
            hreflangOverrides={hreflangMap}
            hreflangLanguages={["cs", "en", "ru", "uk"]}
        />

        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">
            <Breadcrumbs
                items={[
                  { label: t('ivDripTherapy.breadcrumbs.services'), href: "/#services" },
                  { label: t('ivDripTherapy.breadcrumbs.ivDripsPrague'), href: `${langPrefix}/iv-drips-prague/` },
                ]}
            />

            {/* Hero Section */}
            <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
              <div className="container mx-auto max-w-6xl">
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="font-medium">{t('ivDripTherapy.trustBadges.licensedNurses')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{t('ivDripTherapy.trustBadges.rating')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-medium">{t('ivDripTherapy.trustBadges.available')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-medium">{t('ivDripTherapy.trustBadges.allDistricts')}</span>
                  </div>
                </div>

                <div className="text-center space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    {t('ivDripTherapy.hero.h1')}
                  </h1>

                  <p className="text-xl md:text-2xl font-semibold text-primary">
                    {t('ivDripTherapy.hero.subtitle')}
                  </p>

                  <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: t('ivDripTherapy.hero.paragraph') }} />{" "}
                    <Link
                        to={`${langPrefix}/post-surgery-recovery-care-prague/`}
                        className="text-primary hover:underline font-medium"
                    >
                      {t('ivDripTherapy.hero.postSurgeryLink')}
                    </Link>.
                  </p>

                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background" />
                      <div className="w-8 h-8 rounded-full bg-primary/30 border-2 border-background" />
                      <div className="w-8 h-8 rounded-full bg-primary/40 border-2 border-background" />
                    </div>
                    <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('ivDripTherapy.hero.socialProof') }} />
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center pt-4">
                    <Button size="lg" className="text-lg px-8" asChild>
                      <a href={`tel:${phone}`} className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        {t('ivDripTherapy.hero.callBtn', { phone })}
                      </a>
                    </Button>
                    <Button size="lg" variant="default" className="text-lg px-8" asChild>
                      <a href={whatsappLink} className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        {t('ivDripTherapy.hero.whatsappBtn')}
                      </a>
                    </Button>
                    <Button size="lg" variant="default" className="text-lg px-8 bg-teal-600 hover:bg-teal-700" asChild>
                      <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {t('ivDripTherapy.hero.bookBtn')}
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                      <a href="#menu">{t('ivDripTherapy.hero.menuBtn')}</a>
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground pt-2">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {t('ivDripTherapy.hero.sessions')}
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {t('ivDripTherapy.hero.sameDay')}
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {t('ivDripTherapy.hero.equipment')}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Why Choose NIUS */}
            <section className="py-16 px-4 bg-muted/30">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {t('ivDripTherapy.whyChoose.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    {t('ivDripTherapy.whyChoose.subtitle')}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {whyChooseKeys.map(key => {
                    const Icon = whyChooseIcons[key];
                    return (
                      <Card key={key} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{t(`ivDripTherapy.whyChoose.cards.${key}.title`)}</h3>
                        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t(`ivDripTherapy.whyChoose.cards.${key}.description`) }} />
                      </Card>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Comparison Table */}
            <section className="py-16 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {t('ivDripTherapy.comparison.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {t('ivDripTherapy.comparison.subtitle')}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                    <tr className="border-b-2 border-primary">
                      <th className="text-left p-4 font-semibold">{t('ivDripTherapy.comparison.feature')}</th>
                      <th className="text-center p-4 font-semibold bg-primary/5">
                        <div className="text-primary text-lg">{t('ivDripTherapy.comparison.nius')}</div>
                      </th>
                      <th className="text-center p-4 font-semibold">{t('ivDripTherapy.comparison.otherMobile')}</th>
                      <th className="text-center p-4 font-semibold">{t('ivDripTherapy.comparison.hospitalClinic')}</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    <tr>
                      <td className="p-4 font-medium">{t('ivDripTherapy.comparison.rows.mobile')}</td>
                      <td className="text-center p-4 bg-primary/5"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                      <td className="text-center p-4"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                      <td className="text-center p-4 text-muted-foreground">✗</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('ivDripTherapy.comparison.rows.availability')}</td>
                      <td className="text-center p-4 bg-primary/5"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                      <td className="text-center p-4 text-muted-foreground">{t('ivDripTherapy.comparison.limitedHours')}</td>
                      <td className="text-center p-4 text-muted-foreground">{t('ivDripTherapy.comparison.erOnly')}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('ivDripTherapy.comparison.rows.nurses')}</td>
                      <td className="text-center p-4 bg-primary/5"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                      <td className="text-center p-4 text-muted-foreground">{t('ivDripTherapy.comparison.varies')}</td>
                      <td className="text-center p-4"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('ivDripTherapy.comparison.rows.ivf')}</td>
                      <td className="text-center p-4 bg-primary/5"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                      <td className="text-center p-4 text-muted-foreground">✗</td>
                      <td className="text-center p-4 text-muted-foreground">✗</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('ivDripTherapy.comparison.rows.postSurgery')}</td>
                      <td className="text-center p-4 bg-primary/5"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                      <td className="text-center p-4 text-muted-foreground">✗</td>
                      <td className="text-center p-4 text-muted-foreground">{t('ivDripTherapy.comparison.outpatientOnly')}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('ivDripTherapy.comparison.rows.sameDay')}</td>
                      <td className="text-center p-4 bg-primary/5"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                      <td className="text-center p-4 text-muted-foreground">{t('ivDripTherapy.comparison.sometimes')}</td>
                      <td className="text-center p-4 text-muted-foreground">{t('ivDripTherapy.comparison.longWait')}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('ivDripTherapy.comparison.rows.pricing')}</td>
                      <td className="text-center p-4 bg-primary/5"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                      <td className="text-center p-4"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                      <td className="text-center p-4 text-muted-foreground">{t('ivDripTherapy.comparison.variableFees')}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('ivDripTherapy.comparison.rows.english')}</td>
                      <td className="text-center p-4 bg-primary/5"><CheckCircle2 className="w-6 h-6 text-primary mx-auto" /></td>
                      <td className="text-center p-4 text-muted-foreground">{t('ivDripTherapy.comparison.varies')}</td>
                      <td className="text-center p-4 text-muted-foreground">{t('ivDripTherapy.comparison.limited')}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">{t('ivDripTherapy.comparison.rows.sessionTime')}</td>
                      <td className="text-center p-4 bg-primary/5">{t('ivDripTherapy.comparison.sessionNius')}</td>
                      <td className="text-center p-4">{t('ivDripTherapy.comparison.sessionOther')}</td>
                      <td className="text-center p-4">{t('ivDripTherapy.comparison.sessionHospital')}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-center mt-8">
                  <Button size="lg" asChild>
                    <a href={whatsappLink}>{t('ivDripTherapy.comparison.bookNow')}</a>
                  </Button>
                </div>
              </div>
            </section>

            {/* Menu & Prices */}
            <section id="menu" className="py-20 px-4 bg-muted/50">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {t('ivDripTherapy.menu.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: t('ivDripTherapy.menu.subtitle') }} />

                  {/* Filter Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center mt-8">
                    {[
                      { key: 'all', label: t('ivDripTherapy.menu.filterAll') },
                      ...categoryKeys.map(k => ({ key: k, label: t(`ivDripTherapy.menu.categories.${k}.name`) }))
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          activeFilter === f.key
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-12">
                  {filteredMenu.map((cat) => (
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
                                      {t('ivDripTherapy.menu.mostPopular')}
                                    </div>
                                )}

                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div>
                                    <h4 className="text-xl font-semibold">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {item.durationMin < 45 ? `~${item.durationMin}` : item.durationMin === 60 ? '~60' : '45–60'} {t('ivDripTherapy.menu.minutes')}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">
                                      {item.priceCZK && item.priceCZK > 0 ? `${item.priceCZK} Kč` : t('ivDripTherapy.menu.onRequest')}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      ≈ €{Math.round(item.priceCZK / 25)}
                                    </div>
                                  </div>
                                </div>

                                <p className="text-muted-foreground mb-3 leading-relaxed">{item.short}</p>

                                {item.bestFor && (
                                  <div className="mb-4">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                      {t('ivDripTherapy.menu.bestForLabel')}: {item.bestFor}
                                    </span>
                                  </div>
                                )}

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
                                  <a href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(t('ivDripTherapy.menu.bookMessage', { drip: item.name }))}`}>
                                    {t('ivDripTherapy.menu.book')} {item.name}
                                  </a>
                                </Button>
                              </Card>
                          ))}
                        </div>
                      </div>
                  ))}
                </div>

                <div className="text-center mt-12 space-y-4">
                  <p className="text-sm text-muted-foreground max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t('ivDripTherapy.menu.medicalScreening') }} />
                  <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('ivDripTherapy.menu.pricingNote') }} />
                </div>
              </div>
            </section>

            {/* Key Nutrients & Treatments */}
            <section className="py-20 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {t('ivDripTherapy.treatments.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: t('ivDripTherapy.treatments.subtitle') }} />
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
                            <a href={treatment.link}>{t('ivDripTherapy.treatments.viewPricing')}</a>
                          </Button>
                        </Card>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-4 bg-muted/50">
              <div className="container mx-auto max-w-6xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                  {t('ivDripTherapy.benefits.title')}
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {benefitKeys.map(key => {
                    const Icon = benefitIcons[key];
                    return (
                      <Card key={key} className="p-8 hover:shadow-lg transition-shadow">
                        <Icon className="w-10 h-10 text-primary mb-4" />
                        <h3 className="text-2xl font-semibold mb-4">{t(`ivDripTherapy.benefits.${key}.title`)}</h3>
                        {key === 'safety' ? (
                          <p className="text-muted-foreground leading-relaxed">
                            <span dangerouslySetInnerHTML={{ __html: t(`ivDripTherapy.benefits.safety.description`) }} />{" "}
                            <Link to={`${langPrefix}/ivf-support-prague/`} className="text-primary hover:underline font-medium">
                              {t('ivDripTherapy.benefits.safety.ivfLink')}
                            </Link>{" "}
                            and{" "}
                            <Link to={`${langPrefix}/disabled-daily-care-prague/`} className="text-primary hover:underline font-medium">
                              {t('ivDripTherapy.benefits.safety.nursingLink')}
                            </Link>.
                          </p>
                        ) : (
                          <p className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t(`ivDripTherapy.benefits.${key}.description`) }} />
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-4">
              <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                  {t('ivDripTherapy.howItWorks.title')}
                </h2>
                <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                  {t('ivDripTherapy.howItWorks.subtitle')}
                </p>

                <div className="space-y-8">
                  {stepKeys.map((stepKey, index) => (
                    <div key={stepKey} className="flex gap-6 items-start">
                      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-2">
                        <h3 className="text-2xl font-semibold mb-3">{t(`ivDripTherapy.howItWorks.${stepKey}.title`)}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: t(`ivDripTherapy.howItWorks.${stepKey}.description`, { phone }) }} />
                        {stepKey === 'step1' && (
                          <div className="flex gap-3">
                            <Button size="sm" asChild>
                              <a href={`tel:${phone}`}>{t('ivDripTherapy.howItWorks.step1.callNow')}</a>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={whatsappLink}>{t('ivDripTherapy.howItWorks.step1.whatsapp')}</a>
                            </Button>
                          </div>
                        )}
                        {stepKey === 'step5' && (
                          <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('ivDripTherapy.howItWorks.step5.tip') }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Preparation */}
            <section className="py-16 px-4 bg-muted/50">
              <div className="container mx-auto max-w-4xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                  {t('ivDripTherapy.preparation.title')}
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                      {t('ivDripTherapy.preparation.before.title')}
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      {beforeItems.map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                      {t('ivDripTherapy.preparation.after.title')}
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      {afterItems.map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                <Card className="p-6 mt-8 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-amber-600" />
                    {t('ivDripTherapy.preparation.contraindications.title')}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {t('ivDripTherapy.preparation.contraindications.description')}
                  </p>
                  <ul className="space-y-2 text-muted-foreground mb-4">
                    {contraindicationItems.map((item, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-amber-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('ivDripTherapy.preparation.contraindications.note') }} />
                </Card>
              </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4">
              <div className="container mx-auto max-w-4xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                  {t('ivDripTherapy.faq.title')}
                </h2>
                <p className="text-center text-lg text-muted-foreground mb-12">
                  {t('ivDripTherapy.faq.subtitle')}
                </p>

                <div className="space-y-6">
                  {faqKeys.map(key => (
                    <Card key={key} className="p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-semibold mb-3">{t(`ivDripTherapy.faq.items.${key}.question`)}</h3>
                      <p className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t(`ivDripTherapy.faq.items.${key}.answer`) }} />
                    </Card>
                  ))}
                </div>
              </div>

              <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      "mainEntity": faqKeys.slice(0, 5).map(key => ({
                        "@type": "Question",
                        "name": t(`ivDripTherapy.faq.items.${key}.question`),
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": t(`ivDripTherapy.faq.items.${key}.answer`).replace(/<[^>]*>/g, '')
                        }
                      }))
                    })
                  }}
              />
            </section>

            {/* Districts */}
            <section className="py-16 px-4 bg-muted/50">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    {t('ivDripTherapy.districts.title')}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {t('ivDripTherapy.districts.subtitle')}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {districts.map((district) => (
                      <Card key={district} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="font-medium">{district}</span>
                        </div>
                      </Card>
                  ))}
                </div>

                <div className="text-center mt-10">
                  <p className="text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: t('ivDripTherapy.districts.serviceArea') }} />
                  <Button size="lg" asChild>
                    <a href={whatsappLink}>{t('ivDripTherapy.districts.bookBtn')}</a>
                  </Button>
                </div>
              </div>
            </section>

            <RelatedServices />

            {/* CTA */}
            <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
              <div className="container mx-auto max-w-4xl text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {t('ivDripTherapy.cta.title')}
                </h2>
                <p className="text-xl text-muted-foreground mb-4">
                  {t('ivDripTherapy.cta.subtitle')}
                </p>
                <p className="text-lg text-muted-foreground mb-8">
                  {t('ivDripTherapy.cta.description')}
                </p>

                <div className="flex flex-wrap gap-4 justify-center mb-8">
                  <Button size="lg" className="text-lg px-8" asChild>
                    <a href={`tel:${phone}`} className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      {t('ivDripTherapy.cta.callBtn', { phone })}
                    </a>
                  </Button>
                  <Button size="lg" className="text-lg px-8" asChild>
                    <a href={whatsappLink} className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      {t('ivDripTherapy.cta.whatsappBtn')}
                    </a>
                  </Button>
                  <Button size="lg" className="text-lg px-8 bg-teal-600 hover:bg-teal-700" asChild>
                    <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {t('ivDripTherapy.cta.bookBtn')}
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <a href="mailto:info@nius.cz">{t('ivDripTherapy.cta.emailBtn')}</a>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  {t('ivDripTherapy.cta.hours')}
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
