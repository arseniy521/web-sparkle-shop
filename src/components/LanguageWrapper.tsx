import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LanguageWrapperProps {
  language: string;
  children: React.ReactNode;
}

export const LanguageWrapper = ({ language, children }: LanguageWrapperProps) => {
  const { i18n } = useTranslation();
  const location = useLocation();

  // Change language in useEffect to avoid setState during render
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n, location]);

  return <>{children}</>;
};
