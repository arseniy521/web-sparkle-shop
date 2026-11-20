# AGENTS.md — www.nius.cz

## What this repository is

- The public site of NIUS (www.nius.cz), a home nursing and IV drip service in Prague: a static Astro 7 site (`output: 'static'`, `trailingSlash: 'always'`), Tailwind 4, React 19 only in the order form, Node >= 24. All commands run from the repository root. Published to GitHub Pages by the "Publish NIUS" workflow (custom domain `www.nius.cz` in the Pages settings).
- Texts are in `src/i18n/locales/{cs,en,ru,uk}.json` (Czech is the default and the fallback), blog data in `src/data/blogPosts.ts`, static files in `public/` (copied to `dist/` as they are), env keys in root `.env*` files (only `.env.example` is tracked).
- The old Vite + React site is kept only in the branch `backup/old-site` (= `main` `f0d216d`). The Astro site replaced it after a page-by-page comparison (content, screenshots, SEO), recorded in the commit that added it (NIU-17). "old:" in a comment names a file of that branch.
- Specs live in the `nius` repository, OpenSpec change `openspec/changes/site-astro-migration/`: `design.md`, `specs/`, `plan.md`, `verification.md`, `test-cases.md`, `questions.md`. "Question N" below is a number in `questions.md`. `openspec/config.yaml` here points to the store `nius`. Read the change before changing behaviour.
- A question for the owner goes into `questions.md` under the next number; work continues with the reversible option. Commit, push and publication happen only on the owner's explicit request.

## Commands

**A change is not done until the checks pass.** A check that is red for a reason listed under "Known issues" stays red and is named in the report; any other red is yours.

| Command | What it proves | Needs first |
| --- | --- | --- |
| `npm run dev` | dev server on port 8080, `/api` proxied to `NIUS_API_PROXY` (default `http://localhost:3002`) | — |
| `npm run lint` | ESLint, including the React boundary | — |
| `npm run typecheck` | `astro check` | — |
| `npm test` | unit tests (vitest, jsdom) of `src/`, `scripts/`, `tests/`; release keys are empty there (`vitest.config.ts`) | — |
| `npm run i18n:check` | the four locale files have the same keys (`scripts/check-i18n-keys.mjs`) | — |
| `npm run check:env` | the release keys are set; runs in the publication only, fails on a work machine by design | keys |
| `npm run build` | publishable build in `dist/`, every `<lastmod>` of `sitemap.xml` set to the build date | — |
| `npm run check:seo -- --scope built` | head, canonical, hreflang, robots, links, images, JSON-LD, redirects, 404, `sitemap.xml` of the built pages | `build` |
| `npm run check:e2e` | browser scenarios of `site-interactivity` on their own test build, API stubbed | — |
| `npm run check:lhci` | manual, not part of the checks: Lighthouse, median of 3, control set of `lighthouserc.cjs`; SEO = 1, accessibility >= 0.95, performance >= 0.9; run on an idle machine | `build` |
| `npm run checks` | lint, typecheck, unit tests, i18n, build, `check:seo -- --scope built`, `check:e2e` — what "Check the site" runs in a pull request | — |

Minimum before a change is reported as done:

- **Template, component, style or text:** `lint`, `typecheck`, `test`, `i18n:check` (texts), `build`, `check:seo -- --scope built`; for a new template also `check:lhci` by hand. Look at the changed pages in a browser at 390×844 and 1440×900.
- **Script or island (`src/scripts`, `src/islands`):** `lint`, `typecheck`, `test`, `build`, `check:e2e`. Follow the analytics rule below; cart, draft, consent and referral storage must stay readable for returning visitors.
- **Check or tooling (`scripts/`, `tests/`, configs):** `lint`, `typecheck`, `test`, then run the changed check and show it failing on a deliberately broken site.
- **Workflow (`.github/workflows/`):** parse the YAML and keep `${{ }}` out of `run:` (pass values through `env:`); it is proved by its first run on GitHub.
- **Before handing over a batch:** `npm run checks`.

Exit code 1 means findings, 2 means wrong usage. `check:seo` without `--scope` requires every manifest page to be built; the publication form is `npm run check:seo -- --production --dist dist` (`--production` also refuses a `robots.txt` that closes the site and a bundle without the production API address).

