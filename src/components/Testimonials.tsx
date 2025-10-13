import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    text: "I needed a nurse for my elderly mother after surgery. The service was fast, professional, and kind. We didn't expect such comfort and care at home.",
    author: "Petra M.",
  },
  {
    text: "Great communication and quick response. The nurse was on time, explained everything clearly, and handled the injection smoothly. Highly recommended!",
    author: "Martin K.",
  },
  {
    text: "After my knee surgery, having a nurse come to my hotel made recovery so much easier. Professional, caring, and no hospital visits needed.",
    author: "Sarah L.",
  },
  {
    text: "The IVF injections were administered perfectly every time. The nurse was gentle, understanding, and always punctual. Thank you!",
    author: "Anna V.",
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Real experiences from people we've helped in Prague
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 relative overflow-hidden animate-scale-in">
            {/* Quote Icon */}
            <div className="absolute top-4 right-4 opacity-10">
              <Quote className="h-24 w-24 text-primary" />
            </div>

            {/* Testimonial Content */}
            <div className="relative z-10 mb-8">
              <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-6 italic">
                "{testimonials[currentIndex].text}"
              </p>
              <p className="text-lg font-semibold text-primary">
                — {testimonials[currentIndex].author}
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
    </section>
  );
};
