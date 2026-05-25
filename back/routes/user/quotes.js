const express = require('express');
const logger = require('../../lib/logger');
const { normalizeQuoteOptional, isValidEmail } = require('../../lib/validation');
const {
  PROJECT_QUOTE_SERVICE_TYPES,
  PROJECT_QUOTE_BUDGET_RANGES,
  PROJECT_QUOTE_TIMELINES,
  PROJECT_QUOTE_SOURCES
} = require('../../lib/quote-constants');
const quotesService = require('../../services/quotes.service');

function createUserQuotesRouter({ getPool, applicationRateLimit }) {
  const router = express.Router();

  router.post('/quotes', applicationRateLimit, async (req, res) => {
    const { fullName, email, company, phone, serviceType, requirements, budgetRange, timeline, source } =
      req.body || {};
    const name = (fullName || '').trim();
    const em = (email || '').trim();
    const service = String(serviceType || '').trim();
    const budget = String(budgetRange || '').trim();
    const reqs = String(requirements || '').trim();

    if (!name.length || name.length > 255) {
      res.status(400).json({ error: 'Invalid fullName' });
      return;
    }
    if (!isValidEmail(em)) {
      res.status(400).json({ error: 'Invalid email' });
      return;
    }
    if (!PROJECT_QUOTE_SERVICE_TYPES.has(service)) {
      res.status(400).json({ error: 'Invalid serviceType' });
      return;
    }
    if (!PROJECT_QUOTE_BUDGET_RANGES.has(budget)) {
      res.status(400).json({ error: 'Invalid budgetRange' });
      return;
    }
    if (!reqs.length || reqs.length > 20000) {
      res.status(400).json({ error: 'Invalid requirements' });
      return;
    }

    const companyT = normalizeQuoteOptional(company, 255);
    const phoneT = normalizeQuoteOptional(phone, 64);
    const timelineT = normalizeQuoteOptional(timeline, 64);
    const sourceT = normalizeQuoteOptional(source, 64);

    if (timelineT && !PROJECT_QUOTE_TIMELINES.has(timelineT)) {
      res.status(400).json({ error: 'Invalid timeline' });
      return;
    }
    if (sourceT && !PROJECT_QUOTE_SOURCES.has(sourceT)) {
      res.status(400).json({ error: 'Invalid source' });
      return;
    }

    try {
      await quotesService.insertQuote(getPool(), {
        fullName: name,
        email: em,
        company: companyT,
        phone: phoneT,
        serviceType: service,
        requirements: reqs,
        budgetRange: budget,
        timeline: timelineT,
        source: sourceT
      });
      res.status(201).json({ ok: true });
    } catch (e) {
      logger.error('POST /api/quotes failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createUserQuotesRouter };
