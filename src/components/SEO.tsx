import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: string;
  schema?: object | object[];
  keywords?: string;
}

const languageMap: Record<string, string> = {
  en: 'en_US',
  cs: 'cs_CZ',
  ru: 'ru_RU',
  uk: 'uk_UA',
};

export const SEO = ({ 
  title, 
  description, 
  canonical, 
  ogImage = "https://www.nius.cz/og-image.jpg",
  ogType = "website",
  schema,
  keywords
}: SEOProps) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const ogLocale = languageMap[currentLang] || 'en_US';
  const alternateLanguages = Object.keys(languageMap).filter(lang => lang !== currentLang);

  return (
    <>
      <Helmet>
        <html lang={currentLang} />
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <link rel="canonical" href={canonical} />
        
        {/* Hreflang tags for multilingual SEO */}
        <link rel="alternate" hrefLang="x-default" href={canonical} />
        <link rel="alternate" hrefLang="en" href={canonical} />
        <link rel="alternate" hrefLang="cs" href={canonical} />
        <link rel="alternate" hrefLang="ru" href={canonical} />
        <link rel="alternate" hrefLang="uk" href={canonical} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Nurse in Prague" />
        <meta property="og:locale" content={ogLocale} />
        {alternateLanguages.map(lang => (
          <meta key={lang} property="og:locale:alternate" content={languageMap[lang]} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      
      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify(Array.isArray(schema) ? schema : schema)
        }} />
      )}
    </>
  );
};
