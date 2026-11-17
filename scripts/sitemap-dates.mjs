// Every <lastmod> of the built sitemap.xml (public/sitemap.xml copied by Astro) is set to the build
// date, as the old site's postbuild `scripts/update-sitemap-dates.js` did (main f0d216d).

/** UTC date of `now` as YYYY-MM-DD, as the old script writes it. */
export function buildDate(now = new Date()) {
  return now.toISOString().split('T')[0];
}

/** Every <lastmod> value of `xml` replaced with `date`. */
export function stampLastmod(xml, date) {
  return xml.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${date}</lastmod>`);
}
