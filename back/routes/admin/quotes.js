const express = require('express');
const logger = require('../../lib/logger');
const { parsePositiveInt } = require('../../lib/route-params');
const { PROJECT_QUOTE_STATUSES } = require('../../lib/quote-constants');
const quotesService = require('../../services/quotes.service');

function createAdminQuotesRouter({ getPool, authMiddleware }) {
  const router = express.Router();

  router.get('/admin/quotes', authMiddleware, async (_req, res) => {
    try {
      const quotes = await quotesService.listQuotesAdmin(getPool());
      res.json({ quotes });
    } catch (e) {
      logger.error('GET /api/admin/quotes failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.patch('/admin/quotes/:id', authMiddleware, async (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id == null) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const { status, adminNotes } = req.body || {};
    const fields = [];
    const vals = [];

    if (status != null) {
      const st = String(status).trim();
      if (!PROJECT_QUOTE_STATUSES.has(st)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
      fields.push('status = ?');
      vals.push(st);
    }
    if (adminNotes !== undefined) {
      const notes = adminNotes == null ? null : String(adminNotes).trim().slice(0, 20000) || null;
      fields.push('admin_notes = ?');
      vals.push(notes);
    }
    if (!fields.length) {
      res.status(400).json({ error: 'Nothing to update' });
      return;
    }

    try {
      const affected = await quotesService.updateQuote(getPool(), id, fields, vals);
      if (affected === 0) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json({ ok: true });
    } catch (e) {
      logger.error('PATCH /api/admin/quotes/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.delete('/admin/quotes/:id', authMiddleware, async (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id == null) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    try {
      const affected = await quotesService.deleteQuote(getPool(), id);
      if (affected === 0) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json({ ok: true });
    } catch (e) {
      logger.error('DELETE /api/admin/quotes/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createAdminQuotesRouter };
