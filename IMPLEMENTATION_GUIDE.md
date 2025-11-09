# WCAGAI v4.0 - Implementation Guide
## From Concept to Railway Deployment

**Goal**: Transform this concept into a deployable Railway application in 2-3 weeks

---

## Phase 1: Foundation (Days 1-3)

### Step 1.1: Update Dependencies

**Current package.json issues**:
- Outdated SerpAPI library
- Missing critical dependencies
- No dev dependencies

**Action**:
```bash
# Update package.json dependencies
npm install --save \
  express \
  dotenv \
  helmet \
  express-rate-limit \
  joi \
  axios \
  redis \
  serpapi \
  axe-core \
  puppeteer \
  winston

# Add dev dependencies
npm install --save-dev \
  jest \
  supertest \
  nodemon \
  eslint \
  prettier \
  @types/node
```

### Step 1.2: Environment Configuration

**Create `.env.example`**:
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Redis Configuration (Railway provides REDIS_URL automatically)
REDIS_URL=redis://localhost:6379

# API Keys
SERPAPI_KEY=your_serpapi_key_here

# Scanner Configuration
MAX_CONCURRENT_SCANS=3
SCAN_TIMEOUT_MS=30000
CACHE_TTL_HOURS=24

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Create `config/index.js`**:
```javascript
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
  }
};
```

### Step 1.3: Project Structure

```
wcagai-v4-reality-check/
├── config/
│   └── index.js                 # Environment configuration
├── src/
│   ├── server.js                # Express server
│   ├── app.js                   # App configuration
│   ├── services/
│   │   ├── discovery.js         # SerpAPI integration
│   │   ├── scanner.js           # WCAG scanning with Axe
│   │   ├── cache.js             # Redis cache layer
│   │   └── analytics.js         # Compliance calculations
│   ├── routes/
│   │   ├── health.js            # Health check endpoint
│   │   ├── discovery.js         # Discovery routes
│   │   └── scan.js              # Scan routes
│   ├── middleware/
│   │   ├── errorHandler.js      # Global error handling
│   │   ├── validation.js        # Request validation
│   │   └── rateLimiter.js       # Rate limiting
│   └── utils/
│       ├── logger.js            # Winston logger
│       └── constants.js         # Constants and enums
├── tests/
│   ├── unit/
│   ├── integration/
│   └── setup.js
├── public/
│   └── index.html               # Dashboard UI
├── .env.example
├── .gitignore
├── package.json
├── railway.json                 # Railway config
├── Dockerfile (optional)
└── README.md
```

---

## Phase 2: Core Implementation (Days 4-10)

### Step 2.1: Express Server (`src/server.js`)

