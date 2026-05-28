import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OnboardingFormDialog } from "@/components/OnboardingForm";

export const HeroNew = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const debugParam = import.meta.env.DEV ? searchParams.get("debug") : null;
  const onboardingOpen = debugParam === "sparkle" || debugParam === "escort";
  const onboardingMode: "standard" | "escort" = debugParam === "escort" ? "escort" : "standard";
  const onboardingServiceCode = debugParam === "escort" ? "escort" : "iv_infusion";
  const onboardingModeRef = useRef(onboardingMode);
  onboardingModeRef.current = onboardingMode;

  const setOnboardingOpen = useCallback(
    (nextOpen: boolean) => {
      const next = new URLSearchParams(searchParams);
      if (nextOpen) {
        next.set("debug", onboardingModeRef.current === "escort" ? "escort" : "sparkle");
      } else {
        next.delete("debug");
      }
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const services = useMemo(() => t('heroNew.services', { returnObjects: true }) as string[], [t]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % services.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [services.length]);

  return (
    <section id="home" className="relative py-16 md:py-24 lg:py-32 overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-[60%_40%] gap-12 items-center">
          {/* Left column */}
          <div className="space-y-6">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ backgroundColor: '#22c55e' }} />
              <span className="text-sm font-body font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {t('heroNew.eyebrow')}
              </span>
            </div>

            {/* H1 — static headline */}
            <h1 className="font-display font-bold leading-[1.05]" style={{ fontSize: 'clamp(40px, 5vw, 72px)', color: 'var(--color-indigo)' }}>
              {t('heroNew.headline')}
            </h1>

            {/* Rotating services */}
            <div className="h-8 overflow-hidden">
              <span
                className={`block text-lg font-body font-medium transition-all duration-300 ${isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {services[currentIndex]}
              </span>
            </div>

            {/* Sub-headline */}
            <p className="font-body text-base md:text-lg max-w-[480px]" style={{ color: 'var(--color-text-secondary)' }}>
              {t('heroNew.subheadline')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="https://wa.me/420773629123"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded font-body font-medium text-sm text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--color-indigo)' }}
              >
                {t('heroNew.ctaPrimary')} →
              </a>
              <a
                href="#menu"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded font-body font-medium text-sm transition-colors"
                style={{ color: 'var(--color-indigo)', borderBottom: '1px solid var(--color-indigo)' }}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('heroNew.ctaSecondary')} ↓
              </a>
            </div>
          </div>

          {/* Right column — hero image */}
          <div className="relative hidden md:flex justify-center">
            <img
              src="/photos/hero-iv-bag.webp"
              alt="NIUS branded IV drip bag"
              className="rounded-lg object-cover"
              style={{
                maxHeight: '600px',
                aspectRatio: '3/4',
                boxShadow: '0 24px 60px rgba(21,63,77,0.12)',
              }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-12 pt-8" style={{ borderTop: '0.5px solid var(--color-border)' }}>
          <div className="text-center">
            <span className="font-display font-bold text-xl" style={{ color: 'var(--color-ink)' }}>3 000+</span>
            <span className="block text-xs font-body" style={{ color: 'var(--color-text-muted)' }}>{t('heroNew.statsVisits')}</span>
          </div>
          <div className="hidden sm:block w-px h-8" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="text-center">
            <span className="font-display font-bold text-xl" style={{ color: 'var(--color-ink)' }}>70%</span>
            <span className="block text-xs font-body" style={{ color: 'var(--color-text-muted)' }}>{t('heroNew.statsInternational')}</span>
          </div>
          <div className="hidden sm:block w-px h-8" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="text-center">
            <span className="font-display font-bold text-xl" style={{ color: 'var(--color-ink)' }}>{t('heroNew.statsSameDay')}</span>
            <span className="block text-xs font-body" style={{ color: 'var(--color-text-muted)' }}>{t('heroNew.statsSameDayLabel')}</span>
          </div>
        </div>
      </div>

      <OnboardingFormDialog
        key={`${onboardingMode}:${onboardingServiceCode}`}
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        initialMode={onboardingMode}
        initialServiceCode={onboardingServiceCode}
      />
    </section>
  );
};
