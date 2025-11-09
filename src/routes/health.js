const express = require('express');
const router = express.Router();
const cacheService = require('../services/cache');
const config = require('../../config');

router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: require('../../package.json').version
  };

  // Check Redis connection
  try {
    const cacheStatus = cacheService.getStatus();
    health.redis = cacheStatus.connected ? 'connected' : 'disconnected';

    if (!cacheStatus.connected) {
      health.status = 'degraded';
    }
  } catch (error) {
    health.redis = 'error';
    health.status = 'degraded';
  }

  // Check SerpAPI key configuration
  health.serpapi = config.serpapi.key ? 'configured' : 'missing';
  if (!config.serpapi.key) {
    health.warnings = health.warnings || [];
    health.warnings.push('SerpAPI key not configured - using fallback data');
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  health.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  };

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