```javascript
const app = require('./app');
const config = require('../config');
const logger = require('./utils/logger');

const PORT = config.port;

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 WCAGAI v4.0 server running on port ${PORT}`);
  logger.info(`📊 Environment: ${config.env}`);
  logger.info(`🔍 Redis: ${config.redis.url}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
```

### Step 2.2: App Configuration (`src/app.js`)

```javascript
const express = require('express');
const helmet = require('helmet');
const config = require('../config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Routes
const healthRoutes = require('./routes/health');
const discoveryRoutes = require('./routes/discovery');
const scanRoutes = require('./routes/scan');

const app = express();

// Security middleware
app.use(helmet());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
```

### Step 2.3: Health Check Route (`src/routes/health.js`)

```javascript
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const config = require('../../config');

let redisClient;

// Initialize Redis client
(async () => {
  try {
    redisClient = createClient({ url: config.redis.url });
    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection failed:', error.message);
  }
})();

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
    if (redisClient && redisClient.isOpen) {
      await redisClient.ping();
      health.redis = 'connected';
    } else {
      health.redis = 'disconnected';
      health.status = 'degraded';
    }
  } catch (error) {
    health.redis = 'error';
    health.status = 'degraded';
  }

  // Check SerpAPI key
  health.serpapi = config.serpapi.key ? 'configured' : 'missing';
  if (!config.serpapi.key) {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
```

### Step 2.4: Discovery Service (`src/services/discovery.js`)

```javascript
const { getJson } = require('serpapi');
const config = require('../../config');
const logger = require('../utils/logger');
const cacheService = require('./cache');

class DiscoveryService {
  constructor() {
    this.apiKey = config.serpapi.key;
  }

  async discover(vertical, maxResults = 20) {
    const cacheKey = `discovery:${vertical}:${maxResults}`;

    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      logger.info(`Cache hit for ${vertical} discovery`);
      return JSON.parse(cached);
    }

    // Fallback data for known verticals
    const fallbackData = {
      healthcare: [
        { url: 'https://www.nih.gov', title: 'National Institutes of Health' },
        { url: 'https://www.mayoclinic.org', title: 'Mayo Clinic' },
        { url: 'https://www.webmd.com', title: 'WebMD' },
        { url: 'https://www.healthline.com', title: 'Healthline' },
        { url: 'https://www.cdc.gov', title: 'CDC' }
      ],
      fintech: [
        { url: 'https://stripe.com', title: 'Stripe' },
        { url: 'https://www.paypal.com', title: 'PayPal' },
        { url: 'https://www.coinbase.com', title: 'Coinbase' },
        { url: 'https://robinhood.com', title: 'Robinhood' },
        { url: 'https://www.klarna.com', title: 'Klarna' }
      ]
    };

    // If no API key, use fallback
    if (!this.apiKey) {
      logger.warn('No SerpAPI key configured, using fallback data');
      const results = fallbackData[vertical] || [];
      await cacheService.set(cacheKey, JSON.stringify(results), config.redis.ttl);
      return results;
    }

    try {
      // Search using SerpAPI
      const searchQuery = this._buildSearchQuery(vertical);
      const response = await getJson({
        api_key: this.apiKey,
        engine: 'google',
        q: searchQuery,
        num: maxResults
      });

      const sites = (response.organic_results || [])
        .slice(0, maxResults)
        .map(result => ({
          url: result.link,
          title: result.title,
          snippet: result.snippet
        }));

      // Cache results
      await cacheService.set(cacheKey, JSON.stringify(sites), config.redis.ttl);

      logger.info(`Discovered ${sites.length} sites for ${vertical}`);
      return sites;

    } catch (error) {
      logger.error(`SerpAPI error for ${vertical}:`, error);

      // Use fallback on error
      const results = fallbackData[vertical] || [];
      await cacheService.set(cacheKey, JSON.stringify(results), config.redis.ttl);
      return results;
    }
  }

  _buildSearchQuery(vertical) {
    const queries = {
      healthcare: 'top healthcare websites medical information',
      fintech: 'top fintech companies financial services',
      ecommerce: 'top ecommerce websites online shopping',
      education: 'top educational institutions universities'
    };
    return queries[vertical] || `top ${vertical} websites`;
  }
}

module.exports = new DiscoveryService();
```

### Step 2.5: Cache Service (`src/services/cache.js`)

```javascript
const { createClient } = require('redis');
const config = require('../../config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connect();
  }

  async connect() {
    try {
      this.client = createClient({
        url: config.redis.url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return retries * 100; // Exponential backoff
          }
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Redis connection failed:', error);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;

    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = config.redis.ttl) {
    if (!this.isConnected) return false;

    try {
      await this.client.setEx(key, ttl, value);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key) {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

module.exports = new CacheService();
```

### Step 2.6: Logger Utility (`src/utils/logger.js`)

```javascript
const winston = require('winston');
const config = require('../../config');

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'wcagai-v4' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;
```

### Step 2.7: Error Handler Middleware (`src/middleware/errorHandler.js`)

```javascript
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
```

### Step 2.8: Update package.json Scripts

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write \"src/**/*.js\""
  }
}
```

---

## Phase 3: Railway Deployment (Days 11-12)

### Step 3.1: Create `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 3.2: Railway Deployment Steps

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
railway init

# 4. Add Redis plugin
railway add --plugin redis

# 5. Set environment variables
railway variables set SERPAPI_KEY=your_key_here

# 6. Deploy
railway up

