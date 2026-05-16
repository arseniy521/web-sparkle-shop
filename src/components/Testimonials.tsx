import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote, Star, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

const GOOGLE_REVIEWS_URL = "https://g.page/r/Cb4BmqPTZRSSEBE/review";

const testimonials = ["testimonial1", "testimonial2", "testimonial3", "testimonial4", "testimonial5", "testimonial6"];

// Rating data for each testimonial
const testimonialRatings = {
  testimonial1: 5,
  testimonial2: 5,
  testimonial3: 5,
  testimonial4: 5,
  testimonial5: 5,
  testimonial6: 5,
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
          
          {/* Star Rating Display with Google link */}
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white border border-border hover:border-primary/50 hover:shadow-md transition-all group"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">4.9/5</span>
            <span className="text-sm text-muted-foreground">{t('testimonials.googleReviews')}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
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

          {/* Google Reviews CTA */}
          <div className="text-center mt-8">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Star className="h-4 w-4" />
              <span>{t('testimonials.leaveReview')}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
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
