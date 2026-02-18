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
  noindex?: boolean;
  hreflangLanguages?: string[];
  hreflangOverrides?: Record<string, string>;
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
  keywords,
  noindex = false,
  hreflangLanguages,
  hreflangOverrides
}: SEOProps) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentLang = i18n.language;
  const ogLocale = languageMap[currentLang] || 'en_US';
  const alternateLanguages = Object.keys(languageMap).filter(lang => lang !== currentLang);
  
  // Get base path without language prefix
  const basePath = getBasePath(location.pathname);
  
  // Generate canonical URL if not provided (prefer hreflangOverride for current lang)
  const canonicalUrl = canonical || hreflangOverrides?.[currentLang] || getCanonicalUrl(currentLang, basePath);
  
  // Generate alternate URLs for specified languages (or all by default)
  const baseUrl = 'https://www.nius.cz';
  const allLanguages = ['en', 'cs', 'ru', 'uk'];
  const activeLanguages = hreflangLanguages || allLanguages;
  const alternateUrls: Record<string, string> = {};
  for (const lang of activeLanguages) {
    alternateUrls[lang] = hreflangOverrides?.[lang] || `${baseUrl}${buildLanguageUrl(basePath, lang)}`;
  }

  return (
    <>
      <Helmet>
        <html lang={currentLang} />
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        {noindex && <meta name="robots" content="noindex, follow" />}
        <link rel="canonical" href={canonicalUrl} />

        {/* Hreflang tags for multilingual SEO */}
        {alternateUrls.en && <link rel="alternate" hrefLang="x-default" href={alternateUrls.en} />}
        {activeLanguages.map(lang => (
          <link key={lang} rel="alternate" hrefLang={lang} href={alternateUrls[lang]} />
        ))}
        
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
