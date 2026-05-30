const express = require('express');
const logger = require('../../lib/logger');
const { isApiReady } = require('../../lib/readiness');

function createUserHealthRouter({ getPool }) {
  const router = express.Router();

  router.get('/health', async (_req, res) => {
    try {
      const pool = getPool();
      await pool.query('SELECT 1');
      res.json({ ok: true, db: true, ready: isApiReady() });
    } catch (e) {
      logger.error('Health check failed', e);
      res.status(503).json({ ok: false, db: false, ready: isApiReady(), error: 'Database unavailable' });
    }
  });

  router.get('/ready', async (_req, res) => {
    if (!isApiReady()) {
      return res.status(503).json({ ok: false, ready: false });
    }
    try {
      const pool = getPool();
      await pool.query('SELECT 1');
      res.json({ ok: true, ready: true, db: true });
    } catch (e) {
      logger.error('Readiness check failed', e);
      res.status(503).json({ ok: false, ready: false, db: false, error: 'Database unavailable' });
    }
  });

  return router;
}

module.exports = { createUserHealthRouter };
