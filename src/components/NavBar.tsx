import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Phone, Menu, X, UserCircle, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLanguageFromPath, getLanguagePrefix, getLocalizedUrl, getBasePath, buildLanguageUrl } from "@/utils/languageUtils";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { onboardingCart, useOnboardingCart } from "@/hooks/useOnboardingCart";
import { APP_NIUS_CABINET_URL, APP_NIUS_LOGIN_URL, NIUS_SITE_URL } from "@/constants/siteContacts";

const ALLOWED_RETURN_ORIGINS = new Set(['https://www.nius.cz', 'https://nius.cz']);

export const NavBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const authStatus = useAuthStatus(showAccount);
  const { codes: cartCodes } = useOnboardingCart();
  const cartCount = cartCodes.length;

  useEffect(() => {
    try {
      setShowAccount(localStorage.getItem('debug') === 'true');
    } catch {
      setShowAccount(false);
    }
  }, []);

  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const czechOnlyPages = ['/sestricka-praha-vinohrady', '/sestricka-praha-1', '/sestricka-praha-zizkov'];

  const handleLanguageChange = (newLang: string) => {
    const localizedUrl = getLocalizedUrl(location.pathname, newLang);
    if (localizedUrl) {
      navigate(localizedUrl);
    } else {
      const basePath = getBasePath(location.pathname);
      const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
      if (czechOnlyPages.includes(cleanBase) && newLang !== 'cs') {
        const prefix = getLanguagePrefix(newLang);
        navigate(prefix ? `${prefix}/` : '/');
      } else {
        const newUrl = buildLanguageUrl(basePath, newLang);
        navigate(newUrl);
      }
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const isHomePage = location.pathname === "/" || location.pathname === `${langPrefix}/` || location.pathname === langPrefix;

  const navLinks = [
    { href: "#menu", label: t('nav.servicesPricing') },
    { href: "#how-it-works", label: t('nav.workflow') },
    { href: "#our-nurses", label: t('nav.ourNurses') },
    { href: "#testimonials", label: t('nav.testimonials') },
  ];

  const langLabels: Record<string, string> = { cs: 'CZ', en: 'EN', ru: 'RU', uk: 'УКР' };
  const browserOrigin = typeof window === 'undefined' ? null : window.location.origin;
  const returnToOrigin = browserOrigin && ALLOWED_RETURN_ORIGINS.has(browserOrigin) ? browserOrigin : NIUS_SITE_URL;
  const returnTo = `${returnToOrigin}${location.pathname}${location.search}${location.hash}`;
  const isAccountLoading = authStatus === 'loading';
  const accountHref = authStatus === 'authenticated'
    ? APP_NIUS_CABINET_URL
    : `${APP_NIUS_LOGIN_URL}?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <header
      role="banner"
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b`}
      style={{
        background: 'rgba(245,244,238,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottomColor: 'var(--color-border)',
        borderBottomWidth: '0.5px',
        padding: isScrolled ? '12px 40px' : '18px 40px',
      }}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-indigo focus:text-white focus:px-4 focus:py-2 focus:rounded">
        Skip to content
      </a>
      <nav role="navigation" aria-label="Main navigation" className="flex items-center justify-between max-w-[1400px] mx-auto">
        <Link
          to={langPrefix ? `${langPrefix}/` : "/"}
          className="flex items-center gap-2 group"
          onClick={(e) => {
            if (isHomePage) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <img src="/brand/logo-wordmark-dark.svg" alt="NIUS" height="56" className="h-14" />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href + link.label}>
              {isHomePage ? (
                <a
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  className="text-sm font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-indigo)] transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={`${langPrefix ? `${langPrefix}/` : '/'}${link.href}`}
                  className="text-sm font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-indigo)] transition-colors"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1">
            {(['cs', 'en', 'ru', 'uk'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2 py-1 text-xs font-medium font-body rounded transition-colors ${
                  currentLang === lang
                    ? 'bg-[var(--color-indigo)] text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-indigo)]'
                }`}
              >
                {langLabels[lang]}
              </button>
            ))}
          </div>

          {showAccount && (
            <button
              type="button"
              onClick={() => onboardingCart.openForm()}
              aria-label={t('nav.cart')}
              className="relative hidden md:inline-flex items-center justify-center p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-indigo)] transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[var(--color-indigo)] text-white text-[10px] font-semibold leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {showAccount && (
            isAccountLoading ? (
              <button
                type="button"
                disabled
                aria-label={t('nav.account')}
                className="hidden md:inline-flex items-center justify-center p-2 rounded-full text-[var(--color-text-secondary)] opacity-60 cursor-wait"
              >
                <UserCircle className="h-5 w-5" />
              </button>
            ) : (
              <a
                href={accountHref}
                aria-label={t('nav.account')}
                className="hidden md:inline-flex items-center justify-center p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-indigo)] transition-colors"
              >
                <UserCircle className="h-5 w-5" />
              </a>
            )
          )}

          <a href="tel:+420773629123" className="hidden lg:flex items-center gap-1.5 text-sm font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-indigo)] transition-colors">
            <Phone className="h-3.5 w-3.5" />
            +420 773 629 123
          </a>

          <a
            href="https://wa.me/420773629123"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center px-4 py-2 rounded text-sm font-medium font-body text-white transition-colors"
            style={{ backgroundColor: 'var(--color-indigo)' }}
          >
            WhatsApp
          </a>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden pt-4 pb-4 animate-fade-in">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href + link.label}>
                {isHomePage ? (
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href); setIsMobileMenuOpen(false); }}
                    className="block py-2 text-sm font-medium font-body text-[var(--color-text-secondary)]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={`${langPrefix ? `${langPrefix}/` : '/'}${link.href}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium font-body text-[var(--color-text-secondary)]"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
            <li className="pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-1 mb-3">
                {(['cs', 'en', 'ru', 'uk'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      currentLang === lang
                        ? 'bg-[var(--color-indigo)] text-white'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-indigo)]'
                    }`}
                  >
                    {langLabels[lang]}
                  </button>
                ))}
              </div>
              {showAccount && (
                <button
                  type="button"
                  onClick={() => { onboardingCart.openForm(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 py-2 mb-3 text-sm font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-indigo)] transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {t('nav.cart')}
                  {cartCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[var(--color-indigo)] text-white text-[10px] font-semibold leading-none">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              {showAccount && (
                isAccountLoading ? (
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 py-2 mb-3 text-sm font-medium font-body text-[var(--color-text-secondary)] opacity-60 cursor-wait"
                  >
                    <UserCircle className="h-4 w-4" />
                    {t('nav.account')}
                  </button>
                ) : (
                  <a
                    href={accountHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 mb-3 text-sm font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-indigo)] transition-colors"
                  >
                    <UserCircle className="h-4 w-4" />
                    {t('nav.account')}
                  </a>
                )
              )}
              <a
                href="https://wa.me/420773629123"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2.5 rounded text-sm font-medium font-body text-white"
                style={{ backgroundColor: 'var(--color-indigo)' }}
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};
