const logger = require('../lib/logger');

function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, _req, res, _next) {
  logger.error('Unhandled request error', err);
  if (res.headersSent) return;
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: status === 500 ? 'Server error' : err.message || 'Request failed' });
}

module.exports = { notFoundHandler, errorHandler };