# 7. Open deployed app
railway open
```

### Step 3.3: Environment Variables on Railway

**Required Variables**:
- `SERPAPI_KEY` - Your SerpAPI key (manual setup)
- `REDIS_URL` - Auto-provided by Railway Redis plugin
- `PORT` - Auto-provided by Railway

**Optional Variables**:
- `NODE_ENV=production`
- `MAX_CONCURRENT_SCANS=5`
- `CACHE_TTL_HOURS=24`

---

## Phase 4: Testing & Validation (Days 13-15)

### Step 4.1: Create Test Suite

**`tests/integration/health.test.js`**:
```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Health Check Endpoint', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBeDefined();
  });

  it('should include version info', async () => {
    const response = await request(app).get('/health');
    expect(response.body.version).toBeDefined();
  });
});
```

### Step 4.2: Deployment Validation Checklist

```bash
# 1. Test locally
npm run dev
curl http://localhost:3000/health

# 2. Test on Railway
curl https://your-app.railway.app/health

# 3. Check Redis connection
curl https://your-app.railway.app/health | jq '.redis'
# Should return: "connected"

# 4. Test discovery endpoint
curl https://your-app.railway.app/api/discovery/fintech

# 5. Monitor logs
railway logs

# 6. Check metrics
railway metrics
```

---

## Success Criteria

### Minimum Viable Product (MVP)

- [ ] Express server running on Railway
- [ ] Health check endpoint returns 200
- [ ] Redis connection working
- [ ] Discovery endpoint returns sites
- [ ] Basic error handling
- [ ] Environment variables configured
- [ ] Logs visible in Railway dashboard

### Production Ready

- [ ] Full WCAG scanner with Axe-core
- [ ] 80%+ test coverage
- [ ] Rate limiting active
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] CI/CD pipeline
- [ ] Documentation complete

---

## Estimated Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Foundation | 3 days | Project structure, config |
| Core Implementation | 7 days | Working API endpoints |
| Railway Deployment | 2 days | Live app on Railway |
| Testing & Validation | 3 days | Test suite, monitoring |
| **Total** | **15 days** | **MVP deployed** |

---

## Cost Breakdown

### Development
- Engineer time: 15 days × $500/day = **$7,500**

### Operational (Monthly)
- Railway Hobby: $5
- Railway Redis: $5
- SerpAPI (100 free searches): $0
- **Total**: $10/month (MVP)

### Scaling (1000 scans/day)
- Railway Pro: $20
- Railway Redis: $10
- SerpAPI: $50
- **Total**: $80/month

---

## Common Issues & Solutions

### Issue 1: Railway deployment fails

**Symptom**: Build fails with "Cannot find module"

**Solution**:
```bash
# Ensure all dependencies are in package.json
npm install --save <missing-package>

# Push changes
git add .
git commit -m "Add missing dependency"
git push
```

### Issue 2: Redis connection timeout

**Symptom**: Health check shows `redis: "disconnected"`

**Solution**:
```javascript
// Add timeout to Redis config
const client = createClient({
  url: config.redis.url,
  socket: {
    connectTimeout: 10000,
    keepAlive: 5000
  }
});
```

### Issue 3: Port binding error

**Symptom**: "EADDRINUSE: address already in use"

**Solution**:
```javascript
// Always use Railway's PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0'); // Bind to 0.0.0.0, not localhost
```

---

## Next Steps After MVP

1. **Add WCAG Scanner**
   - Integrate Axe-core or Pa11y
   - Implement Puppeteer for page rendering
   - Add scoring algorithm

2. **Build Dashboard**
   - Create React frontend
   - Add Chart.js for visualizations
   - Deploy to Vercel (static site)

3. **Implement Queue System**
   - Add BullMQ for background jobs
   - Separate scanner workers
   - Add job status tracking

4. **Add Monitoring**
   - Integrate Sentry for errors
   - Add Prometheus metrics
   - Set up alerts

---

## Resources

- [Railway Documentation](https://docs.railway.app)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

---

**Document Version**: 1.0
**Last Updated**: November 9, 2025
**Status**: Ready for Implementation
