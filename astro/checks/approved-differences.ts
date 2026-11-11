// The differences from the old site approved in design.md, section 9 "Approved differences".
// Only these may make a difference acceptable; the list changes only with the owner's consent.
import { redirects } from '../src/routes/manifest.ts';
import { pageUrl } from '../src/routes/urls.ts';

export interface ApprovedDifference {
  id: number;
  description: string;
  handling: string;
}

export const approvedDifferences: readonly ApprovedDifference[] = [
  {
    id: 1,
    description: 'FAQ answers and every hero phrase are present in the HTML',
    handling: 'content check: new text is reported as added and never fails',
  },
  {
    id: 2,
    description: 'One canonical and one meta robots instead of two',
    handling: 'content check: the old value is the react-helmet tag (data-rh) when the old page has one',
  },
  {
    id: 3,
    description: '/iv-kapacky-praha/, /ru/kapelnitsy-praga/, /en/iv-drip-hotel-prague/ and /privacy/ in four languages exist',
    handling: 'reference: scripts/baseline/build.mjs renders these routes from the old SPA',
  },
  {
    id: 4,
    description:
      '/iv-drips-prague/ and /ru/iv-drips-prague/ become redirects; the old …/iv-drip-therapy-prague/ addresses redirect straight to the final page',
    handling: 'content check: an old link or JSON-LD site URL to a redirect source counts as its redirect target (finalPath)',
  },
  {
    id: 5,
    description: 'No React service attributes; styles and scripts live at other addresses',
    handling: 'content check: attributes are not compared; a Vite asset /assets/<name>-<hash>.<ext> equals the Astro asset /_astro/<name>.<hash>.<ext> (sameAsset)',
  },
  {
    id: 6,
    description: 'Google Analytics and Amplitude load only after consent',
    handling: 'outside the content check: scripts are not compared',
  },
  {
    id: 7,
    description: 'Hreflang lists only existing, indexable versions; the language switcher leads to the language home when the page has no version',
    handling: 'content check: the new hreflang must equal hreflangFor(); the old set is not compared',
  },
  {
    id: 8,
    description: 'Internal links and JSON-LD addresses lead to the final addresses of the same language, not to /iv-drips-prague/',
    handling: 'content check: as difference 4 (finalPath)',
  },
  {
    id: 9,
    description: 'Language alternates in sitemap.xml match the hreflang of the pages',
    handling: 'outside the content check: the SEO check compares sitemap.xml with the manifest',
  },
  {
    id: 10,
    description: 'Small visual differences from Tailwind 4 accepted by the owner from screenshots',
    handling: 'visual check: checks/visual-accepted.json',
  },
  {
    id: 11,
    description: 'All four privacy policy addresses exist with the canonical /privacy/; only it is in sitemap and hreflang',
    handling: 'content check: the new canonical of a page with canonicalLang must equal the manifest canonical',
  },
  {
    id: 12,
    description: 'On /en/iv-drip-hotel-prague/ the 60-minute arrival promise is replaced by "same day"',
    handling: 'content check: hotelTextReplacements',
  },
  {
    id: 13,
    description: 'Blog article images are shown: four files from the repository, og-blog.jpg for the article without a file (nurse-benefits)',
    handling: 'content check: blogImageReplacements',
  },
];

// Difference 12. Filled by Task 27 (hangover drip and hotel drip pages).
export const hotelTextReplacements: ReadonlyArray<{ path: string; old: string; new: string }> = [];

// Difference 13. Filled by Task 25 (blog list and articles).
export const blogImageReplacements: ReadonlyArray<{
  path: string;
  old: { src: string; alt: string | null };
  new: { src: string; alt: string | null };
}> = [];

// Differences 4 and 8: a redirect source of the manifest stands for its target page.
export function finalPath(sitePath: string): string {
  const redirect = redirects.find((r) => r.from === sitePath);
  return redirect ? pageUrl(redirect.to.id, redirect.to.lang) : sitePath;
}

// Difference 5: Vite names a bundled asset /assets/<name>-<hash>.<ext>, Astro /_astro/<name>.<hash>.<ext>.
export function sameAsset(oldSrc: string, newSrc: string): boolean {
  if (oldSrc === newSrc) return true;
  const vite = oldSrc.match(/^\/assets\/(.+)-[\w-]{8}\.(\w+)$/);
  const astro = newSrc.match(/^\/_astro\/(.+)\.[\w-]{8}\.(\w+)$/);
  return vite !== null && astro !== null && vite[1] === astro[1] && vite[2] === astro[2];
}
