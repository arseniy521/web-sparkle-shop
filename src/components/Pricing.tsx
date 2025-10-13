import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pricingData = [
  {
    service: "Intramuscular Injection",
    example: "Vitamin B, antibiotics",
    firstPrice: 699,
    addOnPrice: 499,
  },
  {
    service: "Subcutaneous Injection",
    example: "insulin, anticoagulants",
    firstPrice: 699,
    addOnPrice: 499,
  },
  {
    service: "IV Drip (Standard)",
    example: "hydration, vitamins",
    firstPrice: 1199,
    addOnPrice: 849,
  },
  {
    service: "IV Drip (Custom)",
    example: "you provide medication",
    firstPrice: 1499,
    addOnPrice: 1049,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Fair and honest pricing with no hidden fees. Add-on services receive a 30% discount.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto animate-slide-up">
          <table className="w-full max-w-4xl mx-auto bg-card rounded-2xl shadow-card overflow-hidden">
            <thead>
              <tr className="bg-primary/5">
                <th className="px-6 py-4 text-left font-semibold text-secondary">
                  Service
                </th>
                <th className="px-6 py-4 text-center font-semibold text-secondary">
                  1st Service
                </th>
                <th className="px-6 py-4 text-center font-semibold text-secondary">
                  Add-on Service
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingData.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground">
                        {item.service}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.example}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-lg text-foreground">
                      {item.firstPrice} CZK
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-semibold text-lg text-foreground">
                        {item.addOnPrice} CZK
                      </span>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        -30%
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 animate-slide-up">
          {pricingData.map((item, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl shadow-card p-6 space-y-4"
            >
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-1">
                  {item.service}
                </h3>
                <p className="text-sm text-muted-foreground">{item.example}</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    1st Service
                  </div>
                  <div className="font-semibold text-lg text-foreground">
                    {item.firstPrice} CZK
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">
                    Add-on
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-foreground">
                      {item.addOnPrice} CZK
                    </span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      -30%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#services">
            <Button size="lg" variant="outline">
              Learn More About Our Services
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};
