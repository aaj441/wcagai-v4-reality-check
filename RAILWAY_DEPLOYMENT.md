# Railway Deployment Guide
## Quick Start: Deploy WCAGAI v4.0 to Railway

---

## Prerequisites

1. **Railway Account**
   - Sign up at [railway.app](https://railway.app)
   - Free tier includes $5 monthly credit

2. **SerpAPI Key** (Optional for MVP)
   - Sign up at [serpapi.com](https://serpapi.com)
   - Free tier: 100 searches/month
   - Get API key from dashboard

3. **Git Repository**
   - Code pushed to GitHub/GitLab
   - Branch ready to deploy

---

## Step-by-Step Deployment

### Method 1: Railway Web Dashboard (Recommended)

#### Step 1: Create New Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select `wcagai-v4-reality-check` repository
5. Choose branch (e.g., `main` or `claude/audit-app-deployment-*`)

#### Step 2: Add Redis Plugin

1. In your Railway project dashboard
2. Click "+ New" → "Database" → "Add Redis"
3. Railway automatically sets `REDIS_URL` environment variable
4. Wait for Redis to provision (~30 seconds)

#### Step 3: Configure Environment Variables

1. Click on your service (not Redis)
2. Go to "Variables" tab
3. Add the following:

```
NODE_ENV=production
SERPAPI_KEY=your_actual_key_here
MAX_CONCURRENT_SCANS=5
CACHE_TTL_HOURS=24
```

**Note**: `PORT` and `REDIS_URL` are auto-provided by Railway

#### Step 4: Deploy

1. Railway auto-deploys when you push to GitHub
2. Or click "Deploy" button in dashboard
3. Watch build logs in real-time
4. Deployment takes 2-3 minutes

#### Step 5: Verify Deployment

1. Click "Settings" → Copy your app URL
2. Visit `https://your-app.railway.app/health`
3. Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T...",
  "uptime": 123.45,
  "redis": "connected",
  "serpapi": "configured"
}
```

---

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize in your project directory
cd wcagai-v4-reality-check
railway init

# Link to existing project (if already created)
railway link

# Add Redis plugin
railway add --plugin redis

# Set environment variables
railway variables set SERPAPI_KEY=your_key_here
railway variables set NODE_ENV=production

# Deploy
railway up

# Open in browser
railway open

# View logs
railway logs

# View environment variables
railway variables
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All code committed to Git
- [ ] `package.json` has `start` script
- [ ] `railway.json` exists in project root
- [ ] `.env.example` documented
- [ ] `.env` in `.gitignore` (never commit secrets)
- [ ] Health check endpoint implemented

### During Deployment

- [ ] Railway project created
- [ ] Redis plugin added
- [ ] `SERPAPI_KEY` environment variable set
- [ ] Build logs show no errors
- [ ] Deployment successful

### Post-Deployment

- [ ] Health check returns 200 OK
- [ ] Redis status shows "connected"
- [ ] API endpoints responding
- [ ] Logs show no errors
- [ ] Custom domain configured (optional)

---

## Troubleshooting

### Build Fails with "Cannot find module"

**Cause**: Missing dependency in `package.json`

**Fix**:
```bash
# Add missing dependency
npm install --save <package-name>

# Commit and push
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

### App Crashes on Startup

**Check Logs**:
```bash
railway logs
```

**Common Issues**:

1. **Port binding error**
   - Ensure using `process.env.PORT`
   - Bind to `0.0.0.0`, not `localhost`

2. **Redis connection timeout**
   - Check Redis plugin is running
   - Verify `REDIS_URL` variable exists

3. **Missing environment variable**
   - Add via dashboard or CLI
   - Don't hardcode sensitive values

### Health Check Fails

**Symptom**: Deployment succeeds but health check times out

**Fix**:
```javascript
// Ensure health endpoint responds quickly
router.get('/', async (req, res) => {
  res.json({ status: 'ok' }); // Fast response
});
```

**Railway Config**:
```json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

### Redis Shows "disconnected"

**Check Redis URL**:
```bash
railway variables | grep REDIS_URL
```

**Test Connection**:
```javascript
const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

client.on('error', err => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected!'));

await client.connect();
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | ✅ Auto | 3000 | Railway provides automatically |
| `REDIS_URL` | ✅ Auto | - | Set by Redis plugin |
| `NODE_ENV` | ✅ Manual | development | Set to `production` |
| `SERPAPI_KEY` | ⚠️ Optional | - | SerpAPI authentication |
| `MAX_CONCURRENT_SCANS` | ❌ Optional | 3 | Parallel scan limit |
| `SCAN_TIMEOUT_MS` | ❌ Optional | 30000 | Scanner timeout |
| `CACHE_TTL_HOURS` | ❌ Optional | 24 | Redis cache duration |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ Optional | 100 | Rate limit per window |

---

## Cost Estimation

### Free Tier
- **Cost**: $0/month
- **Credits**: $5/month included
- **Limitations**:
  - Usage stops when credits exhausted
  - No custom domains on free tier
  - 500 hours execution/month

### Hobby Plan
- **Cost**: $5/month + usage
- **Credits**: $5 included
- **Features**:
  - 500 hours included
  - Custom domains
  - Priority support

### Estimated Usage (MVP)

| Resource | Usage | Cost |
|----------|-------|------|
| App Service | 730 hrs/mo | $5 |
| Redis (256MB) | 730 hrs/mo | $5 |
| **Total** | - | **$10/month** |

**Free tier covers**: ~300 hours (~12 days) of runtime

---

## Production Deployment Best Practices

### 1. Use Separate Environments

```bash
# Create staging environment
railway environment create staging

# Create production environment
railway environment create production

# Deploy to staging first
railway up --environment staging

# Test on staging
curl https://wcagai-staging.railway.app/health

# Deploy to production
railway up --environment production
```

### 2. Set Up Custom Domain

1. Go to Project Settings → Domains
2. Add custom domain: `api.yourdomain.com`
3. Add CNAME record in your DNS:
   ```
   CNAME api.yourdomain.com → your-app.railway.app
   ```
4. Railway auto-provisions SSL certificate

### 3. Monitor Logs

```bash
# Stream live logs
railway logs --follow

# Filter by service
railway logs --service web

# Export logs
railway logs > deployment.log
```

### 4. Set Up Webhooks (Optional)

Get notified on deployments:
1. Project Settings → Webhooks
2. Add Discord/Slack webhook URL
3. Select events: Deploy Started, Deploy Success, Deploy Failed

### 5. Enable Metrics

Railway provides:
- CPU usage
- Memory consumption
- Network traffic
- Request count

Access via: Project Dashboard → Metrics tab

---

## Scaling Guidelines

### When to Scale Up

**Indicators**:
- Health checks timing out (>100ms)
- High CPU usage (>80%)
- Memory near limit (>90%)
- Redis connection timeouts

### Vertical Scaling (Upgrade Plan)

**Starter → Pro Plan**:
```
Resources:
- 8 vCPU (shared)
- 8GB RAM
- 100GB disk

Cost: $20/month + usage
```

**Redis Scaling**:
```
Hobby: 256MB RAM → $5/mo
Pro: 1GB RAM → $10/mo
Scale: 4GB RAM → $40/mo
```

### Horizontal Scaling (Not Needed for MVP)

Railway doesn't support auto-scaling yet.
For high traffic:
1. Add queueing system (BullMQ)
2. Separate scanner workers
3. Use Railway's load balancer (coming soon)

---

## Rollback Strategy

### Option 1: Redeploy Previous Version

```bash
# View deployment history
railway deployments

# Rollback to specific deployment
railway rollback <deployment-id>
```

### Option 2: Git Revert

```bash
# Revert last commit
git revert HEAD
git push

# Railway auto-deploys reverted code
```

### Option 3: Manual Fix

```bash
# Fix code
git commit -m "Fix production issue"
git push

# Railway auto-deploys fix
```

---

## Security Checklist

- [ ] All secrets in environment variables (not code)
- [ ] `.env` file in `.gitignore`
- [ ] Rate limiting enabled
- [ ] Helmet.js for HTTP security headers
- [ ] Input validation on all endpoints
- [ ] CORS configured properly
- [ ] Redis password set (Railway auto-configures)
- [ ] SSL/TLS enabled (Railway auto-configures)
- [ ] Regular dependency updates (`npm audit`)

---

## Monitoring & Alerts

### Built-in Railway Monitoring

**Available Metrics**:
- Deployment status
- CPU usage
- Memory usage
- Network traffic
- Request count

**Alerts** (Pro plan):
- High resource usage
- Deployment failures
- Health check failures

### External Monitoring (Recommended)

**Free Tier Options**:

1. **UptimeRobot** (uptime monitoring)
   - Monitor `/health` endpoint
   - 5-minute checks
   - Email alerts
   - Free: 50 monitors

2. **Sentry** (error tracking)
   ```bash
   npm install @sentry/node
   ```
   - Free: 5,000 errors/month
   - Stack traces
   - Performance monitoring

3. **Better Stack** (logs)
   - Centralized logging
   - Search & filter
   - Free: 1GB/month

---

## Performance Optimization

### 1. Enable Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Cache Static Assets

```javascript
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

### 3. Optimize Redis Queries

```javascript
// Use pipeline for multiple operations
const pipeline = client.pipeline();
pipeline.get('key1');
pipeline.get('key2');
const results = await pipeline.exec();
```

### 4. Add Request Timeouts

```javascript
const timeout = require('connect-timeout');
app.use(timeout('10s'));
```

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app
- **Railway Changelog**: https://railway.app/changelog

---

## Quick Commands Reference

```bash
# Deployment
railway up                    # Deploy current directory
railway up --detach          # Deploy without watching logs

# Logs
railway logs                 # View recent logs
railway logs -f              # Follow logs in real-time

# Environment
railway variables            # List all variables
railway variables set KEY=value
railway variables unset KEY

# Database
railway add --plugin redis   # Add Redis
railway add --plugin postgres # Add PostgreSQL

# Project Management
railway link                 # Link to existing project
railway unlink              # Unlink project
railway status              # Check deployment status

# Local Development
railway run npm start       # Run with Railway env vars
railway shell               # SSH into deployment
```

---

**Last Updated**: November 9, 2025
**Railway Version**: Latest
**Deployment Success Rate**: Targeting 99%+
