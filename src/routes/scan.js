const express = require('express');
const router = express.Router();
const scannerService = require('../services/scanner');
const discoveryService = require('../services/discovery');
const analyticsService = require('../services/analytics');
const { validateScan, validateVerticalScan } = require('../middleware/validation');
const logger = require('../utils/logger');

// POST /api/scan
// Body: { url: "https://example.com", includeScreenshot: false }
router.post('/', validateScan, async (req, res, next) => {
  try {
    const { url } = req.validatedBody;

    logger.info(`Single scan request for: ${url}`);

    const result = await scannerService.scan(url);

    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Scan error:', error);
    next(error);
  }
});

// POST /api/scan/vertical
// Body: { vertical: "healthcare", maxSites: 5 }
router.post('/vertical', validateVerticalScan, async (req, res, next) => {
  try {
    const { vertical, maxSites } = req.validatedBody;

    logger.info(`Vertical scan request for: ${vertical}, maxSites: ${maxSites}`);

    // Discover sites
    const sites = await discoveryService.discover(vertical, maxSites);

    if (!sites || sites.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No sites found for vertical: ${vertical}`
      });
    }

    // Extract URLs
    const urls = sites.map(s => s.url);

    // Scan all sites
    const scanResults = await scannerService.scanMultiple(urls);

    // Calculate analytics
    const analytics = analyticsService.calculateVerticalMetrics(scanResults, vertical);

    res.json({
      success: true,
      vertical,
      sites: sites.map((site, index) => ({
        ...site,
        scan: scanResults[index]
      })),
      analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Vertical scan error:', error);
    next(error);
  }
});

// GET /api/scan/status - Get scanner status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    scanner: 'operational',
    engine: 'axe-core',
    standards: ['WCAG 2.0', 'WCAG 2.1', 'WCAG 2.2'],
    levels: ['A', 'AA'],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
