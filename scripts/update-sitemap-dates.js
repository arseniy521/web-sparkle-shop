import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

// Read the sitemap file
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Replace all old dates with today's date
sitemap = sitemap.replace(/2025-10-29/g, today);

// Write back to file
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

console.log(`✓ Updated all dates in sitemap.xml to ${today}`);
