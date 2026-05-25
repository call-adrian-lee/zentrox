const express = require('express');
const logger = require('../../lib/logger');

function createUserHealthRouter({ getPool }) {
  const router = express.Router();

  router.get('/health', async (_req, res) => {
    try {
      const pool = getPool();
      await pool.query('SELECT 1');
      res.json({ ok: true, db: true });
    } catch (e) {
      logger.error('Health check failed', e);
      res.status(503).json({ ok: false, db: false, error: 'Database unavailable' });
    }
  });

  return router;
}

module.exports = { createUserHealthRouter };
