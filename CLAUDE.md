# CLAUDE.md

## Project Overview

Marketing website for **NIUS** (www.nius.cz) — a home nursing and IV drip service in Prague. Built with Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui. Deployed to GitHub Pages.

## Commands

- `npm run dev` — dev server on port 8080
- `npm run build` — production build + prerender (Vite + Puppeteer)
- `npm run lint` — ESLint
- `npm run i18n:check` — validate i18n key consistency across locales
- `npm run deploy` — build + deploy to GitHub Pages (gh-pages)

## Architecture

### Routing
React Router v6 with language-prefix pattern:
- Czech: no prefix (default) — `/`, `/iv-kapacky-praha/`
- English: `/en/`, `/en/iv-drips-prague/`
- Russian: `/ru/`, `/ru/kapelnitsy-praga/`
- Ukrainian: `/uk/`, `/uk/iv-drips-prague/`

`LanguageWrapper` component syncs URL prefix to i18next state.

### i18n
- i18next + react-i18next
- Locale files: `src/i18n/locales/{cs,en,ru,uk}.json`
- Czech is the default/fallback language

### SEO
- `SEO.tsx` — react-helmet-async for meta, canonical, OG tags
- `HreflangTags.tsx` — cross-language link tags
- `scripts/prerender.js` — Puppeteer-based SSG for 81 routes
- Structured data: schema.org MedicalBusiness, BreadcrumbList

### API
- Backend at `https://app.nius.cz` (proxied via Vite in dev)
- Onboarding form: `src/api/onboarding.ts`
- Services: `src/api/services.ts`

### Analytics
- Amplitude via `src/lib/analytics.ts` (`VITE_AMPLITUDE_API_KEY`, empty = no-op)
- Initialized only after cookie-banner consent; EU zone, no IP, no form autocapture
- Consent lives in the `nius_consent` cookie on `.nius.cz` (`src/lib/consent.ts`, twin helper in nius/frontend) — shared with app.nius.cz, legacy localStorage value migrates automatically
- Same Amplitude project as app.nius.cz — device_id cookie on `.nius.cz` stitches cross-domain funnels
- Never send PHI (phone/address/note) in event props. Tracking plan: `nius/docs/analytics.md`

### Styling
- Tailwind with custom tokens: indigo (#153f4d), bone (#f5f4ee), ink (#2a2c2e)
- Fonts: Onest (display), Montserrat (body)
- 52 shadcn/ui components in `src/components/ui/`

## Key Directories

```
src/pages/          — 16 page components
src/components/     — shared UI + section components
src/i18n/locales/   — translation JSON files
src/data/           — blog posts (static JSON)
src/constants/      — phone, booking URL, site URL
scripts/            — prerender.js, check-i18n-keys.mjs
public/brand/       — SVG logos (mark, wordmark, favicon)
```

## Content Rules

- Never promise "60-minute arrival" — use "same-day" instead
- Operating hours: 8:00–21:00 daily (no 24/7)
- Avoid Google Ads banned terms: "cure", "detox", "rapid relief", "100% bioavailability", "rejuvenation", "skin brightening". Use safe alternatives (see memory for full list).
- When adding new pages, follow localized slug pattern with proper hreflang in both component and sitemap.

## Domain

- Production: www.nius.cz (GitHub Pages + CNAME)
- Google Business: g.page/r/Cb4BmqPTZRSSEBE/review
