const express = require('express');
const logger = require('../../lib/logger');
const { resolveLeadershipPhotoForResponse } = require('../../lib/media-paths');
const leadershipService = require('../../services/leadership.service');

function createUserLeadershipRouter({ getPool }) {
  const router = express.Router();

  router.get('/leadership', async (_req, res) => {
    try {
      const rows = await leadershipService.listPublishedMembers(getPool());
      res.json({ members: rows.map(resolveLeadershipPhotoForResponse) });
    } catch (e) {
      logger.error('GET /api/leadership failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createUserLeadershipRouter };
