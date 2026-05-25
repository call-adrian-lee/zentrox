const express = require('express');
const logger = require('../../lib/logger');
const { resolvePortfolioImageForResponse } = require('../../lib/media-paths');
const portfolioService = require('../../services/portfolio.service');

function createUserPortfolioRouter({ getPool }) {
  const router = express.Router();

  router.get('/portfolio', async (_req, res) => {
    try {
      const { tabs, items } = await portfolioService.listPublishedPortfolio(getPool());
      res.json({ tabs, items: items.map(resolvePortfolioImageForResponse) });
    } catch (e) {
      logger.error('GET /api/portfolio failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createUserPortfolioRouter };
