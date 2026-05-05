/**
 * Copies canonical portfolio JPG assets from front/img/dev-*.JPG → front/img/portfolio/portfolio-{dbId}.png
 * matching each seeded row by tab + title. Requires MySQL (.env like other back scripts).
 *
 * Usage (from repo root): npm run migrate:portfolio-images --prefix back
 * Flags: --remove-sources  deletes front/img/dev-web-*.JPG and front/img/dev-game-*.JPG after success
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const sharp = require('sharp');
const { CANONICAL_PORTFOLIO_ITEMS } = require('../seed-canonical.cjs');

/** Original files under front/img — order matches CANONICAL_PORTFOLIO_ITEMS */
const LEGACY_IMG_BASENAMES = [
  'dev-web-0.JPG',
  'dev-web-1.JPG',
  'dev-web-2.JPG',
  'dev-web-3.JPG',
  'dev-web-4.JPG',
  'dev-web-5.JPG',
  'dev-game-0.JPG',
  'dev-game-1.JPG',
  'dev-game-2.JPG',
  'dev-game-3.JPG',
  'dev-game-4.JPG',
  'dev-game-5.JPG'
];

const ROOT = path.join(__dirname, '..', '..');
const FRONT_IMG = path.join(ROOT, 'front', 'img');
const PORTFOLIO_DIR = path.join(ROOT, 'front', 'img', 'portfolio');

async function resolveTabPair(pool) {
  const [ordered] = await pool.query(
    `SELECT id FROM portfolio_tabs WHERE status = 'published' ORDER BY sort_order ASC, id ASC LIMIT 2`
  );
  if (!ordered?.length || ordered.length < 2) {
    throw new Error('Need two published portfolio tabs (Web & Enterprise, AI Unity AR/VR). Run API/bootstrap first.');
  }
  return [ordered[0].id, ordered[1].id];
}

function legacyFsPath(basename) {
  return path.join(FRONT_IMG, basename);
}

if (LEGACY_IMG_BASENAMES.length !== CANONICAL_PORTFOLIO_ITEMS.length) {
  throw new Error('[migrate-portfolio] LEGACY_IMG_BASENAMES must match CANONICAL_PORTFOLIO_ITEMS length');
}

async function main() {
  const removeSources =
    process.argv.includes('--remove-sources') ||
    process.env.REMOVE_LEGACY_PORTFOLIO_SOURCES === '1' ||
    process.env.REMOVE_LEGACY_PORTFOLIO_SOURCES === 'true';

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'zentrox',
    waitForConnections: true,
    connectionLimit: 5
  });

  await fs.promises.mkdir(PORTFOLIO_DIR, { recursive: true });

  const [webTabId, gameTabId] = await resolveTabPair(pool);

  /** @type {{ id: number; title: string; dest: string; src: string }[]} */
  const done = [];

  try {
    for (let idx = 0; idx < CANONICAL_PORTFOLIO_ITEMS.length; idx++) {
      const row = CANONICAL_PORTFOLIO_ITEMS[idx];
      const legacyBase = LEGACY_IMG_BASENAMES[idx];
      const tabId = row.tabSortIndex === 0 ? webTabId : gameTabId;
      const [items] = await pool.query(
        'SELECT id FROM portfolio_items WHERE tab_id = ? AND title = ? LIMIT 1',
        [tabId, row.title]
      );
      if (!items.length) {
        console.warn(`[migrate-portfolio] Skip (no DB row): tab ${tabId} · ${row.title}`);
        continue;
      }
      const id = items[0].id;
      const src = legacyFsPath(legacyBase);
      const dest = path.join(PORTFOLIO_DIR, `portfolio-${id}.png`);
      if (!fs.existsSync(src)) {
        console.warn(`[migrate-portfolio] Missing source file: ${src}`);
        continue;
      }
      await sharp(src).png({ compressionLevel: 9 }).toFile(dest);
      done.push({ id, title: row.title, dest, src });
      console.log(`[migrate-portfolio] ${path.basename(src)} → img/portfolio/portfolio-${id}.png (${row.title})`);
    }

    if (done.length !== CANONICAL_PORTFOLIO_ITEMS.length) {
      console.warn(
        `[migrate-portfolio] Migrated ${done.length}/${CANONICAL_PORTFOLIO_ITEMS.length} items — fix DB or sources and re-run.`
      );
    }

    if (removeSources && done.length === CANONICAL_PORTFOLIO_ITEMS.length) {
      const seen = new Set(
        LEGACY_IMG_BASENAMES.map((b) => path.join(FRONT_IMG, b))
      );
      for (const fp of seen) {
        if (fs.existsSync(fp)) {
          await fs.promises.unlink(fp);
          console.log(`[migrate-portfolio] Removed legacy: ${fp}`);
        }
      }
    } else if (removeSources) {
      console.warn('[migrate-portfolio] --remove-sources ignored until all items migrate successfully.');
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('[migrate-portfolio] Failed:', e.message);
  process.exit(1);
});