## Environment quirks

- Node 24 runs the `.ts` scripts directly (`node scripts/checks/seo-check.ts`). Anything such a script imports (`scripts/`, `tests/fixtures/`, `src/routes/`) must be erasable TypeScript (no enums, namespaces, parameter properties) with relative imports ending in `.ts`; the `@/` alias does not resolve there.
- Windows, Git Bash: run vitest from a `C:/…` working directory or from PowerShell. With a lowercase `/c/…` directory it reports "failed to find the current suite".
- Git Bash rewrites arguments that start with `/`: `MSYS_NO_PATHCONV=1 npm run check:e2e -- --grep /privacy/`.
- Ports (`tests/fixtures/servers.ts`): 8090 for the e2e test server. `NIUS_PORT_OFFSET=100 npm run check:e2e` shifts it, for parallel git worktrees. `npm run dev` (8080) is not shifted.
- Within one checkout run one browser check at a time: the scenarios share the port.
- Only `npm run build` writes `dist/`. The e2e build goes to `.checks/dist-e2e`: a build with the relative `/api` address must never be publishable.
- There is no `.env` in the repo (`.env.example` only). Test builds get fake keys in `tests/e2e/global-setup.ts`, unit tests in `vitest.config.ts`. Never write a real key into a file, a test or a report.
- `.gitattributes` forces LF (`* text=auto eol=lf`): with `core.autocrlf=true` a CRLF checkout breaks exact-text tests. Write new files with LF.
- `@astrojs/react` is pinned to exactly 7.1.3: 7.1.4–7.1.6 failed to load the Astro config (question 23).
- Under `astro dev` the order form needs the React refresh preamble injected by `astro.config.ts`; the warning `[react-refresh-preamble]` means the form will not open in dev. The build is not affected.

## Analytics, consent, personal data

When behaviour changes, check the events it sends and the data that arrives: event names and properties in the e2e assertions and in the tracking plan `docs/analytics.md` of the `nius` repo. Changes to consent, analytics, the partner code or the order form are reviewed in the `security-reviewer` role (`.claude/agents/security-reviewer.md` in `nius`).

