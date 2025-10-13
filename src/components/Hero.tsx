import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const dynamicPhrases = [
  "Prescribed IV Drips",
  "Prescribed Injections",
  "Wound Care",
  "IVF Support",
  "Post-Surgery Recovery",
];

export const Hero = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
    <section id="home" className="relative py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              <span
                className={`inline-block text-primary transition-all duration-300 ${
                  isAnimating ? "opacity-0 transform -translate-y-2" : "opacity-100"
                }`}
              >
                {dynamicPhrases[currentPhraseIndex]}
              </span>
              <br />
              <span className="text-secondary">performed by a nurse</span>
              <br />
              <span className="text-foreground">in your home</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Fast, reliable, and professional healthcare at home. English-speaking nurses available 24/7 in Prague.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="https://nurseinprague.setmore.com/book" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full sm:w-auto group">
                  Book a Nurse
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="#services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Our Services
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
                  <div className="font-semibold text-foreground">Certified Nurses</div>
                  <div className="text-sm text-muted-foreground">Licensed professionals</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">24/7 Available</div>
                  <div className="text-sm text-muted-foreground">Same-day service</div>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070"
                alt="Professional nurse administering IV drip at patient's home in Prague"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
