import { NavBar } from "@/components/NavBar";
import { FooterNew } from "@/components/FooterNew";
import { SEO } from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy — NIUS"
        description="Privacy policy for NIUS home nursing service in Prague. How we collect, use, and protect your personal data."
        canonical="https://www.nius.cz/privacy/"
      />
      <NavBar />
      <main className="py-16 md:py-24">
        <div className="max-w-[800px] mx-auto px-6 md:px-12">
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-8" style={{ color: 'var(--color-ink)' }}>
            Privacy Policy
          </h1>
          <div className="prose prose-sm font-body" style={{ color: 'var(--color-text-secondary)' }}>
            <p className="text-sm mb-4"><strong>Last updated:</strong> 25 May 2026</p>
            <p className="text-sm mb-4"><strong>Data Controller:</strong> Nius Services s.r.o., IČO: 21908494, Prague, Czech Republic</p>
            <p className="text-sm mb-4"><strong>Contact:</strong> info@nius.cz | +420 773 629 123</p>

            <h2 className="font-display font-bold text-xl mt-8 mb-4" style={{ color: 'var(--color-ink)' }}>1. What data we collect</h2>
            <p className="text-sm mb-3">We collect the following personal data when you use our services:</p>
            <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
              <li>Name, phone number, email address (when you contact us via WhatsApp, phone, or email)</li>
              <li>Address or hotel location (for nurse visit delivery)</li>
              <li>Health information you share with us (symptoms, medical history relevant to treatment)</li>
              <li>Payment information (processed securely via Stripe — we do not store card details)</li>
              <li>Website usage data (pages visited, device type — via Google Analytics)</li>
            </ul>

            <h2 className="font-display font-bold text-xl mt-8 mb-4" style={{ color: 'var(--color-ink)' }}>2. Why we collect it (legal basis)</h2>
            <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
              <li><strong>Contract performance:</strong> To schedule and deliver nursing services you request</li>
              <li><strong>Legal obligation:</strong> To comply with Czech healthcare record-keeping requirements</li>
              <li><strong>Legitimate interest:</strong> To improve our website and services, prevent fraud</li>
              <li><strong>Consent:</strong> For marketing communications and analytics cookies (you can withdraw anytime)</li>
            </ul>

            <h2 className="font-display font-bold text-xl mt-8 mb-4" style={{ color: 'var(--color-ink)' }}>3. How we use your data</h2>
            <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
              <li>Scheduling and delivering your nurse visit</li>
              <li>Communicating with you about your appointment</li>
              <li>Processing payments</li>
              <li>Improving our website experience</li>
              <li>Sending follow-up care instructions</li>
            </ul>

            <h2 className="font-display font-bold text-xl mt-8 mb-4" style={{ color: 'var(--color-ink)' }}>4. Cookies and analytics</h2>
            <p className="text-sm mb-3">We use:</p>
            <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
              <li><strong>Google Analytics 4 (GA4):</strong> To understand how visitors use our website. This uses cookies to track page views and interactions. Data is anonymised and sent to Google servers.</li>
              <li><strong>Essential cookies:</strong> Language preference, session state. These are necessary for the site to function.</li>
            </ul>
            <p className="text-sm mb-4">You can reject analytics cookies via the banner shown on your first visit. You can also disable cookies in your browser settings at any time.</p>

            <h2 className="font-display font-bold text-xl mt-8 mb-4" style={{ color: 'var(--color-ink)' }}>5. Who we share data with</h2>
            <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
              <li><strong>Our nurses:</strong> Name, address, and relevant health information needed for your visit</li>
              <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
              <li><strong>Google:</strong> Anonymised analytics data</li>
              <li><strong>Czech authorities:</strong> If required by law (healthcare reporting obligations)</li>
            </ul>
            <p className="text-sm mb-4">We never sell your personal data to third parties.</p>

            <h2 className="font-display font-bold text-xl mt-8 mb-4" style={{ color: 'var(--color-ink)' }}>6. Data retention</h2>
            <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
              <li>Contact and booking data: 3 years after last service (or as required by Czech healthcare law)</li>
              <li>Health records: As required by Czech law (typically 5 years)</li>
              <li>Analytics data: 14 months (Google Analytics default)</li>
              <li>Payment records: 10 years (Czech accounting law)</li>
            </ul>

            <h2 className="font-display font-bold text-xl mt-8 mb-4" style={{ color: 'var(--color-ink)' }}>7. Your rights (GDPR)</h2>
            <p className="text-sm mb-3">Under the EU General Data Protection Regulation, you have the right to:</p>
            <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data (where legally permitted)</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interest</li>
              <li><strong>Withdraw consent:</strong> For analytics cookies or marketing, at any time</li>
            </ul>
            <p className="text-sm mb-4">To exercise any of these rights, email us at <a href="mailto:info@nius.cz" className="underline" style={{ color: 'var(--color-indigo)' }}>info@nius.cz</a>. We will respond within 30 days.</p>

            <h2 className="font-display font-bold text-xl mt-8 mb-4" style={{ color: 'var(--color-ink)' }}>8. Data security</h2>
            <p className="text-sm mb-4">We protect your data using HTTPS encryption, secure hosting, and access controls. Payment data is handled exclusively by Stripe and never touches our servers.</p>

            <h2 className="font-display font-bold text-xl mt-8 mb-4" style={{ color: 'var(--color-ink)' }}>9. Supervisory authority</h2>
            <p className="text-sm mb-4">If you believe we have violated your data protection rights, you may file a complaint with the Czech Office for Personal Data Protection (ÚOOÚ): <a href="https://www.uoou.cz" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--color-indigo)' }}>www.uoou.cz</a></p>

            <h2 className="font-display font-bold text-xl mt-8 mb-4" style={{ color: 'var(--color-ink)' }}>10. Changes to this policy</h2>
            <p className="text-sm mb-4">We may update this policy from time to time. Changes will be posted on this page with an updated date.</p>
          </div>
        </div>
      </main>
      <FooterNew />
    </>
  );
};

export default PrivacyPolicy;
