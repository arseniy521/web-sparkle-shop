# AGENTS.md — the new site (`astro/`)

## What this folder is

- The static rewrite of www.nius.cz: Astro 7 (`output: 'static'`, `trailingSlash: 'always'`), Tailwind 4, React 19 only in the order form, Node >= 24, its own `package.json` and lock. All commands below run from `astro/`.
- The old Vite + React site in the repo root is still published and is still the source of: texts `../src/i18n/locales/*.json` (alias `@old`), blog data `../src/data/blogPosts.ts`, static files `../public/`, the key check `../scripts/check-i18n-keys.mjs`, and env files (`envDir: '..'`).
- `astro/public/` is a generated copy of `../public/` without `404.html` (`scripts/sync-public.mjs`, runs before `dev` and `build`). It is gitignored: never edit it.
- Files of the old site are not edited without the owner's consent (question 29). A text fix in `../src/i18n/locales` changes both sites.
- Wave 1 publishes a merge: the nine addresses of `checks/wave1-paths.json` come from this build, every other page from the old build.
- Specs live in the `nius` repository, OpenSpec change `openspec/changes/site-astro-migration/` (normally checked out at `../../nius/`): `design.md`, `specs/`, `plan.md`, `verification.md`, `test-cases.md`, `questions.md`. "Question N" below is a number in `questions.md`. Read the change before changing behaviour.
- A question for the owner goes into `questions.md` under the next number; work continues with the reversible option. Commit, push and publication happen only on the owner's explicit request.

## Commands

**A change is not done until the checks pass.** A check that is red for a reason listed under "Known issues" stays red and is named in the report; any other red is yours.

