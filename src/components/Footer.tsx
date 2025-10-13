export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-primary via-primary-dark to-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#nurses" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Our Team
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Testimonials
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-primary-foreground/80">IV Infusion</li>
              <li className="text-primary-foreground/80">Injections</li>
              <li className="text-primary-foreground/80">Wound Care</li>
              <li className="text-primary-foreground/80">Home Care</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="tel:+420773629123"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  +420 773 629 123
                </a>
              </li>
              <li>
                <a
                  href="mailto:sestranahodinu@gmail.com"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  sestranahodinu@gmail.com
                </a>
              </li>
              <li className="text-primary-foreground/80">Prague, Czech Republic</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center">
          <p className="text-primary-foreground/80">
            © {new Date().getFullYear()} Nius Services s.r.o. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};
