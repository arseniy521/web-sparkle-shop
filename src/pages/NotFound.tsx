import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { getLanguageFromPath, getLanguagePrefix } from "@/utils/languageUtils";

const NotFound = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const currentLang = getLanguageFromPath(location.pathname);
  const langPrefix = getLanguagePrefix(currentLang);

  useEffect(() => {
    // Set language based on URL
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname, currentLang, i18n]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary">
              {t('notFound.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              {t('notFound.description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to={langPrefix || '/'}>
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-5 w-5" />
                {t('notFound.goHome')}
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              {t('notFound.goBack')}
            </Button>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              {t('notFound.help')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link to={`${langPrefix}/ivf-injection-support-prague`} className="text-primary hover:underline">
                {t('specializedServices.ivf')}
              </Link>
              <Link to={`${langPrefix}/iv-drip-therapy-prague`} className="text-primary hover:underline">
                {t('specializedServices.ivDrip')}
              </Link>
              <Link to={`${langPrefix}/post-surgery-recovery-care-prague`} className="text-primary hover:underline">
                {t('specializedServices.postSurgery')}
              </Link>
              <Link to={`${langPrefix}/disabled-daily-care-prague`} className="text-primary hover:underline">
                {t('specializedServices.disabled')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
