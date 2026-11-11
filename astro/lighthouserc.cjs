// The Chromium that Playwright installed (locally and in CI), so no second browser is downloaded.
const { chromium } = require('@playwright/test');

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      chromePath: chromium.executablePath(),
      numberOfRuns: 3,
      // Control set: one page of each migrated template.
      url: ['/sestricka-praha-1/', '/sestricka-praha-vinohrady/', '/sestricka-praha-zizkov/', '/privacy/'],
    },
    assert: {
      assertions: {
        'categories:seo': ['error', { minScore: 1, aggregationMethod: 'median' }],
        // The old site's median for the control set; a lower score is a regression.
        'categories:accessibility': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
        // The control set measures 0.99 (the old site 0.64); below 0.9 is a regression.
        'categories:performance': ['error', { minScore: 0.9, aggregationMethod: 'median' }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.checks/lighthouse' },
  },
};
