import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gradient-to-br from-primary via-primary-dark to-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {t('footer.services')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2">
              <li className="text-primary-foreground/80">{t('services.ivInfusion.title')}</li>
              <li className="text-primary-foreground/80">{t('services.injection.title')}</li>
              <li className="text-primary-foreground/80">{t('services.woundCare.title')}</li>
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
                  href="mailto:sestranahodinu@gmail.com"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  sestranahodinu@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center">
          <p className="text-primary-foreground/80">
            © {new Date().getFullYear()} {t('footer.companyName')}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};
