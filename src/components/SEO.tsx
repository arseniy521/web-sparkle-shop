import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { getCanonicalUrl, getLanguagePrefix, getBasePath, buildLanguageUrl } from '@/utils/languageUtils';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
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
  const location = useLocation();
  const currentLang = i18n.language;
  const ogLocale = languageMap[currentLang] || 'en_US';
  const alternateLanguages = Object.keys(languageMap).filter(lang => lang !== currentLang);
  
  // Get base path without language prefix
  const basePath = getBasePath(location.pathname);
  
  // Generate canonical URL if not provided
  const canonicalUrl = canonical || getCanonicalUrl(currentLang, basePath);
  
  // Generate alternate URLs for all languages dynamically
  const baseUrl = 'https://www.nius.cz';
  const alternateUrls = {
    en: `${baseUrl}${buildLanguageUrl(basePath, 'en')}`,
    cs: `${baseUrl}${buildLanguageUrl(basePath, 'cs')}`,
    ru: `${baseUrl}${buildLanguageUrl(basePath, 'ru')}`,
    uk: `${baseUrl}${buildLanguageUrl(basePath, 'uk')}`,
  };

  return (
    <>
      <Helmet>
        <html lang={currentLang} />
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Hreflang tags for multilingual SEO */}
        <link rel="alternate" hrefLang="x-default" href={alternateUrls.en} />
        <link rel="alternate" hrefLang="en" href={alternateUrls.en} />
        <link rel="alternate" hrefLang="cs" href={alternateUrls.cs} />
        <link rel="alternate" hrefLang="ru" href={alternateUrls.ru} />
        <link rel="alternate" hrefLang="uk" href={alternateUrls.uk} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonicalUrl} />
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
