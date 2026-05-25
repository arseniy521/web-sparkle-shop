/* ═══════════════════════════════════════════════════════════════
   <nius-menu> — self-contained Web Component
   All styles scoped via Shadow DOM. No external CSS leaks in/out.

   Usage:
     <nius-menu></nius-menu>                       (full)
     <nius-menu section="menu"></nius-menu>        (services only)
     <nius-menu section="packages"></nius-menu>    (bundles only)
     <nius-menu section="subscription"></nius-menu>(membership only)

   Attrs: section, accent-color, locale
═══════════════════════════════════════════════════════════════ */

const NIUS_CATEGORIES = {
  immunity: {
    label: 'Immunity & Recovery',
    icon: 'ti-shield',
    desc: 'High-dose Vitamin C protocols for prevention, flu season and recovery.',
    drips: [
      {
        name: 'Immunity Lite',
        tagline: 'Baseline immune boost. The starter protocol.',
        price: 2900,
        duration: '40–50 min',
        admin: 'IV',
        hero: false,
        ingredients: ['Saline hydration base', 'Vitamin C (medium dose)'],
        bestfor: 'Travel prep, prevention, mild fatigue, first-time IV clients.'
      },
      {
        name: 'Immunity Power',
        tagline: 'High-dose Vitamin C — serious viral defence.',
        price: 3250,
        duration: '45–55 min',
        admin: 'IV',
        hero: false,
        ingredients: ['Saline hydration base', 'Vitamin C (high dose)'],
        bestfor: 'Post-illness, high-risk travel, clients fighting symptoms.'
      },
      {
        name: 'Defense Shield',
        tagline: 'The ultimate flu & virus recovery formula.',
        price: 4350,
        duration: '50–60 min',
        admin: 'IV',
        hero: true,
        ingredients: ['Saline hydration base', 'Vitamin C (high dose)', 'Zinc, Selenium & Trace Minerals'],
        bestfor: 'Flu, virus recovery, longevity clients, premium hotel guests.'
      },
      {
        name: 'Glow & Post-Flu',
        tagline: 'Skin, hair, and immune resilience.',
        price: 3750,
        duration: '45–55 min',
        admin: 'IV',
        hero: false,
        ingredients: ['Saline hydration base', 'Vitamin C (medium dose)', 'Zinc, Selenium & Trace Minerals'],
        bestfor: 'Beauty events, weddings, post-flu recovery, photo shoots.'
      }
    ]
  },
  energy: {
    label: 'Energy & Performance',
    icon: 'ti-bolt',
    desc: 'From the CEO Recharge flagship to express B-Vitamin boosters.',
    drips: [
      {
        name: 'CEO Recharge',
        tagline: 'Peak focus, mental clarity, full energy reset.',
        price: 4550,
        duration: '65–75 min',
        admin: 'IV + IM',
        hero: true,
        ingredients: ['Saline hydration base', 'Magnesium, Zinc & Trace Minerals (IV)', 'Full B-Vitamin Complex (injection)'],
        bestfor: 'Executives, business travel, 5-star hotel guests, pre-event peak.'
      },
      {
        name: 'Metabolic Reset',
        tagline: 'Energy metabolism support and burnout recovery.',
        price: 4050,
        duration: '55–65 min',
        admin: 'IV + IM',
        hero: false,
        ingredients: ['Saline hydration base', 'Zinc & Trace Minerals (IV)', 'Full B-Vitamin Complex (injection)'],
        bestfor: 'Chronic fatigue, burnout, long-haul recovery.'
      },
      {
        name: 'B-Power Shot',
        tagline: 'Fast B12 top-up. Energy in 10 minutes.',
        price: 1650,
        duration: '10–15 min',
        admin: 'IM',
        hero: false,
        ingredients: ['High-dose Vitamin B12 (injection only)'],
        bestfor: 'Vegans, brain fog, quick express morning boost.'
      }
    ]
  },
  hydration: {
    label: 'Hydration & Balance',
    icon: 'ti-droplet',
    desc: 'Rapid rehydration, electrolyte recovery, and nausea relief.',
    drips: [
      {
        name: 'Pure Hydrate',
        tagline: 'Rapid rehydration. Simple, fast, effective.',
        price: 2550,
        duration: '35–45 min',
        admin: 'IV',
        hero: false,
        ingredients: ['Saline hydration solution'],
        bestfor: 'Hangover recovery, dehydration, post-flight, first visit.'
      },
      {
        name: 'Electrolyte Reset',
        tagline: 'Hydration plus muscle and sleep recovery.',
        price: 3050,
        duration: '45–55 min',
        admin: 'IV',
        hero: false,
        ingredients: ['Saline hydration base', 'High-dose Magnesium'],
        bestfor: 'Muscle cramps, migraine, insomnia, sport recovery.'
      },
      {
        name: 'Nausea Relief',
        tagline: 'Rapid relief from nausea and vomiting.',
        price: 2950,
        duration: '20–30 min',
        admin: 'IV',
        hero: false,
        ingredients: ['Saline hydration base', 'Anti-nausea support'],
        bestfor: 'Food poisoning, severe hangover, pregnancy nausea.'
      }
    ]
  },
  special: {
    label: 'Specialised Care',
    icon: 'ti-heartbeat',
    desc: 'Iron infusions, nerve recovery, back pain, allergy support.',
    drips: [
      {
        name: 'Standard Iron',
        tagline: 'Gentle iron replenishment for energy and vitality.',
        price: 2850,
        duration: '45–55 min',
        admin: 'IV',
        hero: false,
        ingredients: ['Saline hydration base', 'Iron (standard dose)'],
        bestfor: 'Iron deficiency, mild-to-moderate anaemia, IVF patients.'
      },
      {
        name: 'Premium Iron',
        tagline: 'High-potency iron, single-dose for severe deficiency.',
        price: 6450,
        duration: '20–30 min',
        admin: 'IV',
        hero: false,
        ingredients: ['Saline hydration base', 'Iron (high-potency single dose)'],
        bestfor: 'Severe iron deficiency, pregnancy, post-surgery, IVF protocols.'
      },
      {
        name: 'Nerve Regen',
        tagline: 'Nerve recovery and back pain relief.',
        price: 3450,
        duration: '45–55 min',
        admin: 'IV + IM',
        hero: false,
        ingredients: ['Saline hydration base', 'Full B-Vitamin Complex (B1, B6, B12)'],
        bestfor: 'Back pain, numbness, neuropathy, post-illness recovery.'
      },
      {
        name: 'Backache Relief',
        tagline: 'Acute muscle and nerve pain — fast relief.',
        price: 3350,
        duration: '45–55 min',
        admin: 'IV + IM',
        hero: false,
        ingredients: ['Saline hydration base', 'Magnesium', 'B-Vitamin Complex'],
        bestfor: 'Acute back pain, muscle spasm, neck tension, sports injury.'
      },
      {
        name: 'Allergy Stop',
        tagline: 'Rapid relief from allergic reactions.',
        price: 2750,
        duration: '25–35 min',
        admin: 'IV',
        hero: false,
        ingredients: ['Saline hydration base', 'Anti-allergy & anti-inflammatory support'],
        bestfor: 'Acute allergy, hay fever, food reaction, seasonal rhinitis.'
      }
    ]
  },
  nursing: {
    label: 'Nursing Care',
    icon: 'ti-stethoscope',
    desc: 'Post-surgery wound care, hygiene assistance, and nurse escort services.',
    drips: [
      {
        name: 'Post-Op Wound Dressing',
        tagline: 'Professional wound care and bandage change after surgery.',
        price: 1890,
        duration: '30–45 min',
        admin: 'Visit',
        hero: false,
        ingredients: ['Wound assessment', 'Sterile dressing change', 'Drain check if applicable', 'Healing progress notes'],
        bestfor: 'Plastic surgery aftercare, orthopaedic wounds, cosmetic procedures, medical tourists.'
      },
      {
        name: 'Hygiene Assistance',
        tagline: 'One-hour professional hygiene and comfort care.',
        price: 1690,
        duration: '60 min',
        admin: 'Visit',
        hero: false,
        ingredients: ['Personal hygiene support', 'Bed-bound patient care', 'Comfort positioning', 'Skin integrity check'],
        bestfor: 'Post-surgery patients, elderly care, mobility-limited clients, hotel recovery stays.'
      },
      {
        name: 'Nurse Escort',
        tagline: 'Accompanied transport to and from medical appointments.',
        price: 2190,
        duration: '2–4 hours',
        admin: 'Escort',
        hero: false,
        ingredients: ['Pre-appointment preparation', 'Accompanied transport', 'Medical translation if needed', 'Post-appointment care notes'],
        bestfor: 'Post-surgery clinic visits, medical tourists, patients needing transport assistance.'
      },
      {
        name: 'Jet Lag Recovery',
        tagline: 'Rehydration and energy reset after long-haul flights.',
        price: 3250,
        duration: '45–55 min',
        admin: 'IV',
        hero: false,
        ingredients: ['Saline hydration base', 'Magnesium', 'B-Vitamin Complex'],
        bestfor: 'Business travellers, long-haul arrivals, conference attendees, hotel guests.'
      }
    ]
  }
};

