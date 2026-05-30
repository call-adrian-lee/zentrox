const express = require('express');
const { getPool } = require('./db');
const { authMiddleware } = require('./auth');
const { isApiReady } = require('./lib/readiness');
const { applySecurityMiddleware, createRateLimiters } = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const { registerRoutes } = require('./routes');

function isProbePath(req) {
  const path = req.path.replace(/\/+$/, '') || '/';
  return path === '/health' || path === '/ready';
}

function createApp() {
  const app = express();
  const { commonRateLimit, authRateLimit, applicationRateLimit } = createRateLimiters();

  applySecurityMiddleware(app);

  app.use('/api', (req, res, next) => {
    if (isProbePath(req)) return next();
    return commonRateLimit(req, res, next);
  });

  app.use('/api', (req, res, next) => {
    if (isProbePath(req)) return next();
    if (!isApiReady()) {
      return res.status(503).json({ ok: false, ready: false, error: 'Service starting up' });
    }
    next();
  });

  registerRoutes(app, {
    getPool,
    authMiddleware,
    authRateLimit,
    applicationRateLimit
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
