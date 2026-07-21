import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronDown, Phone, Menu, X, UserCircle, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLanguageFromPath, getLanguagePrefix, getLocalizedUrl, getBasePath, buildLanguageUrl } from "@/utils/languageUtils";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { onboardingCart, useOnboardingCart } from "@/hooks/useOnboardingCart";
import { APP_NIUS_CABINET_URL, APP_NIUS_LOGIN_URL, NIUS_SITE_URL } from "@/constants/siteContacts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { track, trackCtaClick, type ConversionSource } from "@/lib/analytics";

const ALLOWED_RETURN_ORIGINS = new Set(['https://www.nius.cz', 'https://nius.cz']);

const WhatsAppIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.574-1.472A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.17 0-4.183-.59-5.926-1.613l-.424-.253-2.715.874.866-2.634-.278-.44A9.77 9.77 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12s-4.4 9.818-9.818 9.818z" />
  </svg>
);

export const NavBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authStatus = useAuthStatus();
  const { codes: cartCodes } = useOnboardingCart();
  const cartCount = cartCodes.length;

  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const czechOnlyPages = ['/sestricka-praha-vinohrady', '/sestricka-praha-1', '/sestricka-praha-zizkov'];

  const handleLanguageChange = (newLang: string, source: 'header' | 'mobile_menu') => {
    if (newLang === currentLang) {
      setIsMobileMenuOpen(false);
      return;
    }
    track('language_changed', {
      from_language: currentLang,
      to_language: newLang,
      source,
    });
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

  const scrollToSection = (href: string, source: ConversionSource) => {
    if (href === '#menu') trackCtaClick('choose_service', source);
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
  const langNames: Record<string, string> = { cs: 'Čeština', en: 'English', ru: 'Русский', uk: 'Українська' };
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
      className="sticky top-0 z-50 w-full px-4 sm:px-6 xl:px-10 transition-all duration-300 border-b"
      style={{
        background: 'rgba(245,244,238,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottomColor: 'var(--color-border)',
        borderBottomWidth: '0.5px',
        paddingTop: isScrolled ? '12px' : '18px',
        paddingBottom: isScrolled ? '12px' : '18px',
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
          <img src="/brand/logo-wordmark-dark.svg" alt="NIUS" height="56" className="h-12 xl:h-14" />
        </Link>

        <ul className="hidden xl:flex items-center gap-7 2xl:gap-8">
          {navLinks.map((link) => (
            <li key={link.href + link.label}>
              {isHomePage ? (
                <a
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href, 'header_navigation'); }}
                  className="text-sm font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-indigo)] transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  to={`${langPrefix ? `${langPrefix}/` : '/'}${link.href}`}
                  onClick={() => {
                    if (link.href === '#menu') trackCtaClick('choose_service', 'header_navigation');
                  }}
                  className="text-sm font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-indigo)] transition-colors"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('nav.language')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-medium font-body text-[var(--color-text-secondary)] outline-none transition-colors hover:border-[var(--color-indigo)] hover:text-[var(--color-indigo)] data-[state=open]:border-[var(--color-indigo)]"
                >
                  {langLabels[currentLang]}
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[168px] border-[var(--color-border)] bg-[var(--color-bg)]">
                {(['cs', 'en', 'ru', 'uk'] as const).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onSelect={() => handleLanguageChange(lang, 'header')}
                    className="cursor-pointer gap-2 font-body text-[var(--color-text-secondary)] focus:bg-[rgba(21,63,77,0.06)] focus:text-[var(--color-indigo)]"
                  >
                    <span className="w-5 text-xs font-semibold">{langLabels[lang]}</span>
                    <span className="flex-1">{langNames[lang]}</span>
                    {currentLang === lang && <Check className="h-4 w-4" aria-hidden="true" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-6 w-px bg-[var(--color-border)]" aria-hidden="true" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hidden xl:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium font-body text-[var(--color-text-secondary)] outline-none transition-colors hover:bg-[rgba(21,63,77,0.06)] hover:text-[var(--color-indigo)] data-[state=open]:bg-[rgba(21,63,77,0.06)] data-[state=open]:text-[var(--color-indigo)]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>{t('nav.contacts')}</span>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[230px] border-[var(--color-border)] bg-[var(--color-bg)]">
              <DropdownMenuItem asChild className="cursor-pointer font-body focus:bg-[rgba(21,63,77,0.06)] focus:text-[var(--color-indigo)]">
                <a
                  href="tel:+420773629123"
                  data-analytics-source="header_contact_menu"
                  className="flex items-center gap-3"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span>+420 773 629 123</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer font-body focus:bg-[rgba(21,63,77,0.06)] focus:text-[var(--color-indigo)]">
                <a
                  href="https://wa.me/420773629123"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics-source="header_contact_menu"
                  className="flex items-center gap-3"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAccountLoading ? (
            <button
              type="button"
              disabled
              aria-label={t('nav.account')}
              className="hidden xl:inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] opacity-60 cursor-wait"
            >
              <UserCircle className="h-5 w-5" />
            </button>
          ) : (
            <a
              href={accountHref}
              aria-label={t('nav.account')}
              onClick={() => trackCtaClick('account', 'header', { authenticated: authStatus === 'authenticated' })}
              className="hidden xl:inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[rgba(21,63,77,0.06)] hover:text-[var(--color-indigo)] transition-colors"
            >
              <UserCircle className="h-5 w-5" />
            </a>
          )}

          <button
            type="button"
            onClick={() => {
              trackCtaClick('cart', 'header', { cart_items_count: cartCount });
              onboardingCart.openForm('header');
            }}
            aria-label={t('nav.cart')}
            className="relative hidden xl:inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(21,63,77,0.06)] text-[var(--color-indigo)] transition-colors hover:bg-[rgba(21,63,77,0.12)]"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[var(--color-indigo)] text-white text-[10px] font-semibold leading-none">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              trackCtaClick('cart', 'mobile_header', { cart_items_count: cartCount });
              onboardingCart.openForm('mobile_header');
            }}
            aria-label={t('nav.cart')}
            className="relative inline-flex xl:hidden h-10 w-10 items-center justify-center rounded-full bg-[rgba(21,63,77,0.06)] text-[var(--color-indigo)]"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[var(--color-indigo)] text-white text-[10px] font-semibold leading-none">
                {cartCount}
              </span>
            )}
          </button>

          <button
            className="xl:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[rgba(21,63,77,0.06)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={t('nav.menu')}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="xl:hidden pt-4 pb-4 animate-fade-in">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href + link.label}>
                {isHomePage ? (
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href, 'mobile_menu'); }}
                    className="block py-2 text-sm font-medium font-body text-[var(--color-text-secondary)]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={`${langPrefix ? `${langPrefix}/` : '/'}${link.href}`}
                    onClick={() => {
                      if (link.href === '#menu') trackCtaClick('choose_service', 'mobile_menu');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block py-2 text-sm font-medium font-body text-[var(--color-text-secondary)]"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
            <li className="pt-3 border-t border-[var(--color-border)]">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {(['cs', 'en', 'ru', 'uk'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang, 'mobile_menu')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      currentLang === lang
                        ? 'border-[var(--color-indigo)] text-[var(--color-indigo)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-indigo)] hover:text-[var(--color-indigo)]'
                    }`}
                  >
                    {langLabels[lang]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  trackCtaClick('cart', 'mobile_menu', { cart_items_count: cartCount });
                  onboardingCart.openForm('mobile_menu');
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 mb-3 rounded text-sm font-medium font-body text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--color-indigo)' }}
              >
                <ShoppingBag className="h-4 w-4" />
                {t('nav.cart')}
                {cartCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-white text-[var(--color-indigo)] text-[10px] font-semibold leading-none">
                    {cartCount}
                  </span>
                )}
              </button>

              {isAccountLoading ? (
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
                    onClick={() => {
                      trackCtaClick('account', 'mobile_menu', { authenticated: authStatus === 'authenticated' });
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 py-2 mb-3 text-sm font-medium font-body text-[var(--color-text-secondary)] hover:text-[var(--color-indigo)] transition-colors"
                  >
                    <UserCircle className="h-4 w-4" />
                    {t('nav.account')}
                  </a>
                )}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--color-border)]">
                <a
                  href="tel:+420773629123"
                  data-analytics-source="mobile_menu"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded text-sm font-medium font-body text-[var(--color-indigo)] border border-[var(--color-border)]"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {t('contacts.phone')}
                </a>
                <a
                  href="https://wa.me/420773629123"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics-source="mobile_menu"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded text-sm font-medium font-body text-[var(--color-indigo)] border border-[var(--color-border)]"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};
