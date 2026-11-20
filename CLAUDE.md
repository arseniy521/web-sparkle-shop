@AGENTS.md

## Content rules

- Never promise "60-minute arrival": use "same-day" instead.
- Operating hours: 8:00–21:00 daily (no 24/7).
- Avoid Google Ads banned terms: "cure", "detox", "rapid relief", "100% bioavailability", "rejuvenation", "skin brightening". Use safe alternatives.
- A new page gets a localized slug per language in `src/routes/manifest.ts`, with hreflang for every language it is published in and its entries in `public/sitemap.xml` (`check:seo` compares the sitemap with the manifest).

## Architecture in short

- Astro, static output: one manifest (`src/routes/manifest.ts`) lists every page and redirect; `src/pages/[...path].astro` picks the template of `src/templates/` for each.
- Language prefixes: Czech has none (`/`, `/iv-kapacky-praha/`), the others `/en/`, `/ru/`, `/uk/` with their own slugs (`/en/iv-drips-prague/`, `/ru/kapelnitsy-praga/`).
- Texts: `createT(lang)` over `src/i18n/locales/*.json`, Czech as the fallback.
- SEO: `BaseLayout.astro` and `src/seo/` build head, canonical, hreflang, Open Graph and JSON-LD (MedicalBusiness, BreadcrumbList, FAQPage); redirects are static stubs.
- Behaviour: plain scripts in `src/scripts/` (`boot.ts`); the order form is the only React island (`src/islands/order-form/`), loaded on demand.
