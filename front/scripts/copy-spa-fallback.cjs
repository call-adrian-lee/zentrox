/**
 * GitHub Pages (and similar): unknown paths serve 404.html — must be the SPA shell.
 * Copy the built index.html after `ng build` so /mvp loads the app instead of a blank 404.
 */
const fs = require('fs');
const path = require('path');

const browser = path.join(__dirname, '..', 'dist', 'zentrox', 'browser');
const index = path.join(browser, 'index.html');
const dest404 = path.join(browser, '404.html');

if (!fs.existsSync(index)) {
  console.warn('[postbuild] Skip 404.html — not found:', index);
  process.exit(0);
}

fs.copyFileSync(index, dest404);
console.log('[postbuild] SPA fallback wrote', dest404);
