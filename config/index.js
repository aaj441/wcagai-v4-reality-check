require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: parseInt(process.env.CACHE_TTL_HOURS || '24') * 3600
  },
  serpapi: {
    key: process.env.SERPAPI_KEY,
    maxResults: 20
  },
  scanner: {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_SCANS || '3'),
    timeout: parseInt(process.env.SCAN_TIMEOUT_MS || '30000')
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    apiKey: process.env.API_KEY
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'pretty'
  },
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*']
  },
  compression: {
    enabled: process.env.COMPRESSION_ENABLED !== 'false'
  },
  trustProxy: process.env.TRUST_PROXY === 'true',
  // Convenience accessors
  apiKey: process.env.API_KEY,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production'
};
