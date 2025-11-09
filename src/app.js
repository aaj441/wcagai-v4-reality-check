const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const config = require('../config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const { getRequestHandler, getTracingHandler, getErrorHandler } = require('../config/sentry');

// Routes
const healthRoutes = require('./routes/health');
const discoveryRoutes = require('./routes/discovery');
const scanRoutes = require('./routes/scan');
const docsRoutes = require('./routes/docs');

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

// Sentry request tracking (must be before routes)
app.use(getRequestHandler());
app.use(getTracingHandler());

// Rate limiting
app.use('/api/', rateLimiter);

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
app.use('/api/docs', docsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'WCAGAI v4.0',
    description: 'AI-powered web accessibility scanner with vertical intelligence',
    version: require('../package.json').version,
    endpoints: {
      health: '/health',
      discovery: '/api/discovery?vertical=healthcare&maxResults=10',
      verticals: '/api/discovery/verticals',
      scan: 'POST /api/scan {url: "https://example.com"}',
      verticalScan: 'POST /api/scan/vertical {vertical: "healthcare", maxSites: 5}',
      scanStatus: '/api/scan/status',
      apiDocs: '/api/docs'
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
      api: '/api/discovery, /api/scan'
    }
  });
});

// Sentry error handler (must be before global error handler)
app.use(getErrorHandler());

// Global error handler
app.use(errorHandler);

module.exports = app;
