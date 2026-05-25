const express = require('express');
const { getPool } = require('./db');
const { authMiddleware } = require('./auth');
const { applySecurityMiddleware, createRateLimiters } = require('./middleware/security');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const { registerRoutes } = require('./routes');

function createApp() {
  const app = express();
  const { commonRateLimit, authRateLimit, applicationRateLimit } = createRateLimiters();

  applySecurityMiddleware(app);
  app.use('/api', commonRateLimit);

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
