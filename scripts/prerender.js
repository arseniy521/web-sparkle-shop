import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  "/",
  "/en",
  "/ru",
  "/uk",
  "/blog",
  "/en/blog",
  "/ru/blog",
  "/uk/blog",
  "/iv-drips-prague",
  "/en/iv-drips-prague",
  "/ru/iv-drips-prague",
  "/uk/iv-drips-prague",
  "/ivf-support-prague",
  "/en/ivf-support-prague",
  "/ru/ivf-support-prague",
  "/uk/ivf-support-prague",
  "/post-surgery-recovery-care-prague",
  "/en/post-surgery-recovery-care-prague",
  "/ru/post-surgery-recovery-care-prague",
  "/uk/post-surgery-recovery-care-prague",
  "/disabled-daily-care-prague",
  "/en/disabled-daily-care-prague",
  "/ru/disabled-daily-care-prague",
  "/uk/disabled-daily-care-prague",
  "/sestricka-praha-1",
  "/sestricka-praha-vinohrady",
  "/sestricka-praha-zizkov",

  // Women's Day Gift - Localized slugs
  "/darek-8-brezna",
  "/en/womens-day-gift-prague",
  "/ru/podarok-na-8-marta",

  // Birthday Gift - Localized slugs
  "/narozeninovy-darek-praha",
  "/en/birthday-gift-prague",
  "/ru/podatok-k-dnju-rozhdenija-praga",

  // Hangover IV Drip - Localized slugs
  "/kapacka-na-kocovinu-praha",
  "/en/hangover-iv-drip-prague",
  "/ru/kapelnica-ot-pokhmelya-praga",
  "/uk/krapelnytsia-vid-pokhmellia-praga",

  // Old URL redirects are handled separately below (not pre-rendered)
  "/blog/iv-therapy-at-home-prague-guide",
  "/blog/when-to-call-home-nurse-prague",
  "/blog/wound-care-dressing-changes-prague",
  "/blog/elderly-care-nursing-services-prague",
  "/blog/medical-injections-home-service-prague",
  
  // English blog posts
  "/en/blog/iv-therapy-at-home-prague-guide",
  "/en/blog/when-to-call-home-nurse-prague",
  "/en/blog/wound-care-dressing-changes-prague",
  "/en/blog/elderly-care-nursing-services-prague",
  "/en/blog/medical-injections-home-service-prague",

  // Russian blog posts
  "/ru/blog/iv-therapy-at-home-prague-guide",
  "/ru/blog/when-to-call-home-nurse-prague",
  "/ru/blog/wound-care-dressing-changes-prague",
  "/ru/blog/elderly-care-nursing-services-prague",
  "/ru/blog/medical-injections-home-service-prague",

  // Ukrainian blog posts
  "/uk/blog/iv-therapy-at-home-prague-guide",
  "/uk/blog/when-to-call-home-nurse-prague",
  "/uk/blog/wound-care-dressing-changes-prague",
  "/uk/blog/elderly-care-nursing-services-prague",
  "/uk/blog/medical-injections-home-service-prague",
];

const distDir = path.join(__dirname, '..', 'dist');

async function prerender() {
  console.log('Starting pre-rendering...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Start a static file server pointing to dist
    const handler = (await import('serve-handler')).default;
    const http = await import('http');
    
    const server = http.createServer((request, response) => {
      return handler(request, response, {
        public: distDir,
        cleanUrls: false,
        rewrites: [
          { source: '**', destination: '/index.html' }
        ]
      });
    });
    
    await new Promise((resolve) => {
      server.listen(3000, () => {
        console.log('Static server started on http://localhost:3000');
        resolve();
      });
    });

    for (const route of routes) {
      console.log(`Pre-rendering: ${route}`);
      
      try {
        await page.goto(`http://localhost:3000${route}`, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        // Wait for React to fully render
        await page.waitForSelector('#root', { timeout: 5000 });

        // Wait for react-helmet-async to inject SEO tags into <head>
        // This ensures canonical, meta description, hreflang, and OG tags are in the pre-rendered HTML
        try {
          await page.waitForFunction(
            () => !!document.querySelector('link[rel="canonical"]') || !!document.querySelector('meta[name="description"]'),
            { timeout: 5000 }
          );
        } catch {
          console.warn(`  ⚠ Helmet tags not detected for ${route} (redirect page or timeout)`);
        }

        // Extra wait to ensure all async helmet updates are flushed
        await new Promise(resolve => setTimeout(resolve, 500));

        let html = await page.content();

        // Remove duplicate meta tags: index.html has default title/description,
        // but React Helmet injects page-specific ones (marked with data-rh="true").
        // Google uses the first one it finds, so we must remove the originals.
        if (html.includes('data-rh="true"')) {
          // Remove original title (without data-rh) if Helmet set one
          if (/<title[^>]*data-rh="true"/.test(html)) {
            html = html.replace(/<title>(?:(?!data-rh)[^<])*<\/title>\s*/, '');
          }
          // Remove original meta description (without data-rh) if Helmet set one
          if (/<meta name="description"[^>]*data-rh="true"/.test(html)) {
            html = html.replace(/<meta name="description" content="[^"]*">\s*/, '');
          }
        }

        // Determine output path
        let outputPath;
        if (route === '/') {
          outputPath = path.join(distDir, 'index.html');
        } else {
          const routePath = route.startsWith('/') ? route.slice(1) : route;
          outputPath = path.join(distDir, routePath, 'index.html');
        }

        // Create directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Write the pre-rendered HTML
        fs.writeFileSync(outputPath, html);
        console.log(`✓ Saved: ${outputPath}`);
      } catch (error) {
        console.error(`✗ Failed to pre-render ${route}:`, error.message);
      }
    }

    await new Promise((resolve) => server.close(resolve));
  } catch (error) {
    console.error('Pre-rendering failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }

  // Generate static redirect HTML files for old URLs
  // These use <meta http-equiv="refresh"> so Google sees a proper redirect signal
  const baseUrl = 'https://www.nius.cz';
  const redirects = [
    { from: '/iv-drip-therapy-prague', to: '/iv-drips-prague/' },
    { from: '/en/iv-drip-therapy-prague', to: '/en/iv-drips-prague/' },
    { from: '/ru/iv-drip-therapy-prague', to: '/ru/iv-drips-prague/' },
    { from: '/uk/iv-drip-therapy-prague', to: '/uk/iv-drips-prague/' },
    { from: '/ivf-injection-support-prague', to: '/ivf-support-prague/' },
    { from: '/en/ivf-injection-support-prague', to: '/en/ivf-support-prague/' },
    { from: '/ru/ivf-injection-support-prague', to: '/ru/ivf-support-prague/' },
    { from: '/uk/ivf-injection-support-prague', to: '/uk/ivf-support-prague/' },
  ];

  for (const { from, to } of redirects) {
    const targetUrl = `${baseUrl}${to}`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
  <link rel="canonical" href="${targetUrl}">
  <meta name="robots" content="noindex">
  <title>Redirecting...</title>
  <script>window.location.replace("${targetUrl}");</script>
</head>
<body>
  <p>This page has moved. <a href="${targetUrl}">Click here</a> if you are not redirected.</p>
</body>
</html>`;

    const routePath = from.startsWith('/') ? from.slice(1) : from;
    const outputPath = path.join(distDir, routePath, 'index.html');
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, html);
    console.log(`✓ Redirect: ${from} → ${to}`);
  }

  console.log('Pre-rendering complete!');
}

prerender();
