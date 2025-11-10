const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('../config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const { performanceMonitoring } = require('./middleware/performance');
const { swaggerUi, swaggerDocument } = require('./swagger');

// Routes
const healthRoutes = require('./routes/health');
const discoveryRoutes = require('./routes/discovery');
const scanRoutes = require('./routes/scan');

const app = express();

// Trust proxy if configured (for Railway, Heroku, etc.)
if (config.trustProxy) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for dashboard
}));

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // In development or if origins is ['*'], allow all
    if (config.env !== 'production' || config.cors.origins.includes('*')) {
      return callback(null, true);
    }
    
    // In production, check against whitelist
    if (config.cors.origins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject if not in whitelist
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression
if (config.compression.enabled) {
  app.use(compression());
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize input to prevent NoSQL injection
app.use(mongoSanitize());

// Performance monitoring
app.use(performanceMonitoring);

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

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Static files (dashboard)
app.use(express.static('public'));

// API Routes
app.use('/health', healthRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/scan', scanRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'WCAGAI v4.0',
    description: 'AI-powered web accessibility scanner with vertical intelligence',
    version: require('../package.json').version,
    endpoints: {
      health: '/health',
      healthDetailed: '/health/detailed',
      healthReady: '/health/ready',
      healthLive: '/health/live',
      discovery: '/api/discovery?vertical=healthcare&maxResults=10',
      verticals: '/api/discovery/verticals',
      scan: 'POST /api/scan {url: "https://example.com"}',
      verticalScan: 'POST /api/scan/vertical {vertical: "healthcare", maxSites: 5}',
      scanStatus: '/api/scan/status',
      apiDocs: '/api-docs'
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
      api: '/api/discovery, /api/scan',
      docs: '/api-docs'
    }
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
