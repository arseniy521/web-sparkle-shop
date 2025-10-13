import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
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
    { href: "#home", label: t('nav.home') },
    { href: "#services", label: t('nav.services') },
    { href: "#workflow", label: t('nav.workflow') },
    { href: "#pricing", label: t('nav.pricing') },
    { href: "#contacts", label: t('nav.contacts') },
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
          <a href="#home" className="flex items-center gap-2 group" onClick={(e) => { e.preventDefault(); scrollToSection('#home'); }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg transition-transform group-hover:scale-105">
              N
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline-block">
              Nurse in Prague
            </span>
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
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
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                    className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
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
