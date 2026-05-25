import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { getLanguageFromPath, getLanguagePrefix } from "@/utils/languageUtils";

export const FooterNew = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  return (
    <footer style={{ backgroundColor: 'var(--color-indigo)' }} className="py-16 pb-10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <img src="/brand/logo-wordmark-light.svg" alt="NIUS" className="h-12 mb-4" loading="lazy" />
            <p className="text-xs font-body leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('footerNew.tagline')}
            </p>
            <a
              href="https://wa.me/420773629123"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-4 px-4 py-2 rounded text-xs font-body font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '0.5px solid rgba(255,255,255,0.12)' }}
            >
              WhatsApp →
            </a>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-body font-medium tracking-[0.12em] uppercase text-white mb-4">
              {t('footerNew.services')}
            </h4>
            <ul className="space-y-2">
              <li><Link to={`${langPrefix}/iv-drips-prague/`} className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>IV Drips</Link></li>
              <li><Link to={`${langPrefix}/ivf-support-prague/`} className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>IVF Support</Link></li>
              <li><Link to={`${langPrefix}/post-surgery-recovery-care-prague/`} className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('specializedServices.postSurgery')}</Link></li>
              <li><Link to={`${langPrefix}/disabled-daily-care-prague/`} className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('specializedServices.disabled')}</Link></li>
            </ul>
          </div>

          {/* For Partners */}
          <div>
            <h4 className="text-xs font-body font-medium tracking-[0.12em] uppercase text-white mb-4">
              {t('footerNew.forPartners')}
            </h4>
            <ul className="space-y-2">
              <li><span className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('footerNew.partnerHotels')}</span></li>
              <li><span className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('footerNew.partnerIVF')}</span></li>
              <li><span className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('footerNew.partnerSurgery')}</span></li>
              <li><span className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('footerNew.partnerCorporate')}</span></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-body font-medium tracking-[0.12em] uppercase text-white mb-4">
              {t('footerNew.company')}
            </h4>
            <ul className="space-y-2">
              <li><a href="mailto:hello@nius.cz" className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>hello@nius.cz</a></li>
              <li><a href="mailto:arseniy@nius.cz" className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>arseniy@nius.cz</a></li>
              <li><a href="tel:+420773629123" className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>+420 773 629 123</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-2" style={{ borderTop: '0.5px solid rgba(255,255,255,0.12)' }}>
          <span className="text-[11px] font-body" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © 2025 NIUS Services s.r.o. · Prague, Czech Republic
          </span>
          <span className="text-[11px] font-body" style={{ color: 'rgba(255,255,255,0.4)' }}>
            IČO: 21908494 · hello@nius.cz
          </span>
        </div>
      </div>
    </footer>
  );
};
