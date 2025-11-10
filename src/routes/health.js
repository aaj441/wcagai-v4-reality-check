const express = require('express');
const router = express.Router();
const cacheService = require('../services/cache');
const scannerService = require('../services/scanner');
const config = require('../../config');
const { getMetrics } = require('../middleware/performance');

router.get('/', async (req, res) => {
  const health = {
    status: 'healthy',
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
      health.status = 'unhealthy';
    }
  } catch (error) {
    health.redis = 'error';
    health.status = 'unhealthy';
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

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Detailed health check endpoint
router.get('/detailed', async (req, res) => {
  try {
    const metrics = getMetrics();
    const cacheStatus = cacheService.getStatus();
    const scannerStatus = scannerService.getStatus();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: require('../../package.json').version,
      environment: config.env,
      uptime: metrics.uptime,
      memory: metrics.memory,
      cpu: metrics.cpu,
      services: {
        redis: {
          status: cacheStatus.connected ? 'connected' : 'disconnected',
          ...cacheStatus
        },
        scanner: {
          status: scannerStatus.status,
          ...scannerStatus
        },
        serpapi: {
          status: config.serpapi.key ? 'configured' : 'missing'
        }
      },
      platform: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      }
    };

    // Determine overall health
    if (!cacheStatus.connected) {
      health.status = 'unhealthy';
    } else if (scannerStatus.status !== 'ready') {
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Readiness probe (for Kubernetes/Railway)
router.get('/ready', async (req, res) => {
  try {
    const cacheStatus = cacheService.getStatus();
    
    if (cacheStatus.connected) {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false, reason: 'Redis not connected' });
    }
  } catch (error) {
    res.status(503).json({ ready: false, reason: error.message });
  }
});

// Liveness probe (for Kubernetes/Railway)
router.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

module.exports = router;
