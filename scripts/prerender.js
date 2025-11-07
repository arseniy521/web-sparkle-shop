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
  "/iv-drip-therapy-prague",
  "/en/iv-drip-therapy-prague",
  "/ru/iv-drip-therapy-prague",
  "/uk/iv-drip-therapy-prague",
  "/ivf-injection-support-prague",
  "/en/ivf-injection-support-prague",
  "/ru/ivf-injection-support-prague",
  "/uk/ivf-injection-support-prague",
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
  "/blog/iv-therapy-at-home-prague-guide",
  "/blog/when-to-call-home-nurse-prague",
  "/blog/wound-care-dressing-changes-prague",
  "/blog/elderly-care-nursing-services-prague",
  "/blog/medical-injections-home-service-prague",
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
        await new Promise(resolve => setTimeout(resolve, 1000));

        const html = await page.content();
        
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

  console.log('Pre-rendering complete!');
}

prerender();
