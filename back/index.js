require('dotenv').config();

const { getPool, ensureSchema } = require('./db');
const { seedCanonicalHomepageContent } = require('./seed-canonical.cjs');
const { syncLeadershipPhotoPaths, syncPortfolioImagePaths } = require('./lib/media-paths');
const { createApp } = require('./app');
const logger = require('./lib/logger');

const jwtSecret = String(process.env.JWT_SECRET || '');
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters and set in back/.env');
}

const PORT = Number(process.env.PORT || 3000);
const app = createApp();

async function start() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await ensureSchema(conn);
  } finally {
    conn.release();
  }
  await syncLeadershipPhotoPaths(pool);
  await seedCanonicalHomepageContent(pool, '[zentrox-api]');
  await syncPortfolioImagePaths(pool);
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`[zentrox-api] Listening on http://127.0.0.1:${PORT}`);
  });
}

start().catch((err) => {
  logger.error('API startup failed', err);
  process.exit(1);
});
