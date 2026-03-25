import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { getLanguageFromPath, getLanguagePrefix } from "@/utils/languageUtils";

export const Footer = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  return (
    <footer className="bg-gradient-to-br from-primary via-primary-dark to-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li>
                {location.pathname === `${langPrefix}/` || location.pathname === "/" ? (
                  <a
                    href="#team"
                    onClick={(e) => { e.preventDefault(); scrollToSection("#team"); }}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {t('team.title')}
                  </a>
                ) : (
                  <Link to={`${langPrefix}/#team`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {t('team.title')}
                  </Link>
                )}
              </li>
              <li>
                {location.pathname === `${langPrefix}/` || location.pathname === "/" ? (
                  <a
                    href="#pricing"
                    onClick={(e) => { e.preventDefault(); scrollToSection("#pricing"); }}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {t('nav.pricing')}
                  </a>
                ) : (
                  <Link to={`${langPrefix}/#pricing`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {t('nav.pricing')}
                  </Link>
                )}
              </li>
              <li>
                <Link to={`${langPrefix}/blog/`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('nav.blog')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to={`${langPrefix}/iv-drips-prague/`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  IV Drips Prague
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/ivf-support-prague/`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('services.injection.title')}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/post-surgery-recovery-care-prague/`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('services.woundCare.title')}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/disabled-daily-care-prague/`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('services.hygiene.title')}
                </Link>
              </li>
              <li>
                <Link to={`${langPrefix}/post-surgery-recovery-care-prague/`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('services.escort.title')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="tel:+420773629123"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  +420 773 629 123
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@nius.cz"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  info@nius.cz
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center">
          <p className="text-primary-foreground/80">
            © {new Date().getFullYear()} {t('footer.companyName')}. {t('footer.rights')}
          </p>
          <p className="text-primary-foreground/50 text-xs mt-2">
            NIUS Services s.r.o. | IČO: 21908494 | {t('footer.licensed')}
          </p>
        </div>
      </div>
    </footer>
  );
};
