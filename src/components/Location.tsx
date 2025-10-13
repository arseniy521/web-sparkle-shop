import { MapPin, Clock } from "lucide-react";

export const Location = () => {
  return (
    <section id="location" className="py-20 bg-accent/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map Image */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-card">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074"
                alt="Prague service area map showing home nursing coverage"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                We Operate in Prague Area
              </h2>
              <p className="text-lg text-muted-foreground">
                Providing professional home healthcare services throughout Prague and surrounding areas.
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
                    Service Area
                  </h3>
                  <p className="text-muted-foreground">
                    All Prague districts and up to 30km from city center. Additional travel fee applies for areas outside Prague.
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
                    Response Time
                  </h3>
                  <p className="text-muted-foreground">
                    Typically 2-3 hours for same-day appointments. We recommend booking in advance for scheduled care.
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
