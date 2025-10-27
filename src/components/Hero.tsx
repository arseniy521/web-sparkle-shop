import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import mainImage from "@/assets/drips_cl2.png";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const dynamicPhrases = [
    t('hero.phrases.0'),
    t('hero.phrases.1'),
    t('hero.phrases.2'),
    t('hero.phrases.3'),
    t('hero.phrases.4'),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % dynamicPhrases.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative py-20 md:py-32 overflow-hidden" aria-label="Hero section">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground" itemProp="headline">
              <span
                className={`inline-block text-primary transition-all duration-300 ${
                  isAnimating ? "opacity-0 transform -translate-y-2" : "opacity-100"
                }`}
              >
                {dynamicPhrases[currentPhraseIndex]}
              </span>
              <br />
              <span className="text-secondary">{t('hero.performedBy')}</span>
              <br />
              <span className="text-foreground">{t('hero.inYourHome')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full sm:w-auto group">
                  {t('hero.bookNurse')}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="#services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {t('hero.ourServices')}
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">⚕️</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{t('hero.certifiedNurses')}</div>
                  <div className="text-sm text-muted-foreground">{t('hero.licensedProfessionals')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{t('hero.available247')}</div>
                  <div className="text-sm text-muted-foreground">{t('hero.sameDayService')}</div>
                </div>
              </div>
            </div>

            {/* Medical Tourism Highlights */}
            <div className="bg-muted/50 rounded-2xl p-6 mt-6">
              <h3 className="font-semibold text-foreground mb-3">{t('specializedServices.title')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <Link to="/ivf-injection-support-prague" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <span>💉</span>
                  <span>{t('specializedServices.ivf')}</span>
                </Link>
                <Link to="/post-surgery-recovery-care-prague" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <span>🏥</span>
                  <span>{t('specializedServices.postSurgery')}</span>
                </Link>
                <Link to="/disabled-daily-care-prague" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <span>🤝</span>
                  <span>{t('specializedServices.disabled')}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-soft bg-white p-8">
                <img
                  src={mainImage}
                  alt="Professional nurse administering IV drip at patient's home in Prague"
                  className="w-full h-auto object-contain"
                  loading="eager"
                />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
