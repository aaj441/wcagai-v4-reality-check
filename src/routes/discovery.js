const express = require('express');
const router = express.Router();
const discoveryService = require('../services/discovery');
const { validateDiscovery } = require('../middleware/validation');
const logger = require('../utils/logger');

// GET /api/discovery?vertical=healthcare&maxResults=10
router.get('/', validateDiscovery, async (req, res, next) => {
  try {
    const { vertical, maxResults } = req.validatedQuery;

    logger.info(`Discovery request for vertical: ${vertical}, maxResults: ${maxResults}`);

    // Get vertical info
    const verticalInfo = discoveryService.getVerticalInfo(vertical);

    // Discover sites
    const sites = await discoveryService.discover(vertical, maxResults);

    res.json({
      success: true,
      vertical,
      verticalInfo,
      sites,
      count: sites.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Discovery error:', error);
    next(error);
  }
});

// GET /api/discovery/verticals - List all available verticals
router.get('/verticals', (req, res) => {
  const verticals = ['healthcare', 'fintech', 'ecommerce', 'education'];

  const verticalDetails = verticals.map(v => {
    const info = discoveryService.getVerticalInfo(v);
    return {
      id: v,
      name: v.charAt(0).toUpperCase() + v.slice(1),
      ...info
    };
  });

  res.json({
    success: true,
    verticals: verticalDetails,
    count: verticals.length
  });
});

module.exports = router;
