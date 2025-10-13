import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", label: t('nav.home'), isHash: true },
    { href: "#services", label: t('nav.services'), isHash: true },
    { href: "#workflow", label: t('nav.workflow'), isHash: true },
    { href: "#pricing", label: t('nav.pricing'), isHash: true },
    { href: "/ivf-injection-support-prague", label: "IVF Support", isHash: false },
    { href: "/post-surgery-recovery-care-prague", label: "Post-Surgery", isHash: false },
    { href: "/disabled-daily-care-prague", label: "Daily Care", isHash: false },
    { href: "/blog", label: "Blog", isHash: false },
    { href: "#contacts", label: t('nav.contacts'), isHash: true },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg transition-transform group-hover:scale-105">
              N
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline-block">
              Nurse in Prague
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                {link.isHash && location.pathname === "/" ? (
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ) : link.isHash ? (
                  <Link
                    to={`/${link.href}`}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <Link
                    to={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <Select value={i18n.language} onValueChange={(lang) => i18n.changeLanguage(lang)}>
              <SelectTrigger className="w-[100px] hidden sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cs">Čeština</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="uk">Українська</SelectItem>
              </SelectContent>
            </Select>

            {/* Phone Number */}
            <a href="tel:+420773629123" className="hidden lg:flex">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                +420 773 629 123
              </Button>
            </a>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/420773629123"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex"
            >
              <Button size="sm">
                WhatsApp
              </Button>
            </a>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {link.isHash && location.pathname === "/" ? (
                    <a
                      href={link.href}
                      onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                      className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : link.isHash ? (
                    <Link
                      to={`/${link.href}`}
                      className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <Link
                      to={link.href}
                      className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              <li className="pt-2 space-y-2">
                <a href="tel:+420773629123" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    +420 773 629 123
                  </Button>
                </a>
                <a
                  href="https://wa.me/420773629123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button size="sm" className="w-full">
                    WhatsApp
                  </Button>
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};
