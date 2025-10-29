import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const testimonials = ["testimonial1", "testimonial2", "testimonial3", "testimonial4"];

// Rating data for each testimonial
const testimonialRatings = {
  testimonial1: 5,
  testimonial2: 5,
  testimonial3: 5,
  testimonial4: 5,
};

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation();

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Generate Review Schema for current testimonial
  const currentTestimonial = testimonials[currentIndex];
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "MedicalBusiness",
      "name": "Nurse in Prague",
      "url": "https://www.nius.cz/"
    },
    "author": {
      "@type": "Person",
      "name": t(`testimonials.items.${currentTestimonial}.author`)
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": testimonialRatings[currentTestimonial as keyof typeof testimonialRatings],
      "bestRating": "5"
    },
    "reviewBody": t(`testimonials.items.${currentTestimonial}.text`)
  };

  // Aggregate rating schema for all testimonials
  const aggregateSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Nurse in Prague",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": testimonials.length.toString(),
      "bestRating": "5",
      "worstRating": "4"
    }
  };

  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('testimonials.description')}
          </p>
          
          {/* Star Rating Display */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-primary text-primary" />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">4.9/5 ({testimonials.length} reviews)</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 relative overflow-hidden animate-scale-in">
            {/* Quote Icon */}
            <div className="absolute top-4 right-4 opacity-10">
              <Quote className="h-24 w-24 text-primary" />
            </div>

            {/* Testimonial Content */}
            <div className="relative z-10 mb-8">
              {/* Star Rating for current testimonial */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonialRatings[currentTestimonial as keyof typeof testimonialRatings])].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-6 italic">
                "{t(`testimonials.items.${testimonials[currentIndex]}.text`)}"
              </p>
              <p className="text-lg font-semibold text-primary">
                — {t(`testimonials.items.${testimonials[currentIndex]}.author`)}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary w-8"
                        : "bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Review Schema - Current testimonial */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(reviewSchema)
      }} />
      
      {/* Aggregate Rating Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(aggregateSchema)
      }} />
    </section>
  );
};
