// The old site's postbuild (`../scripts/update-sitemap-dates.js`, since main f0d216d) sets every
// <lastmod> of the built sitemap.xml to the build date. The new build does the same, so that the
// two builds of one release carry the same sitemap.xml (the release merge compares them byte for
// byte) and so that the new site keeps the behaviour once it serves the sitemap itself.

/** UTC date of `now` as YYYY-MM-DD, as the old script writes it. */
export function buildDate(now = new Date()) {
  return now.toISOString().split('T')[0];
}

/** Every <lastmod> value of `xml` replaced with `date`. */
export function stampLastmod(xml, date) {
  return xml.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${date}</lastmod>`);
}