- **Nothing is loaded or sent before consent.** Amplitude is imported dynamically only when `nius_consent` is `accepted` (`src/scripts/analytics.ts`); an event tracked earlier is dropped, not queued. `web-vitals` loads only after consent. Reject opts Amplitude out, sets the `ga-disable` flag and expires the Google cookies (`_ga*` and the Ads cookies `_gcl_*`). Amplitude: US zone (must match the project region of the API key), no IP, no form autocapture; the same project as app.nius.cz, its device id cookie on `.nius.cz` stitches the funnels.
- **Google tags, Consent Mode v2:** the inline `<head>` script (`gtag-bootstrap.ts`, the script of the old site's `index.html`) denies every signal by default with `ads_data_redaction` and loads `gtag.js` only through `__niusGrantConsent()`: on page load with stored consent (cookie first, the legacy record only without a valid cookie) or after Accept. `ga.ts` registers the Ads account (`VITE_GOOGLE_ADS_ID`) once per page with consent, pushes the denied update on Reject and sends the Google events: `contact` (phone/WhatsApp click) + Ads `conversion` "Outbound click" (`VITE_GOOGLE_ADS_CONTACT_LABEL`, every click, value 1 CZK, no other parameter), and `generate_lead` + Ads `conversion` (`VITE_GOOGLE_ADS_LEAD_LABEL`) once per created order, `transaction_id` = order id, value in CZK, service codes. Empty Ads variables send no Ads config or conversion; `check:env` warns.
- **Cookie banner:** any `[data-cookie-settings]` control (footer) shows it again (delegated click); it stays hidden while the order form is open and the choice stays pending.
- Consent is the cookie `nius_consent` (180 days), on `.nius.cz` only when the host is exactly `www.nius.cz`, otherwise on the current host (`cookie-domain.ts`); app.nius.cz reads the same cookie. The legacy `localStorage` record of the old site is still read and written, for returning visitors (question 52).
- **No PHI anywhere outside the form's own requests:** phone, address, name, note and tokens never appear in event properties, logs, test data, screenshots or reports. Paths go through `cleanPath()` (no query, no hash). `client_error` carries the block name and the error type only, at most 5 per page. The draft with phone and address stays in `sessionStorage` (`nius_onboarding_draft_v2`, 24 h) and is copied nowhere else (question 6).
- Tests type only the synthetic `VISITOR` of `tests/fixtures/amplitude.ts` and assert that `visitorDataIn(payloads)` is empty.
- **Partner code (NIU-28):** `captureReferral()` is the first call of `boot.ts` and does not depend on consent (owner decision). `?ref=` is upper-cased and kept only if it matches `^[A-HJKMNP-Z2-9]{6}$` (no `I`, `L`, `O`, `0`, `1`); cookie `nius_ref`, 30 days; sent as `referralCode` on `POST /onboarding/order` only when present. Example for tests: `K7M2QX`. Publish only while the backend that accepts `referralCode` is live, otherwise order creation returns 400.
- **Tracked links:** `link-tracker.ts` sends `cta_clicked` for `tel:` links, `wa.me` links and links with `data-cta` (a value of `CONVERSION_CTAS`; `data-analytics-source` from `CONVERSION_SOURCES`, default `page_content`). A static site leaves the page before the SDK uploads, so a tracked click that unloads the tab is held: `preventDefault`, flush, then `location.assign` when the upload ends or after 300 ms. Held only with a loaded, opted-in SDK. Never held: modified or non-primary clicks, `target` other than `_self`, `download`, `tel:`/`mailto:`, same-page hash links, links with `rel=noreferrer` or `referrerpolicy`.
- Every own event carries `language` from `<html lang>`.

## Folders and the React rule

| Path | Holds | Rule |
| --- | --- | --- |
| `src/routes/` | `manifest.ts` (62 pages, 16 redirects), `urls.ts` | the only source of addresses; links and JSON-LD URLs come from `pageUrl(id, lang)` / `absoluteUrl()`, never from string literals |
| `src/pages/` | `[...path].astro`, `404.astro` | no markup, only template selection |
| `src/layouts/` | `BaseLayout.astro` | the only place of `<head>` and meta tags; the cookie banner stays first in `<body>` |
| `src/templates/` | one `.astro` per kind of page, `registry.ts` | a manifest page whose template is not in `registry.ts` is not built |
| `src/components/` | static `.astro` blocks, `ui/` primitives | no React |
| `src/islands/` | the order form, `.tsx` | **React, Radix, TanStack Query, sonner only here** |
| `src/scripts/` | behaviour modules, cart core, analytics | no React; wired in `boot.ts`; the form is loaded on demand by `form-bridge.ts` (dynamic import only) |
| `src/seo/`, `src/i18n/` | `buildHead`, `serializeJsonLd`, `faqPageSchema`; `createT(lang)`, `safeRichHtml`, `locales/` | — |
| `src/data/`, `src/assets/` | blog posts; images imported by templates (published under `_astro/`) | — |
| `src/styles/global.css` | theme tokens, Tailwind 3 compatibility rules | — |
| `public/` | files published as they are: `robots.txt`, `sitemap.xml`, `brand/`, `photos/`, `js/nius-menu.js` (the service catalog web component), OG images, `assets/` (three images of the old site kept at their old addresses for image search, question 108) | the 404 page is `src/pages/404.astro`, never a `public/404.html` |
| `scripts/`, `tests/` | build helpers and checks; `e2e/`, `fixtures/` (the API stub in `fixtures/api/`) | — |

ESLint enforces the React rule (`eslint.config.js`, proved by `tests/lint-boundary.test.ts`): no React import and no `.tsx` outside `src/islands/`, no static import of an island from a script.

Adding a page:

1. Entry in `src/routes/manifest.ts`, with a localized slug per language; hreflang and `sitemap.xml` follow from the manifest (`check:seo` compares `public/sitemap.xml` with it).
2. Template in `src/templates/`; pattern: `SestrickaPraha1.astro`.
3. Register it in `src/templates/registry.ts`.
4. A new template adds one of its pages to the control set in `lighthouserc.cjs`.
5. Page behaviour goes to `src/scripts/` and `boot.ts`, with a scenario in `tests/e2e/`.
6. Run the template minimum above.

Markup rules:

- FAQ markup carries `data-faq`, `data-faq-item`, `data-faq-question`, `data-faq-answer`; `check:seo` compares it with the `FAQPage` JSON-LD.
- JSON-LD is emitted only through `serializeJsonLd` (it escapes `<`).
- Phone and WhatsApp in shared components are literal text. `Breadcrumbs` does not rewrite `/#…` links: pass the final address.
- `[data-open-cart]` buttons are bound once at start (`header-state.ts`, `form-bridge.ts`): a button created later gets no handler, the code that creates it subscribes it.
- `BookingLink.astro` without `serviceCode` opens the order form only with a filled cart. With an empty cart it scrolls to `#menu` of the page, or goes to the home page menu when the page has none (`booking-link.ts`). A page that shows the service menu renders `MenuSection.astro` and loads `/js/nius-menu.js` in its `<head>` slot, as `Home.astro` does.
- The bottom bar (`StickyBar.astro`, `sticky-bar.ts`) needs a hero with `id="home"`; it is on the home page and the drips page. The drips page's JSON-LD offers and its drip guide (`#drip-guide`, the composition of every drip as text in the HTML, under the catalog) come from `src/data/dripPrices.ts`, whose test compares names, codes and prices with `public/js/nius-menu.js`.
- The header menu script lives in `Header.astro` so that it works before the rest of the code loads.
- The stories card's photos (`Hero.astro`) are imported from `public/photos/` and turned into WebP `srcset` candidates by `astro:assets` (`getImage`, sharp) at build time; `src` keeps the original file (question 106). Do not copy derived images into `public/`.
- On the home page (route id `home`) the header links to its sections by fragment only (`#menu`, …); `same-page-scroll.ts` scrolls to a section of the page and, for the header logo (`data-logo-link`), to the top, instead of following the link.

## Tailwind

- Tailwind collects classes from `src/` only (`@import "tailwindcss" source("../")` in `global.css`): a class written in a doc, a test or `public/` does not reach the site's CSS. A class built from strings must appear whole somewhere in `src/`.
- The site was ported from Tailwind 3. Names that changed meaning:

| Tailwind 3 | Here | Why |
| --- | --- | --- |
| `shadow-sm` | `shadow-xs` | the same name draws a different shadow in Tailwind 4 |
| `outline-none` | `outline-hidden` | the same name behaves differently in Tailwind 4 |
| `var(--color-border)` (the site's own variable) | `var(--color-line)`, `--color-line-on-dark` | `--color-border` is the theme colour `border` in Tailwind 4 |
| `tailwindcss-animate` | `tw-animate-css` | plugin replaced |
| `scrollbar-none` | removed | a no-op in Tailwind 3, hides the scrollbar in Tailwind 4 |

- Not renamed: `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg` (the theme sets the radii). `shadow` → `shadow-sm` and `ring` → `ring-3` when a Tailwind 3 class is ported.
- `leading-*` together with a responsive `bp:text-N` on one element: add `bp:leading-<Tailwind 3 line height of text-N>` — `xs` 4, `sm` 5, `base` 6, `lg` and `xl` 7, `2xl` 8, `3xl` 9, `4xl` 10, `5xl` and larger `leading-none`. In Tailwind 4 `leading-*` beats the line height of a later `text-*`.
- `global.css` restores Tailwind 3 behaviour for `container` (no intermediate max-widths), `space-y-*` and the white input background. `space-x-*` and `space-y-px`, arbitrary, negative and reverse values use Tailwind 4 rules. The `space-y` reset must stay below `@import "tailwindcss"`.
- Theme: indigo `#153f4d`, bone `#f5f4ee`, ink `#2a2c2e`; fonts Plus Jakarta Sans (display) and Montserrat (body), self-hosted through `@fontsource`.
- sonner 2 injects its styles outside CSS layers: toast classes need the `!` suffix.
- The `prose*` classes of the privacy policy are inert: do not add the typography plugin.

## Lessons

- A red check is never made green by weakening an assertion, by raising a threshold (`lighthouserc.cjs`) or by skipping a test. Fix the site, or record a question and leave the check red.
- A test must not reach a real host. Import `test` from `tests/fixtures/network-guard.ts`; requests sent at unload bypass page routes, so the e2e project also blocks name resolution; an API call the stub does not know gets 404, never the network.
- Mutation-check every new test and check: break the site, see it fail. Review once found five scenarios that passed on a broken site.
- Do not fix a lost click event with a beacon at `pagehide`: it bypasses the stubs and reaches the real service from tests. Deliver the event while the page is alive.
- A randomly red test hides other failures: make it deterministic and annotate the gap it no longer covers (see `web_vital`).
- Screenshots do not show DOM order: reading and Tab order need their own assertion.
- Parallel page work: one worktree per task, and the edits of `src/templates/registry.ts` in a separate last commit, so that integration does not conflict.

## Known issues

- `web_vital` for LCP and CLS is lost when the tab closes or navigates; the scenario covers only a hidden live page and carries a `known gap` annotation (question 10).
- Link tracker: a later handler that cancels a tracked click is overridden, the link is still followed (N2; nothing does that today). Links inside shadow roots are never held (N4). Links with `rel=noreferrer` are not held, their event may be lost (question 28).
- `check:seo` compares `sitemap.xml` with the manifest, not with the build.
- Two defects kept from the old pages: the phone layouts of `/narozeninovy-darek-praha/` (479 px) and `/ru/podatok-k-dnju-rozhdenija-praga/` (429 px) are wider than 390 px; on `/disabled-daily-care-prague/` the MedicalBusiness `url` and the post-surgery link lead to the Czech address in every language. The Women's Day countdown is decided at build time (expired after 2026-03-08).
- Browser scenarios run in Chromium only; Safari 15 and older is not checked (owner decision). Scenarios use a stand-in for `gtag.js`. Manual Google sign-in was never checked.
- `check:lhci` makes anonymous requests to the production API, as any page load does (question 31). The drips page scores exactly 0.95 for accessibility (question 43).
- Header dropdowns are disclosures (Tab, Escape), without arrow-key navigation (question 15); choosing the current language reloads the page (question 30).
- Deferred minors: `header-menu.test.ts` depends on test order (`initHeaderMenu` is not idempotent); `buttonLink()` in `IvDripTherapy.astro` repeats the classes of `Button.astro`; `background-color: revert` in `global.css` also reaches button-type inputs.

## Publication

- `main` accepts only pull requests with "Check the site" green; the checks run there, once.
- Publication is manual: Actions → "Publish NIUS" → Run workflow, branch `main`. It builds `main` with the release keys, runs `check:env` and `check:seo -- --production --dist dist`, and deploys the build to GitHub Pages (2–3 minutes). Merging publishes nothing. An agent never starts a publication.
- Release keys are repository secrets: `VITE_AMPLITUDE_API_KEY`, `VITE_MAPY_API_KEY`, `VITE_GOOGLE_CLIENT_ID` (required), `VITE_GOOGLE_ADS_ID`, `VITE_GOOGLE_ADS_LEAD_LABEL`, `VITE_GOOGLE_ADS_CONTACT_LABEL` (optional, `check:env` warns). They are baked into the build, so a changed secret needs a new publication.
- Rollback: Actions → "Publish NIUS" → the last good run with the jobs `build` and `deploy` → "Re-run all jobs" (it rebuilds that run's commit; possible for 30 days). Older than that: revert the pull request and publish. Runs from before the switch to GitHub Actions deployment (jobs `checks`, `build`, `publish`) push to the `gh-pages` branch and roll nothing back; while `gh-pages` is kept, the old state comes back by pointing Settings → Pages → Source at the branch `gh-pages`.
- After a publication check on www.nius.cz: the home page in four languages, the cookie banner, an order on test data.

## Domain

- Production: www.nius.cz (GitHub Pages; the custom domain is set in the Pages settings). Backend: `https://app.nius.cz/api` unless `VITE_API_URL` is set (`src/scripts/env.ts`).
- Google Business: g.page/r/Cb4BmqPTZRSSEBE/review