| Command | What it proves | Needs first |
| --- | --- | --- |
| `npm run lint` | ESLint, including the React boundary | — |
| `npm run typecheck` | `astro check` | — |
| `npm test` | unit tests (vitest, jsdom) of `src/`, `scripts/`, `preview/`, `tests/` | — |
| `npm run i18n:check` | the four locale files have the same keys (old site's script) | — |
| `npm run check:env` | the release keys are set; fails on a work machine by design, CI only | keys |
| `npm run build` | publishable build in `dist/` with `CNAME` and `.nojekyll` | — |
| `npm run check:seo -- --scope built` | check 3: head, canonical, hreflang, robots, links, images, JSON-LD, redirects, 404, `sitemap.xml` of the built pages | `build` |
| `npm run baseline` | builds the reference: the old site in `.baseline/dist` (72 pages = 65 prerendered + 7 rendered from the old app). Runs `npm ci` and the old build in the repo root, takes minutes | once, and after any old-site change |
| `npm run check:content` | check 1: nothing of the old page's text, links, images, head or JSON-LD is missing. Exit 1 on any `missing` line, 2 when nothing was compared. One page: `-- --only /privacy/` | `baseline`, `build` |
| `npm run check:visual` | check 2: screenshots old vs new at 390×844 and 1440×900, header states, 404, order form steps; fails above 0.1 % of pixels or on any size difference. Report in `.checks/visual/` | `baseline` |
| `npm run check:e2e` | check 5: browser scenarios of `site-interactivity` on its own test build, API stubbed | — |
| `npm run check:merged` | scenarios across old and new pages on a local release merge (cart and consent carry over, the seam) | `baseline` |
| `npm run check:lhci` | check 4: Lighthouse, median of 3, control set of `lighthouserc.cjs`; SEO = 1, accessibility >= 0.95, performance >= 0.9 | `build` |
| `npm run checks:report` | prints the page registry `.checks/registry.json` | any check |
| `npm run checks` | lint, typecheck, unit tests, i18n, build, `check:seo -- --scope built`, `check:e2e`, `check:lhci` — the `astro-checks` workflow without `check:env` | — |
| `npm run release:merge` | `release-dist/` = old build without the 7 reference-only pages + wave-1 pages, `_astro/`, `.nojekyll` of `dist/`. Empties only a missing, empty or earlier-merge output folder (`CNAME` and `_astro/` inside); delete a half-written one by hand | `baseline`, `build` |
| `npm run preview:assemble` | preview build in `.preview/` (API stub, `noindex`, closed `robots.txt`) | — |

Minimum before a change is reported as done:

- **Template, component, style or text:** `lint`, `typecheck`, `test`, `i18n:check` (texts), `build`, `check:seo -- --scope built`, `check:content`, `check:visual`; `check:lhci` for a new template. A page is ready when its registry row has `content`, `visual-phone`, `visual-desktop` and `seo` equal to `pass` or `accepted`.
- **Script or island (`src/scripts`, `src/islands`):** `lint`, `typecheck`, `test`, `build`, `check:e2e`; `check:visual` when rendering can change; `check:merged` when cart, draft, consent or referral storage is touched (old pages share it in wave 1). Follow the analytics rule below.
- **Check or tooling (`scripts/`, `checks/`, `tests/`, configs):** `lint`, `typecheck`, `test`, then run the changed check and show it failing on a deliberately broken site.
- **Workflow (`.github/workflows/`):** cannot be run locally. Parse the YAML, replay the `run:` steps against a throwaway repo where possible, keep `${{ }}` out of `run:` (pass values through `env:`), and list what stays unverified. A new old-site file read by this site is added to `paths` in `astro-checks.yml`.
- **Before handing over a batch:** `npm run checks`, plus `check:content`, `check:visual`, `check:merged`.

Exit code 1 means findings, 2 means wrong usage. `check:seo` without `--scope` requires every manifest page to be built and writes `fail` rows for the rest; the publication form is `npm run check:seo -- --production --dist release-dist --scope checks/wave1-paths.json --known checks/known-defects-old.json`.

## Environment quirks

- Node 24 runs the `.ts` scripts directly (`node scripts/checks/seo-check.ts`). Anything such a script imports (`scripts/`, `checks/`, `tests/fixtures/`, `src/routes/`) must be erasable TypeScript (no enums, namespaces, parameter properties) with relative imports ending in `.ts`; the `@/` and `@old` aliases do not resolve there.
- Windows, Git Bash: run vitest from a `C:/…` working directory (`cd C:/Users/…/astro`) or from PowerShell. With a lowercase `/c/…` directory it reports "failed to find the current suite".
- Git Bash rewrites arguments that start with `/`: `MSYS_NO_PATHCONV=1 npm run check:content -- --only /privacy/` (same for `check:visual -- --grep`).
- `wrangler` looks for `functions/` in its working directory: `npm run preview:assemble`, then `cd .preview && npx wrangler pages dev dist`. Run from `astro/` it finds no functions and leaves a stray `.wrangler/`.
- Ports (`tests/fixtures/servers.ts`): 8080 new site (visual), 8081 old site (visual), 8090 e2e, 8091 merged. `NIUS_PORT_OFFSET=100 npm run check:e2e` shifts all four, for parallel git worktrees. Not shifted: `npm run baseline` (8082) and `npm run dev` (8080, `/api` proxied to `NIUS_API_PROXY`, default `http://localhost:3002`).
- A parallel worktree gets its own offset and a copy of `.baseline/` instead of a rebuild. Within one checkout run one check at a time: the checks share the ports and `.checks/registry.json`.
- Only `npm run build` writes `dist/`. Test and preview builds go to `.checks/dist-test`, `.checks/dist-e2e`, `.checks/dist-merged`, `.preview/build`: a build with the relative `/api` address must never be publishable.
- There is no `.env` in the repo (root `.env.example` only). Test builds get fake keys in `tests/e2e/global-setup.ts`, unit tests in `vitest.config.ts`. Never write a real key into a file, a test or a report.
- `.gitattributes` forces LF (`* text=auto eol=lf`): with `core.autocrlf=true` a CRLF checkout breaks exact-text tests. Write new files with LF.
- Run `check:lhci` on an idle machine, with no other build or browser check running: performance is a hard threshold and the score depends on machine load.
- `@astrojs/react` is pinned to exactly 7.1.3: 7.1.4–7.1.6 failed to load the Astro config (question 23).
- Under `astro dev` the order form needs the React refresh preamble injected by `astro.config.ts`; the warning `[react-refresh-preamble]` means the form will not open in dev. The build is not affected.

## Analytics, consent, personal data

When behaviour changes, check the events it sends and the data that arrives: event names and properties in the e2e assertions and in the tracking plan `docs/analytics.md` of the `nius` repo. Changes to consent, analytics, the partner code or the order form are reviewed in the `security-reviewer` role (`.claude/agents/security-reviewer.md` in `nius`).

- **Nothing is loaded or sent before consent.** Amplitude is imported dynamically only when `nius_consent` is `accepted` (`src/scripts/analytics.ts`); an event tracked earlier is dropped, not queued. `gtag.js` (`ga.ts`) and `web-vitals` load only after consent. Reject opts Amplitude out, sets the `ga-disable` flag and expires the `_ga` cookies.
- Consent is the cookie `nius_consent` (180 days), on `.nius.cz` only when the host is exactly `www.nius.cz`, otherwise on the current host (`cookie-domain.ts`). The legacy `localStorage` record is still read and written: old pages read only that record until wave 2 (question 52).
- **No PHI anywhere outside the form's own requests:** phone, address, name, note and tokens never appear in event properties, logs, test data, screenshots or reports. Paths go through `cleanPath()` (no query, no hash). `client_error` carries the block name and the error type only, at most 5 per page. The draft with phone and address stays in `sessionStorage` (`nius_onboarding_draft_v2`, 24 h) and is copied nowhere else (question 6).
- Tests type only the synthetic `VISITOR` of `tests/fixtures/amplitude.ts` and assert that `visitorDataIn(payloads)` is empty.
- **Partner code:** `captureReferral()` is the first call of `boot.ts` and does not depend on consent (owner decision). `?ref=` is upper-cased and kept only if it matches `^[A-HJKMNP-Z2-9]{6}$` (no `I`, `L`, `O`, `0`, `1`); cookie `nius_ref`, 30 days; sent as `referralCode` when the order is created. Example for tests: `K7M2QX`.
- **Tracked links:** `link-tracker.ts` sends `cta_clicked` for `tel:` links, `wa.me` links and links with `data-cta` (a value of `CONVERSION_CTAS`; `data-analytics-source` from `CONVERSION_SOURCES`, default `page_content`). A static site leaves the page before the SDK uploads, so a tracked click that unloads the tab is held: `preventDefault`, flush, then `location.assign` when the upload ends or after 300 ms. Held only with a loaded, opted-in SDK. Never held: modified or non-primary clicks, `target` other than `_self`, `download`, `tel:`/`mailto:`, same-page hash links, links with `rel=noreferrer` or `referrerpolicy`.
- Every own event carries `language` from `<html lang>`.

## Folders and the React rule

| Path | Holds | Rule |
| --- | --- | --- |
| `src/routes/` | `manifest.ts` (pages, redirects), `urls.ts` | the only source of addresses; links and JSON-LD URLs come from `pageUrl(id, lang)` / `absoluteUrl()`, never from string literals |
| `src/pages/` | `[...path].astro`, `404.astro` | no markup, only template selection |
| `src/layouts/` | `BaseLayout.astro` | the only place of `<head>` and meta tags; the cookie banner stays first in `<body>` |
| `src/templates/` | one `.astro` per kind of page, `registry.ts` | a manifest page whose template is not in `registry.ts` is not built |
| `src/components/` | static `.astro` blocks, `ui/` primitives | no React |
| `src/islands/` | the order form, `.tsx` | **React, Radix, TanStack Query, sonner only here** |
| `src/scripts/` | behaviour modules, cart core, analytics | no React; wired in `boot.ts`; the form is loaded on demand by `form-bridge.ts` (dynamic import only) |
| `src/seo/`, `src/i18n/` | `buildHead`, `serializeJsonLd`, `faqPageSchema`; `createT(lang)`, `safeRichHtml` | — |
| `src/styles/global.css` | theme tokens, Tailwind 3 compatibility rules | — |
| `scripts/`, `checks/`, `tests/`, `preview/` | build helpers and checks; owner lists; `e2e/`, `visual/`, `fixtures/`; preview functions and the API stub | — |

ESLint enforces the React rule (`eslint.config.js`, proved by `tests/lint-boundary.test.ts`): no React import and no `.tsx` outside `src/islands/`, no static import of an island from a script.

Adding a page:

1. Entry in `src/routes/manifest.ts` (all 62 pages of the old site are already listed).
2. Template in `src/templates/`, ported by the rules below; pattern: `SestrickaPraha1.astro`.
3. Register it in `src/templates/registry.ts`.
4. A new template adds one of its pages to the control set in `lighthouserc.cjs`.
5. Page behaviour goes to `src/scripts/` and `boot.ts`, with a scenario in `tests/e2e/`; the registry gets an `e2e` row only for the pages listed in `PAGES` of `tests/e2e/registry-reporter.ts`.
6. Run the template minimum above and read the page's registry row.

Porting rules:

- Keep texts, links and images in the old page's order in the markup: the content check compares order.
- FAQ markup carries `data-faq`, `data-faq-item`, `data-faq-question`, `data-faq-answer`; check 3 compares it with the `FAQPage` JSON-LD.
- JSON-LD is emitted only through `serializeJsonLd` (it escapes `<`).
- Markup the old HTML does not have (e.g. a closed menu) is not added to the exclusions of the content check without the owner's decision; describe the difference in the report.
- Phone and WhatsApp in shared components are literal text, as in the old components. `Breadcrumbs` does not rewrite `/#…` links: pass the final address.
- `[data-open-cart]` buttons are bound once at start (`header-state.ts`, `form-bridge.ts`): a button created later gets no handler, the code that creates it subscribes it.
- The header menu script lives in `Header.astro` so that it works before the rest of the code loads.

## Tailwind 3 → 4

| Old site | Here | Why |
| --- | --- | --- |
| `shadow-sm` | `shadow-xs` | the same name draws a different shadow in Tailwind 4 |
| `outline-none` | `outline-hidden` | the same name behaves differently in Tailwind 4 |
| `var(--color-border)` (the site's own variable) | `var(--color-line)`, `--color-line-on-dark` | `--color-border` is the theme colour `border` in Tailwind 4 |
| `tailwindcss-animate` | `tw-animate-css` | plugin replaced |
| `scrollbar-none` | removed | a no-op in Tailwind 3, hides the scrollbar in Tailwind 4 |

- Not renamed: `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg` (the theme sets the radii). The prototype also confirmed `shadow` → `shadow-sm` and `ring` → `ring-3`; no ported file has needed them so far.
- `leading-*` together with a responsive `bp:text-N` on one element: add `bp:leading-<Tailwind 3 line height of text-N>` — `xs` 4, `sm` 5, `base` 6, `lg` and `xl` 7, `2xl` 8, `3xl` 9, `4xl` 10, `5xl` and larger `leading-none`. In Tailwind 4 `leading-*` beats the line height of a later `text-*`.
- `global.css` restores Tailwind 3 behaviour for `container` (no intermediate max-widths), `space-y-*` and the white input background. `space-x-*` and `space-y-px`, arbitrary, negative and reverse values use Tailwind 4 rules. The `space-y` reset must stay below `@import "tailwindcss"`.
- sonner 2 injects its styles outside CSS layers: toast classes need the `!` suffix.
- The `prose*` classes of the privacy policy are inert, as on the old site: do not add the typography plugin.

## Owner-controlled lists

- `checks/approved-differences.ts` — the 13 approved differences of design decision 9 and how the content check treats each; `hotelTextReplacements` and `blogImageReplacements` stay empty until the owner agrees.
- `checks/visual-accepted.json` — accepted pixel differences per path and viewport; a size difference fails even when listed. Empty.
- `checks/known-defects-old.json` — `{ rule, path, note }` for old pages in the merged release (`check:seo --known`). Empty.
- `checks/wave1-paths.json` — the nine addresses taken from the new build in wave 1.

These files change only with the owner's explicit consent. A red check is never made green by editing them, by weakening an assertion, by raising a threshold (`MAX_RATIO` in `tests/visual/compare.ts`, `lighthouserc.cjs`), by widening `NEW_ONLY_MARKUP` in `compare-content.ts` or by skipping a test. Fix the site, or record a question and leave the check red.

## Lessons

- Compare content as ordered runs of block text with repeats, links as a multiset of (address with query and hash, text), images as (file, `alt`). Substring and set comparison let a changed price, a removed repeated card and a retargeted link pass.
- The reference is the old site's production build, never its dev server: the dev server orders CSS differently and a toast border was once removed because of it.
- The 404 page is compared with the old static `404.html`, the file GitHub Pages serves, not with the old app's NotFound screen.
- The reference opens its seven extra routes without a trailing slash, as the old prerender does: the old header builds the return address from `location.pathname`.
- The release merge takes the plain old build (the reference minus `extraRoutes` of `.baseline/baseline.json`); otherwise a synthetic page is published.
- A test must not reach a real host. Import `test` from `tests/fixtures/network-guard.ts`; requests sent at unload bypass page routes, so the e2e projects also block name resolution; an API call the stub does not know gets 404, never the network.
- Mutation-check every new test and check: break the site, see it fail. Review found five scenarios that passed on a broken site.
- Do not fix a lost click event with a beacon at `pagehide`: it bypasses the stubs and reaches the real service from tests. Deliver the event while the page is alive.
- A randomly red test hides other failures: make it deterministic and annotate the gap it no longer covers (see `web_vital`).
- Do not stabilise a screenshot with a tool that changes rendering unless the same test proves it neutral on the new site; two such attempts were rejected.
- Screenshots do not show DOM order: the cookie banner was last in the markup and looked the same. Reading and Tab order need their own assertion.
- A complete run of a check clears its registry column; a narrowed run (`--only`, `--grep`, a file filter) rewrites only its own rows, and a narrowed `check:e2e` records nothing. When the table looks stale, delete `.checks/registry.json` and rerun.
- Parallel page work: one worktree per task, and the edits of `src/templates/registry.ts` and `lighthouserc.cjs` in separate last commits, so that integration does not conflict.

## Known issues

- `check:visual`: five order form comparisons at 390×844 (cart, address, timing, phone, note) fail; the old site's raster is 1 px lower. Registry row `order-form`, `visual-phone` (question 2).
- `web_vital` for LCP and CLS is lost when the tab closes or navigates; the scenario covers only a hidden live page and carries a `known gap` annotation (question 10).
- Link tracker: a later handler that cancels a tracked click is overridden, the link is still followed (N2; nothing does that today). Links inside shadow roots are never held (N4). Links with `rel=noreferrer` are not held, their event may be lost (question 28).
- The registry has no locking between processes and Playwright runs with `workers: 1`; to be reworked when all 62 pages are compared.
- Wave-1 seam: a link inside the old app to a wave-1 address shows the old version until a reload or a direct visit; asserted in `tests/e2e/merged.spec.ts` (question 53).
- Wave-1 publish gate: `check:seo --production` on the merged build reports about 227 findings, all on old pages, so the "Check SEO of the merged build" step of `publish.yml` fails until the owner decides (question 50).
- In wave 1 the 404 page stays old (question 44) and old pages still load Google Analytics before consent (questions 45, 51).
- `astro` is not merged into `main` until question 29 is decided: the old site's root `vitest` and `eslint` pick up `astro/`. Workflows can be started by hand only from the default branch (question 32).
- No workflow of this site has ever run on GitHub (questions 54, 58, 59).
- Check 3 compares `sitemap.xml` with the manifest, not with the build: `/en/iv-drip-hotel-prague/` is listed and has no page until wave 2.
- The content check does not compare `placeholder`, `aria-label` outside links, or link order; closed header menus are excluded from the new page's facts (question 16).
- Screenshots are Chromium at pixel ratio 1 only; Safari 15 and older is not checked (owner decision). Scenarios use a stand-in for `gtag.js`. Manual Google sign-in was never checked.
- `check:lhci` and `baseline` make anonymous requests to the production API, as any page load does (question 31). The drips page scores exactly 0.95 for accessibility (question 43).
- The preview is built with the production analytics keys and is open to anyone (questions 7, 27).
- Header dropdowns are disclosures (Tab, Escape), without arrow-key navigation (question 15); choosing the current language reloads the page (question 30).
- Deferred minors: `header-menu.test.ts` depends on test order (`initHeaderMenu` is not idempotent); `drip-filter.ts` queries generic `[data-filter]` / `[data-category]`; `buttonLink()` in `IvDripTherapy.astro` repeats the classes of `Button.astro`; `background-color: revert` in `global.css` also reaches button-type inputs.

## Publication and rollback

**Neither workflow has run on GitHub yet; everything below is unproven until the first dry run.** An agent never starts a real publication or a rollback and never pushes to `gh-pages`.

- Publication goes only through "Publish NIUS" (`.github/workflows/publish.yml`), started by hand from `main`, input `dry_run` (default `true`). Jobs: `checks` (calls `astro-checks.yml`) → `build` (env check, old site lint and tests, `baseline`, `build`, `release:merge`, SEO, content, Lighthouse, `check:merged`, artifact `release-dist`) → `publish`.
- `publish` runs only with `dry_run` unticked and on `main`, and waits for the owner's approval of the `production` environment. It refuses when `gh-pages` moved since the build or when the artifact has fewer pages than `gh-pages`, tags the previous head `published-YYYYMMDD-HHMM` (UTC), pushes an ordinary commit and waits up to 10 minutes for GitHub Pages to build it.
- Rollback: "Roll back NIUS to a published build" (`rollback.yml`), from `main`, input `tag` in the same format, same approval. It restores the tag's tree as an ordinary commit; no build, no checks. The tag must be a past state of `gh-pages` (an ancestor of its head): a tag pushed onto any other commit is refused, and a forced push to `gh-pages` makes every earlier tag unusable. If a publication is waiting for approval, reject it first.

First run:

1. Owner settings (question 55): environment `production` with the owner as required reviewer and `main` as the only deployment branch; rulesets for `gh-pages` (no force push, no deletion) and for tags `published-*`; the three `VITE_*` secrets; Pages source `gh-pages` / root (question 54).
2. The workflow files reach `main` (questions 29, 32). The push must start only "Check the Astro site" and must not move `gh-pages`.
3. Dry run from `main`. Expect `checks` and `build` green (after question 50) and `publish` skipped. In `release-dist`: `.nojekyll`, `CNAME` = `www.nius.cz`, `_astro/`, `sitemap.xml`, `robots.txt`, `404.html`; 71 pages (65 old + 6 new-only); the nine wave-1 pages reference `/_astro/`.
4. Owner review: the screenshot report (`.checks/visual/` locally, or the artifact `visual-report` of the preview workflow), and that the backend accepting `referralCode` is live.
5. Rollback rehearsal, below.
6. Real run at a quiet hour: `dry_run` unticked, the owner approves. The summary names the tag and says that Pages deployed the commit.
7. Within 10 minutes on www.nius.cz: a wave-1 page loads its `/_astro/` files; an old page, `/robots.txt` and `/sitemap.xml` are as before; an unknown address gives the old `404.html`; the custom domain is still set; a test order on test data goes through.
8. If anything is wrong: run the rollback with the tag from the summary and confirm that Pages deployed it.

Rollback rehearsal — a publication, run by the owner (question 33):

```bash
node scripts/release/snapshot-live.mjs --origin https://www.nius.cz --out before.json
git fetch origin gh-pages
TAG=published-$(date -u +%Y%m%d-%H%M)
git tag $TAG origin/gh-pages && git push origin $TAG
gh workflow run rollback.yml --ref main -f tag=$TAG
gh run watch   # approve the production environment when asked
node scripts/release/snapshot-live.mjs --origin https://www.nius.cz --out after.json
node scripts/release/snapshot-live.mjs --compare before.json after.json   # no output, exit 0
```

A tag on the current head makes the rollback report "nothing to roll back": that proves the permissions, not the Pages deployment, which only the real run shows.
