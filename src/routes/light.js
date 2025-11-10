const express = require('express');
const router = express.Router();
const { LIGHT_CHARTER, getEnabledPrinciples } = require('../../packages/light-core/light-config');
const logger = require('../utils/logger');

// GET /api/light/charter - Returns current charter
router.get('/charter', (req, res) => {
  try {
    res.json({
      success: true,
      charter: LIGHT_CHARTER,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching charter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch charter'
    });
  }
});

// GET /api/light/status - Principle compliance status
router.get('/status', (req, res) => {
  try {
    const enabledPrinciples = getEnabledPrinciples();
    
    const principleStatus = {};
    for (const [key, principle] of Object.entries(LIGHT_CHARTER.principles)) {
      principleStatus[key] = {
        enabled: principle.enabled,
        severity: principle.severity
      };
    }

    res.json({
      success: true,
      enabled: true,
      version: LIGHT_CHARTER.version,
      principles: principleStatus,
      enabledCount: enabledPrinciples.length,
      totalPrinciples: Object.keys(LIGHT_CHARTER.principles).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching light status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch status'
    });
  }
});

module.exports = router;
