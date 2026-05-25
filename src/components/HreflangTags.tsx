import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export const HreflangTags = () => {
  const location = useLocation();
  const baseUrl = 'https://www.nius.cz';
  
  // Extract current path without language prefix
  const getCurrentPath = () => {
    const path = location.pathname;
    // Remove language prefix if present
    const pathWithoutLang = path.replace(/^\/(cs|ru|uk)/, '');
    return pathWithoutLang || '/';
  };
  
  const currentPath = getCurrentPath();
  
  return (
    <Helmet>
      {/* Hreflang tags for language versions */}
      <link rel="alternate" hrefLang="en" href={`${baseUrl}${currentPath}`} />
      <link rel="alternate" hrefLang="cs" href={`${baseUrl}/cs${currentPath}`} />
      <link rel="alternate" hrefLang="ru" href={`${baseUrl}/ru${currentPath}`} />
      <link rel="alternate" hrefLang="uk" href={`${baseUrl}/uk${currentPath}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${currentPath}`} />
    </Helmet>
  );
};
