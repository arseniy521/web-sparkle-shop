import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { getLanguageFromPath, getLanguagePrefix } from "@/utils/languageUtils";
import { Visa, Mastercard, Applepay, Googlepay } from "react-pay-icons";

export const FooterNew = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  return (
    <footer style={{ backgroundColor: 'var(--color-indigo)' }} className="py-16 pb-10 relative overflow-hidden">
      <img
        src="/brand/logo-mark-light.svg"
        alt=""
        aria-hidden="true"
        className="absolute bottom-[-40px] right-[-20px] w-[280px] h-[280px] pointer-events-none select-none"
        style={{ opacity: 0.04 }}
      />
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
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
              {t('footerNew.whatsapp')}
            </a>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-body font-medium tracking-[0.12em] uppercase text-white mb-4">
              {t('footerNew.services')}
            </h4>
            <ul className="space-y-2">
              <li><Link to={`${langPrefix}/iv-drips-prague/`} className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('footerNew.ivDrips')}</Link></li>
              <li><Link to={`${langPrefix}/ivf-support-prague/`} className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('footerNew.ivfSupport')}</Link></li>
              <li><Link to={`${langPrefix}/post-surgery-recovery-care-prague/`} className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('specializedServices.postSurgery')}</Link></li>
              <li><Link to={`${langPrefix}/disabled-daily-care-prague/`} className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('specializedServices.disabled')}</Link></li>
              <li><Link to={`${langPrefix}/blog/`} className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-body font-medium tracking-[0.12em] uppercase text-white mb-4">
              {t('footerNew.company')}
            </h4>
            <ul className="space-y-2">
              <li><a href="mailto:info@nius.cz" className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>info@nius.cz</a></li>
              <li><a href="tel:+420773629123" className="text-xs font-body" style={{ color: 'rgba(255,255,255,0.5)' }}>+420 773 629 123</a></li>
            </ul>
          </div>
        </div>

        {/* Payment badges */}
        <div className="flex items-center justify-center gap-3 pt-8 mb-6" style={{ borderTop: '0.5px solid rgba(255,255,255,0.12)' }}>
          <Visa className="h-8 rounded" style={{ opacity: 0.9 }} />
          <Mastercard className="h-8 rounded" style={{ opacity: 0.9 }} />
          <Applepay className="h-8 rounded" style={{ opacity: 0.9 }} />
          <Googlepay className="h-8 rounded" style={{ opacity: 0.9 }} />
        </div>

        {/* Bottom strip */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <span className="text-[11px] font-body" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('footerNew.copyright')}
          </span>
          <div className="flex items-center gap-3">
            <Link to={`${langPrefix}/privacy/`} className="text-[11px] font-body" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Privacy Policy
            </Link>
            <span className="text-[11px] font-body" style={{ color: 'rgba(255,255,255,0.4)' }}>
              IČO: 21908494 · info@nius.cz
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