const NIUS_SHOTS = [
  { id:'b12', name:'B12 Energy Shot', desc:'Instant energy and focus boost. Our most popular booster.', price:650, tag:'Top seller' },
  { id:'bcomplex', name:'B-Vitamin Complex', desc:'Full B-Vitamin Complex (B1, B6, B12). Nerve and fatigue support.', price:750, tag:'Nerves / fatigue' },
  { id:'vitd', name:'Vitamin D Shot', desc:'High-dose Vitamin D3. Three-month top-up in one injection.', price:850, tag:'Immunity / bones' },
  { id:'thiamin', name:'Vitamin B1 (Thiamin)', desc:'Neurological support and cleansing acceleration.', price:700, tag:'Cleansing / nerve' },
  { id:'glutathione', name:'Glutathione Glow', desc:'Master antioxidant — skin glow, liver support.', price:900, tag:'Skin / glow' },
  { id:'magnesium', name:'Magnesium Boost', desc:'Muscle relaxation, migraine relief, better sleep.', price:500, tag:'Muscles / sleep' },
  { id:'zinc', name:'Zinc & Trace Minerals', desc:'Zinc, Selenium & essential trace minerals — full immune support.', price:550, tag:'Immunity' },
  { id:'vitc', name:'Vitamin C Upgrade', desc:'Extra Vitamin C dose mid-drip for stronger immune effect.', price:650, tag:'Immunity' },
  { id:'pyridoxin', name:'Vitamin B6 Shot', desc:'PMS relief, pregnancy nausea, nerve and mood support.', price:450, tag:'Nerve / PMS' },
  { id:'antiemetic', name:'Anti-Nausea Add-on', desc:'Quick nausea control added to any infusion.', price:480, tag:'Nausea' }
];

