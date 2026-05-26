export const MenuSection = () => {
  return (
    <section id="menu" className="py-16 md:py-24" style={{ padding: '100px 48px', background: 'var(--color-bg)' }}>
      <nius-menu section="menu"></nius-menu>
      {/* SEO fallback: crawlable text for search engines (hidden from users) */}
      <div className="sr-only" aria-hidden="true">
        <h2>IV Drip Menu — Prague Home Delivery</h2>
        <h3>Immunity & Recovery</h3>
        <ul>
          <li>Immunity Lite — Baseline immune boost. 2,900 CZK. 40–50 min IV infusion.</li>
          <li>Immunity Power — High-dose Vitamin C, serious viral defence. 3,250 CZK. 45–55 min.</li>
          <li>Defense Shield — Ultimate flu & virus recovery formula. 4,350 CZK. 50–60 min.</li>
          <li>Radiance — Skin glow, hair strength, and inner vitality. 3,750 CZK. 45–55 min.</li>
        </ul>
        <h3>Energy & Performance</h3>
        <ul>
          <li>CEO Recharge — Peak focus, mental clarity, full energy reset. 4,550 CZK. 65–75 min.</li>
          <li>Metabolic Reset — Energy metabolism support and burnout recovery. 4,050 CZK. 55–65 min.</li>
          <li>B-Power Shot — Fast B12 top-up, energy in 10 minutes. 1,650 CZK. 10–15 min.</li>
        </ul>
        <h3>Hydration & Balance</h3>
        <ul>
          <li>Pure Hydrate — Rapid rehydration. 2,550 CZK. 35–45 min.</li>
          <li>Electrolyte Reset — Hydration plus muscle and sleep recovery. 3,050 CZK. 45–55 min.</li>
          <li>Nausea Relief — Rapid relief from nausea and vomiting. 2,950 CZK. 20–30 min.</li>
          <li>Jet Lag Recovery — Rehydration and energy reset after long-haul flights. 3,250 CZK. 45–55 min.</li>
        </ul>
        <h3>Specialised Care</h3>
        <ul>
          <li>Standard Iron — Gentle iron replenishment. 2,850 CZK. 45–55 min.</li>
          <li>Premium Iron — High-potency single dose for severe deficiency. 6,450 CZK. 20–30 min.</li>
          <li>Nerve Regen — Nerve recovery and back pain relief. 3,450 CZK. 45–55 min.</li>
          <li>Backache Relief — Acute muscle and nerve pain. 3,350 CZK. 45–55 min.</li>
          <li>Allergy Stop — Rapid relief from allergic reactions. 2,750 CZK. 25–35 min.</li>
        </ul>
        <h3>Nursing Care</h3>
        <ul>
          <li>Post-Op Wound Dressing — Professional wound care after surgery. 1,890 CZK. 30–45 min.</li>
          <li>Hygiene Assistance — Professional hygiene and comfort care. 1,690 CZK. 60 min.</li>
          <li>Nurse Escort — Accompanied transport to medical appointments. 2,190 CZK. 2–4 hours.</li>
        </ul>
        <h3>Booster Shots (Add-ons)</h3>
        <ul>
          <li>B12 Energy Shot — 650 CZK</li>
          <li>B-Vitamin Complex — 750 CZK</li>
          <li>Vitamin D Shot — 850 CZK</li>
          <li>Vitamin B1 (Thiamin) — 700 CZK</li>
          <li>Glutathione Glow — 900 CZK</li>
          <li>Magnesium Boost — 500 CZK</li>
          <li>Zinc & Trace Minerals — 550 CZK</li>
          <li>Vitamin C Upgrade — 650 CZK</li>
          <li>Vitamin B6 Shot — 450 CZK</li>
          <li>Anti-Nausea Add-on — 480 CZK</li>
        </ul>
        <p>All prices include a registered nurse visit to your Prague location. Same-day appointments available 8:00–21:00 daily.</p>
      </div>
    </section>
  );
};

export const BundlesSection = () => {
  return (
    <section id="bundles" className="py-16 md:py-24" style={{ padding: '48px 48px', background: 'var(--color-bg)' }}>
      <nius-menu section="packages"></nius-menu>
    </section>
  );
};

export const SubscriptionSection = () => {
  return (
    <section id="membership" className="py-16 md:py-24" style={{ padding: '100px 48px', background: 'var(--color-bg)' }}>
      <nius-menu section="subscription"></nius-menu>
    </section>
  );
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'nius-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { section?: string; 'accent-color'?: string; locale?: string }, HTMLElement>;
    }
  }
}
