import { MapPin, Clock } from "lucide-react";
import mapImage from "@/assets/map.png";
import { useTranslation } from "react-i18next";

export const Location = () => {
  const { t } = useTranslation();
  return (
    <section id="location" className="py-20 bg-accent/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map Image */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-card">
              <img
                src={mapImage}
                alt="Prague service area map showing home nursing coverage"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                {t('location.title')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('location.description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 p-6 rounded-2xl bg-card hover:shadow-card transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">
                    {t('location.serviceArea')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('location.serviceAreaText')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 rounded-2xl bg-card hover:shadow-card transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">
                    {t('location.responseTime')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('location.responseTimeText')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
