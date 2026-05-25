const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

function buildAllowedOrigins() {
  const fromEnv = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const defaults = [
    'http://127.0.0.1:4200',
    'http://localhost:4200',
    /^https:\/\/(www\.)?zentrox\.us$/i,
    /^http:\/\/127\.0\.0\.1:\d+$/,
    /^http:\/\/localhost:\d+$/
  ];
  return [...fromEnv, ...defaults];
}

function applySecurityMiddleware(app) {
  app.disable('x-powered-by');
  app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  const allowed = buildAllowedOrigins();
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (allowed.some((a) => (typeof a === 'string' ? a === origin : a.test(origin)))) {
          return cb(null, true);
        }
        return cb(null, false);
      },
      credentials: true
    })
  );

  app.use(express.json({ limit: '1mb' }));
}

function createRateLimiters() {
  const commonRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_MAX || 400),
    standardHeaders: 'draft-7',
    legacyHeaders: false
  });
  const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 8),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many login attempts, try again later' }
  });
  const applicationRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: Number(process.env.APPLICATION_RATE_LIMIT_MAX || 20),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many submissions, try again later' }
  });
  return { commonRateLimit, authRateLimit, applicationRateLimit };
}

module.exports = { applySecurityMiddleware, createRateLimiters };
