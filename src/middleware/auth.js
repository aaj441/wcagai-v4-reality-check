const logger = require('../utils/logger');
const config = require('../../config');

/**
 * API Key Authentication Middleware
 * Validates API key from X-API-Key header
 * Only enforced in production when API_KEY is set
 */
const apiKeyAuth = (req, res, next) => {
  // Skip auth in development or if API_KEY not configured
  if (config.env !== 'production' || !config.apiKey) {
    return next();
  }

  const providedKey = req.header('X-API-Key');

  if (!providedKey) {
    logger.warn('API key missing', {
      ip: req.ip,
      path: req.path
    });
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required. Include X-API-Key header.'
    });
  }

  if (providedKey !== config.apiKey) {
    logger.warn('Invalid API key attempt', {
      ip: req.ip,
      path: req.path
    });
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }

  logger.debug('API key validated', {
    ip: req.ip,
    path: req.path
  });
  next();
};

/**
 * Optional API Key Authentication
 * Only validates if X-API-Key header is present
 * Useful for rate limit exemptions
 */
const optionalApiKeyAuth = (req, res, next) => {
  const providedKey = req.header('X-API-Key');

  if (!providedKey || !config.apiKey) {
    req.authenticated = false;
    return next();
  }

  if (providedKey === config.apiKey) {
    req.authenticated = true;
    logger.debug('API key validated (optional)', {
      ip: req.ip,
      path: req.path
    });
  } else {
    req.authenticated = false;
    logger.warn('Invalid API key in optional auth', {
      ip: req.ip,
      path: req.path
    });
  }

  next();
};

module.exports = {
  apiKeyAuth,
  optionalApiKeyAuth
};
