// Language prefix mapping
export const languagePrefix: Record<string, string> = {
  en: '',
  cs: '/cz',
  ru: '/ru',
  uk: '/uk',
};

// Get the language prefix for a given language code
export const getLanguagePrefix = (lang: string): string => {
  return languagePrefix[lang] || '';
};

// Get the base path without language prefix
export const getBasePath = (pathname: string): string => {
  // Remove language prefix from pathname
  if (pathname.startsWith('/cz/') || pathname.startsWith('/cz')) {
    return pathname.replace('/cz', '');
  }
  if (pathname.startsWith('/ru/') || pathname.startsWith('/ru')) {
    return pathname.replace('/ru', '');
  }
  if (pathname.startsWith('/uk/') || pathname.startsWith('/uk')) {
    return pathname.replace('/uk', '');
  }
  return pathname;
};

// Get the current language from pathname
export const getLanguageFromPath = (pathname: string): string => {
  if (pathname.startsWith('/cz')) return 'cs';
  if (pathname.startsWith('/ru')) return 'ru';
  if (pathname.startsWith('/uk')) return 'uk';
  return 'en';
};

// Build URL with language prefix
export const buildLanguageUrl = (basePath: string, language: string): string => {
  const prefix = getLanguagePrefix(language);
  // Ensure basePath starts with / but not //
  const cleanPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return prefix ? `${prefix}${cleanPath}` : cleanPath;
};

// Get canonical URL based on language
export const getCanonicalUrl = (language: string, path: string = '/'): string => {
  const baseUrl = 'https://www.nius.cz';
  const prefix = getLanguagePrefix(language);
  const cleanPath = path === '/' ? '' : path;
  return `${baseUrl}${prefix}${cleanPath}`;
};