const NIUS_UPSELLS_BY_CAT = {
  immunity: ['vitd','b12','glutathione','zinc','vitc','bcomplex'],
  energy: ['b12','bcomplex','vitd','glutathione','magnesium','thiamin'],
  hydration: ['b12','magnesium','antiemetic','glutathione','pyridoxin'],
  special: ['b12','bcomplex','vitd','thiamin','glutathione','pyridoxin'],
  nursing: ['b12','vitd','bcomplex','magnesium']
};

const NIUS_PACKAGES = [
  {
    id: 'bundle-5',
    name: '5 + 1 Bundle',
    tagline: 'Order 5 drips · 1 is on us',
    cta: 'Get bundle →',
    featured: false,
    perks: [
      '6 drips total at the price of 5',
      'Choose any drips from the menu',
      'Valid for 6 months from purchase',
      'Transferable to family members',
      'Same 60-min arrival, every visit'
    ]
  },
  {
    id: 'bundle-10',
    name: '10 + 2 Bundle',
    tagline: 'Order 10 drips · get 2 on us',
    cta: 'Get bundle →',
    featured: true,
    badge: 'Best value',
    perks: [
      '12 drips total at the price of 10',
      'Choose any drips from the menu',
      'Valid for 12 months from purchase',
      'Transferable to family or guests',
      'Priority booking · skip the queue',
      'One free booster shot per visit'
    ]
  },
  {
    id: 'corporate',
    name: 'Corporate / Group',
    tagline: 'For clinics, hotels & teams',
    cta: 'Get a quote →',
    featured: false,
    customPrice: 'On request',
    perks: [
      'Hotel concierge programmes',
      'Clinic partnership rates (IVF, post-op)',
      'Team wellness days',
      'Bachelor / hen party packages',
      'Custom invoicing & reporting'
    ]
  }
];

