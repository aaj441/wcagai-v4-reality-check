const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const config = require('../config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Light Core middleware
const { 
  attachLightContext, 
  logLightReviewMiddleware, 
  addCharterHeaders,
  auditLogRequests 
} = require('../packages/light-core/light-middleware');

// Routes
const healthRoutes = require('./routes/health');
const discoveryRoutes = require('./routes/discovery');
const scanRoutes = require('./routes/scan');
const lightRoutes = require('./routes/light');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for dashboard
}));

// CORS
app.use(cors());

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', rateLimiter);

// Light Core middleware - Ethical architecture enforcement
app.use(addCharterHeaders);
app.use(attachLightContext);
app.use(auditLogRequests);
app.use(logLightReviewMiddleware);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Static files (dashboard)
app.use(express.static('public'));

// API Routes
app.use('/health', healthRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/light', lightRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'WCAGAI v4.0',
    description: 'AI-powered web accessibility scanner with vertical intelligence',
    version: require('../package.json').version,
    lightCharter: '1.0.0',
    endpoints: {
      health: '/health',
      discovery: '/api/discovery?vertical=healthcare&maxResults=10',
      verticals: '/api/discovery/verticals',
      scan: 'POST /api/scan {url: "https://example.com"}',
      verticalScan: 'POST /api/scan/vertical {vertical: "healthcare", maxSites: 5}',
      scanStatus: '/api/scan/status',
      lightCharter: '/api/light/charter',
      lightStatus: '/api/light/status'
    },
    docs: 'https://github.com/aaj441/wcagai-v4-reality-check'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: {
      health: '/health',
      api: '/api/discovery, /api/scan, /api/light'
    }
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
