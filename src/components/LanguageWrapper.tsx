import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LanguageWrapperProps {
  language: string;
  children: React.ReactNode;
}

export const LanguageWrapper = ({ language, children }: LanguageWrapperProps) => {
  const { i18n } = useTranslation();
  const location = useLocation();

  // Set language synchronously BEFORE render for react-snap to capture correct meta tags
  useMemo(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Keep useEffect as fallback for runtime navigation
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n, location]);

  return <>{children}</>;
};