const NIUS_SUBSCRIPTION = {
  title: 'NIUS+ Membership',
  pitch: 'Monthly drips. One flat fee. Always priority.',
  desc: 'A subscription for clients who want to stay topped up year-round — fertility patients on long protocols, executives, expats.',
  perks: [
    { title: 'Drips at fixed monthly pricing', desc: 'Choose any drip from the menu, every month' },
    { title: '15% off any extra drips', desc: 'Need more this month? Members always pay less' },
    { title: 'Priority same-day booking', desc: 'Members come first when calendar is full' },
    { title: 'Cancel anytime', desc: 'No long-term commitment, no hidden fees' }
  ],
  plans: [
    {
      name: 'Essential',
      price: 6200,
      per: 'CZK / month',
      desc: '<strong>2 drips per month</strong> — perfect for prevention and regular immune support.',
      popular: false
    },
    {
      name: 'Premium',
      price: 8900,
      per: 'CZK / month',
      desc: '<strong>3 drips per month</strong> — best for IVF protocols, business travellers, executives.',
      popular: true
    }
  ]
};

class NiusMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const section = this.getAttribute('section') || 'all';
    const accent = this.getAttribute('accent-color') || '#153f4d';
    this.render(section, accent);
  }

  render(section, accent) {
    this.shadowRoot.innerHTML = `
      ${this.styles(accent)}
      <div class="nius-root">
        ${(section === 'all' || section === 'menu') ? this.renderMenu() : ''}
        ${(section === 'all' || section === 'packages') ? this.renderPackages() : ''}
        ${(section === 'all' || section === 'subscription') ? this.renderSubscription() : ''}
      </div>
    `;
    this.attachListeners();
  }

  styles(accent) {
    return `
      <style>
        :host {
          --ink: #2a2c2e;
          --ink2: #4a4845;
          --ink3: #7a7773;
          --fog: #f5f4ee;
          --fog2: #edeae4;
          --gold: ${accent};
          --gold-light: #e0eaef;
          --gold-soft: #eaf0f3;
          --teal: #569acd;
          --teal-soft: #eef5fb;
          --white: #ffffff;
          --serif: 'Onest', system-ui, sans-serif;
          --sans: 'Montserrat', system-ui, sans-serif;
          --mono: 'Montserrat', system-ui, sans-serif;

          display: block;
          font-family: var(--sans);
          color: var(--ink);
          line-height: 1.55;
          font-size: 14px;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nius-root > section + section { margin-top: 64px; }

        .section-head {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
          padding-bottom: 18px; border-bottom: 0.5px solid var(--fog2);
          margin-bottom: 28px;
        }
        .sh-label {
          font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--gold); font-weight: 500; margin-bottom: 10px;
        }
        .sh-title {
          font-family: var(--serif); font-size: 32px; font-weight: 700; line-height: 1.1;
        }
        .sh-title em { font-style: italic; font-weight: 600; color: var(--gold); }
        .sh-desc {
          font-size: 14px; color: var(--ink2); margin-top: 8px;
          max-width: 560px; line-height: 1.65;
        }

        .cat-block { margin-bottom: 36px; }
        .cat-label {
          display: flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--ink3);
          margin-bottom: 14px;
        }
        .cat-label i { font-size: 16px; color: var(--gold); }
        .cat-desc {
          font-size: 13px; color: var(--ink2); margin-bottom: 14px; max-width: 600px;
        }

        .drip-list { display: flex; flex-direction: column; gap: 2px; }
        .drip-card {
          background: var(--white);
          border: 0.5px solid var(--fog2);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .drip-card:hover { border-color: rgba(42,44,46,0.18); }
        .drip-card.open { border-color: var(--gold); box-shadow: 0 4px 32px rgba(21,63,77,0.07); }

        .drip-main {
          display: grid; grid-template-columns: 1fr auto auto;
          gap: 20px; align-items: center;
          padding: 18px 22px;
        }
        .drip-left { min-width: 0; }
        .drip-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .drip-name { font-family: var(--serif); font-size: 19px; font-weight: 600; line-height: 1.2; }
        .hero-badge {
          font-size: 9px; font-weight: 500; padding: 3px 9px; border-radius: 10px;
          background: var(--gold-light); color: var(--gold);
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .drip-tagline { font-size: 12px; color: var(--ink2); margin-top: 4px; line-height: 1.5; }
        .admin-pill {
          font-size: 9px; font-weight: 500; padding: 2px 8px; border-radius: 10px;
          background: var(--fog); color: var(--ink3);
          letter-spacing: 0.08em; display: inline-block; margin-top: 8px;
        }
        .drip-meta { text-align: right; }
        .drip-price { font-family: var(--serif); font-size: 22px; font-weight: 700; line-height: 1; }
        .drip-price small { font-size: 12px; color: var(--ink3); font-family: var(--sans); margin-left: 2px; }
        .drip-price-label { font-size: 10px; color: var(--ink3); margin-top: 4px; letter-spacing: 0.02em; }
        .drip-toggle {
          font-size: 22px; color: var(--ink3); font-weight: 300;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          border-radius: 50%; transition: transform 0.25s, background 0.2s, color 0.2s;
          user-select: none;
        }
        .drip-card:hover .drip-toggle { background: var(--fog); }
        .drip-card.open .drip-toggle { transform: rotate(45deg); color: var(--gold); }

        .drip-detail {
          max-height: 0; overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .drip-card.open .drip-detail { max-height: 900px; }
        .drip-detail-inner {
          padding: 20px 22px 22px;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 24px;
          border-top: 0.5px solid var(--fog2);
        }
        .detail-col-label {
          font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--ink3); margin-bottom: 12px;
        }
        .ing-list { display: flex; flex-direction: column; gap: 8px; }
        .ing-row {
          font-size: 13px; color: var(--ink); display: flex; align-items: center; gap: 10px;
        }
        .ing-row::before {
          content: ''; width: 4px; height: 4px;
          background: var(--gold); border-radius: 50%; flex-shrink: 0;
        }
        .bestfor {
          font-size: 13px; color: var(--ink2); line-height: 1.65;
          margin-top: 14px; padding-top: 12px; border-top: 0.5px dashed var(--fog2);
        }
        .bestfor strong { display: block; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink3); margin-bottom: 4px; font-weight: 500; }

        .upsell-box {
          background: var(--gold-soft);
          border-radius: 8px;
          padding: 14px 16px;
        }
        .upsell-head {
          display: flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 10px;
        }
        .upsell-head i { font-size: 14px; }
        .upsell-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .upsell-chip {
          font-size: 12px; padding: 7px 11px; border-radius: 6px;
          background: var(--white); border: 0.5px solid rgba(42,44,46,0.08);
          color: var(--ink); cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .upsell-chip:hover {
          border-color: var(--gold);
          box-shadow: 0 2px 12px rgba(21,63,77,0.18);
        }
        .upsell-chip .plus { color: var(--gold); font-weight: 500; }
        .upsell-chip .price {
          font-family: var(--sans); font-size: 11px; color: var(--ink3);
          padding-left: 6px; border-left: 0.5px solid var(--fog2); margin-left: 2px;
        }
        .upsell-foot {
          margin-top: 10px; font-size: 11px; color: var(--ink2); line-height: 1.55;
        }

        .drip-cta-row {
          grid-column: 1 / -1;
          display: flex; justify-content: space-between; align-items: center;
          gap: 16px; padding-top: 18px; margin-top: 4px;
          border-top: 0.5px solid var(--fog2);
          flex-wrap: wrap;
        }
        .drip-cta-info { font-size: 11px; color: var(--ink3); }
        .btn-book {
          background: var(--gold); color: var(--white);
          padding: 11px 22px; border-radius: 4px;
          font-family: var(--sans); font-size: 12px; font-weight: 500;
          letter-spacing: 0.06em; border: none; cursor: pointer;
          text-decoration: none; transition: background 0.2s;
        }
        .btn-book:hover { background: #0d2a35; }

        .packages-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
          margin-top: 8px;
        }
        .pkg-card {
          background: var(--white);
          border: 0.5px solid var(--fog2);
          border-radius: 12px;
          padding: 30px 28px;
          display: flex; flex-direction: column;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .pkg-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(21,63,77,0.07);
          border-color: var(--gold-light);
        }
        .pkg-card.featured {
          background: var(--gold); color: var(--white);
          border-color: var(--gold);
        }
        .pkg-badge {
          position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
          background: #569acd; color: var(--white);
          font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
          padding: 5px 14px; border-radius: 20px;
          white-space: nowrap;
        }
        .pkg-name {
          font-family: var(--serif); font-size: 24px; font-weight: 700;
          margin-bottom: 6px; line-height: 1.2;
        }
        .pkg-tagline {
          font-size: 13px; color: var(--ink2); margin-bottom: 22px;
          line-height: 1.55;
        }
        .pkg-card.featured .pkg-tagline { color: rgba(255,255,255,0.7); }
        .pkg-divider {
          height: 0.5px; background: var(--fog2); margin: 0 0 22px;
        }
        .pkg-card.featured .pkg-divider { background: rgba(255,255,255,0.12); }
        .pkg-perks {
          list-style: none; display: flex; flex-direction: column; gap: 10px;
          margin-bottom: 24px; flex: 1;
        }
        .pkg-perks li {
          font-size: 13px; color: var(--ink2); display: flex; align-items: flex-start; gap: 9px;
          line-height: 1.5;
        }
        .pkg-perks li::before {
          content: '✓'; color: #569acd; flex-shrink: 0; font-weight: 500;
          font-size: 13px; line-height: 1.5;
        }
        .pkg-card.featured .pkg-perks li { color: rgba(255,255,255,0.78); }
        .pkg-card.featured .pkg-perks li::before { color: var(--white); }
        .pkg-cta {
          background: var(--gold); color: var(--white);
          padding: 13px 22px; border-radius: 4px; border: none; cursor: pointer;
          font-family: var(--sans); font-size: 12px; font-weight: 500; letter-spacing: 0.08em;
          text-align: center; text-decoration: none;
          transition: background 0.2s; display: block;
        }
        .pkg-cta:hover { background: #0d2a35; }
        .pkg-card.featured .pkg-cta {
          background: var(--white); color: var(--gold);
        }
        .pkg-card.featured .pkg-cta:hover { background: var(--fog); }
        .pkg-custom-price {
          font-family: var(--serif); font-size: 22px; font-weight: 700; color: var(--ink2);
          margin-bottom: 18px;
        }

        .sub-section {
          background: linear-gradient(135deg, #153f4d 0%, #0d2a35 100%);
          color: var(--white);
          border-radius: 12px;
          padding: 48px 44px;
          position: relative; overflow: hidden;
        }
        .sub-section::before {
          content: 'NIUS+';
          position: absolute; right: -40px; bottom: -90px;
          font-family: var(--serif); font-size: 260px; font-weight: 800;
          color: rgba(255,255,255,0.04); letter-spacing: -0.04em;
          pointer-events: none; line-height: 1;
        }
        .sub-inner {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 48px; align-items: center;
          position: relative; z-index: 2;
        }
        .sub-eyebrow {
          font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
          color: #fcddc0; margin-bottom: 14px;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .sub-eyebrow::before {
          content: ''; width: 6px; height: 6px;
          background: #fcddc0; border-radius: 50%;
        }
        .sub-title {
          font-family: var(--serif); font-size: 34px; font-weight: 700;
          line-height: 1.1; margin-bottom: 14px;
        }
        .sub-title em { font-style: italic; font-weight: 600; color: #fcddc0; }
        .sub-desc {
          font-size: 14px; color: rgba(255,255,255,0.65); font-weight: 400;
          line-height: 1.7; margin-bottom: 24px;
        }
        .sub-perks { display: flex; flex-direction: column; gap: 12px; }
        .sub-perk { display: flex; gap: 12px; align-items: flex-start; }
        .sub-perk-icon {
          flex-shrink: 0; background: rgba(252,221,192,0.15); border-radius: 50%;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          color: #fcddc0; font-size: 12px;
        }
        .sub-perk-text strong {
          color: var(--white); font-weight: 500; display: block; font-size: 13px; margin-bottom: 1px;
        }
        .sub-perk-text span { font-size: 12px; color: rgba(255,255,255,0.6); }

        .sub-plans { display: flex; flex-direction: column; gap: 12px; }
        .sub-plan {
          background: rgba(255,255,255,0.06);
          border: 0.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 22px 24px;
          transition: background 0.2s, border-color 0.2s;
        }
        .sub-plan:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(252,221,192,0.4);
        }
        .sub-plan.popular {
          background: rgba(252,221,192,0.1);
          border-color: #fcddc0;
        }
        .sub-plan-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 12px;
        }
        .sub-plan-name { font-family: var(--serif); font-size: 20px; font-weight: 700; line-height: 1.2; }
        .sub-plan-badge {
          font-size: 9px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
          background: #569acd; color: var(--white);
          padding: 3px 9px; border-radius: 10px;
        }
        .sub-plan-price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
        .sub-plan-price {
          font-family: var(--serif); font-size: 28px; font-weight: 700; color: var(--white); line-height: 1;
        }
        .sub-plan-per { font-size: 12px; color: rgba(255,255,255,0.55); }
        .sub-plan-desc {
          font-size: 12px; color: rgba(255,255,255,0.62); line-height: 1.55;
          padding-top: 10px; border-top: 0.5px solid rgba(255,255,255,0.1);
          margin-bottom: 14px;
        }
        .sub-plan-desc strong { color: var(--white); font-weight: 500; }
        .sub-plan-cta {
          background: #fcddc0; color: #153f4d;
          padding: 11px 18px; border-radius: 4px; border: none; cursor: pointer;
          font-family: var(--sans); font-size: 12px; font-weight: 500; letter-spacing: 0.06em;
          text-decoration: none; text-align: center; display: block;
          transition: background 0.2s;
        }
        .sub-plan-cta:hover { background: #ffffff; }

        @media (max-width: 880px) {
          .drip-main { grid-template-columns: 1fr auto; }
          .drip-meta { grid-column: 1 / -1; text-align: left; display: flex; align-items: center; gap: 12px; padding-top: 8px; border-top: 0.5px dashed var(--fog2); }
          .drip-toggle { grid-row: 1; grid-column: 2; }
          .drip-detail-inner { grid-template-columns: 1fr; }
          .packages-grid { grid-template-columns: 1fr; }
          .sub-section { padding: 32px 24px; border-radius: 12px; }
          .sub-inner { grid-template-columns: 1fr; gap: 32px; }
        }
      </style>
    `;
  }

  renderMenu() {
    const cats = Object.entries(NIUS_CATEGORIES).map(([catId, cat]) => {
      const upsellIds = NIUS_UPSELLS_BY_CAT[catId] || [];
      const drips = cat.drips.map((d, i) => this.renderDripCard(d, catId, i, upsellIds)).join('');
      return `
        <div class="cat-block" data-cat="${catId}">
          <div class="cat-label"><i class="ti ${cat.icon}"></i>${cat.label}</div>
          <div class="cat-desc">${cat.desc}</div>
          <div class="drip-list">${drips}</div>
        </div>
      `;
    }).join('');

    return `
      <section>
        <div class="section-head">
          <div>
            <div class="sh-label">Services & pricing</div>
            <h2 class="sh-title">Mobile IV therapy,<br><em>at your door.</em></h2>
            <p class="sh-desc">Registered nurses delivering vitamin infusions and specialised care anywhere in Prague — 60 minutes after you book.</p>
          </div>
        </div>
        ${cats}
      </section>
    `;
  }

  renderDripCard(d, catId, idx, upsellIds) {
    const ingredients = d.ingredients.map(i => `<div class="ing-row">${i}</div>`).join('');
    const upsells = upsellIds.map(id => {
      const s = NIUS_SHOTS.find(x => x.id === id);
      if (!s) return '';
      return `
        <button class="upsell-chip" data-shot="${s.id}">
          <span class="plus">+</span>${s.name}
          <span class="price">+${s.price.toLocaleString('cs-CZ')} CZK</span>
        </button>
      `;
    }).join('');

    return `
      <article class="drip-card" data-drip="${catId}-${idx}">
        <div class="drip-main" data-toggle>
          <div class="drip-left">
            <div class="drip-name-row">
              <span class="drip-name">${d.name}</span>
              ${d.hero ? '<span class="hero-badge">Hero</span>' : ''}
            </div>
            <div class="drip-tagline">${d.tagline}</div>
            <span class="admin-pill">${d.admin} · ${d.duration}</span>
          </div>
          <div class="drip-meta">
            <div class="drip-price">${d.price.toLocaleString('cs-CZ')}<small>CZK</small></div>
            <div class="drip-price-label">nurse included</div>
          </div>
          <div class="drip-toggle">+</div>
        </div>
        <div class="drip-detail">
          <div class="drip-detail-inner">
            <div>
              <div class="detail-col-label">What’s inside</div>
              <div class="ing-list">${ingredients}</div>
              <div class="bestfor">
                <strong>Best for</strong>
                ${d.bestfor}
              </div>
            </div>
            <div>
              <div class="upsell-box">
                <div class="upsell-head"><i class="ti ti-arrow-up-circle"></i>Add a booster shot</div>
                <div class="upsell-chips">${upsells}</div>
                <div class="upsell-foot">Administered by your nurse during the same visit — no extra visit fee.</div>
              </div>
            </div>
            <div class="drip-cta-row">
              <div class="drip-cta-info">Registered nurse · medical screen included · all equipment</div>
              <a href="https://wa.me/420773629123" target="_blank" rel="noopener noreferrer" class="btn-book" data-stop>Book this drip →</a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  renderPackages() {
    const cards = NIUS_PACKAGES.map(p => `
      <div class="pkg-card ${p.featured ? 'featured' : ''}">
        ${p.badge ? `<div class="pkg-badge">${p.badge}</div>` : ''}
        <div class="pkg-name">${p.name}</div>
        <div class="pkg-tagline">${p.tagline}</div>
        ${p.customPrice ? `<div class="pkg-custom-price">${p.customPrice}</div>` : ''}
        <div class="pkg-divider"></div>
        <ul class="pkg-perks">
          ${p.perks.map(perk => `<li>${perk}</li>`).join('')}
        </ul>
        <a href="https://wa.me/420773629123" target="_blank" rel="noopener noreferrer" class="pkg-cta">${p.cta}</a>
      </div>
    `).join('');

    return `
      <section>
        <div class="section-head">
          <div>
            <div class="sh-label">Bundles</div>
            <h2 class="sh-title">Order more,<br><em>get more.</em></h2>
            <p class="sh-desc">Pre-paid bundles for regular clients, IVF patients, and anyone planning multiple visits. Choose any drips from the menu.</p>
          </div>
        </div>
        <div class="packages-grid">${cards}</div>
      </section>
    `;
  }

  renderSubscription() {
    const perks = NIUS_SUBSCRIPTION.perks.map(p => `
      <div class="sub-perk">
        <div class="sub-perk-icon">✓</div>
        <div class="sub-perk-text">
          <strong>${p.title}</strong>
          <span>${p.desc}</span>
        </div>
      </div>
    `).join('');

    const plans = NIUS_SUBSCRIPTION.plans.map(p => `
      <div class="sub-plan ${p.popular ? 'popular' : ''}">
        <div class="sub-plan-top">
          <div class="sub-plan-name">${p.name}</div>
          ${p.popular ? '<span class="sub-plan-badge">Most popular</span>' : ''}
        </div>
        <div class="sub-plan-price-row">
          <span class="sub-plan-price">${p.price.toLocaleString('cs-CZ')}</span>
          <span class="sub-plan-per">${p.per}</span>
        </div>
        <div class="sub-plan-desc">${p.desc}</div>
        <a href="https://wa.me/420773629123" target="_blank" rel="noopener noreferrer" class="sub-plan-cta">Start ${p.name} →</a>
      </div>
    `).join('');

    return `
      <section>
        <div class="sub-section">
          <div class="sub-inner">
            <div>
              <div class="sub-eyebrow">${NIUS_SUBSCRIPTION.title}</div>
              <h2 class="sub-title">${NIUS_SUBSCRIPTION.pitch.split('.')[0]}.<br><em>${NIUS_SUBSCRIPTION.pitch.split('.').slice(1).join('.').trim()}</em></h2>
              <p class="sub-desc">${NIUS_SUBSCRIPTION.desc}</p>
              <div class="sub-perks">${perks}</div>
            </div>
            <div class="sub-plans">${plans}</div>
          </div>
        </div>
      </section>
    `;
  }

  attachListeners() {
    this.shadowRoot.querySelectorAll('[data-toggle]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-stop]')) return;
        const card = el.closest('.drip-card');
        const wasOpen = card.classList.contains('open');
        this.shadowRoot.querySelectorAll('.drip-card.open').forEach(c => c.classList.remove('open'));
        if (!wasOpen) card.classList.add('open');
      });
    });

    this.shadowRoot.querySelectorAll('.upsell-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const shotId = chip.dataset.shot;
        this.dispatchEvent(new CustomEvent('nius:upsell-click', {
          detail: { shotId, shot: NIUS_SHOTS.find(s => s.id === shotId) },
          bubbles: true, composed: true
        }));
      });
    });

    this.shadowRoot.querySelectorAll('[data-stop]').forEach(el => {
      el.addEventListener('click', e => e.stopPropagation());
    });
  }
}

customElements.define('nius-menu', NiusMenu);

document.addEventListener('nius:upsell-click', (e) => {
  const { name, price } = e.detail.shot;
  const message = encodeURIComponent(`Hi NIUS, I'd like to add ${name} (+${price} CZK) to my booking.`);
  window.open(`https://wa.me/420773629123?text=${message}`, '_blank');
});
