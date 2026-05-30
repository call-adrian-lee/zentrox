require('dotenv').config();

const { getPool, ensureSchema } = require('./db');
const { seedCanonicalHomepageContentIfEmpty } = require('./seed-canonical.cjs');
const { syncLeadershipPhotoPaths, syncPortfolioImagePaths } = require('./lib/media-paths');
const { setApiReady } = require('./lib/readiness');
const { createApp } = require('./app');
const logger = require('./lib/logger');

const jwtSecret = String(process.env.JWT_SECRET || '');
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters and set in back/.env');
}

const PORT = Number(process.env.PORT || 3000);
const app = createApp();

let bootGeneration = 0;
let shuttingDown = false;

async function runBootTasks(pool) {
  const generation = ++bootGeneration;
  const conn = await pool.getConnection();
  try {
    await ensureSchema(conn);
  } finally {
    conn.release();
  }
  if (generation !== bootGeneration || shuttingDown) return;

  await seedCanonicalHomepageContentIfEmpty(pool, '[zentrox-api]');
  if (generation !== bootGeneration || shuttingDown) return;

  await syncLeadershipPhotoPaths(pool);
  await syncPortfolioImagePaths(pool);
  if (generation !== bootGeneration || shuttingDown) return;

  setApiReady(true);
  logger.info('[zentrox-api] Boot tasks complete');
}

async function start() {
  const pool = getPool();
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`[zentrox-api] Listening on http://127.0.0.1:${PORT}`);
  });

  runBootTasks(pool).catch((err) => {
    logger.error('Boot tasks failed', err);
    process.exit(1);
  });

  const shutdown = (signal) => {
    logger.info(`[zentrox-api] ${signal} received, shutting down`);
    shuttingDown = true;
    bootGeneration += 1;
    setApiReady(false);
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(0), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error('API startup failed', err);
  process.exit(1);
});
