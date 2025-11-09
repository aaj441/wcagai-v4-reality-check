# 🚀 WCAGAI v4.0 - Quick Start Guide

Get your accessibility scanner deployed to Railway in under 5 minutes!

## One-Click Deployment

### Option 1: Deploy to Railway (Recommended - Easiest!)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/aaj441/wcagai-v4-reality-check)

1. Click the "Deploy on Railway" button above
2. Sign in to Railway (or create free account)
3. Click "Deploy Now"
4. Wait 2-3 minutes for deployment
5. Click on your deployment URL
6. **Done!** Your scanner is live 🎉

### Option 2: Manual Railway Deployment

If the button doesn't work, follow these steps:

1. **Go to Railway**: https://railway.app/dashboard
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose**: `wcagai-v4-reality-check`
5. **Add Redis**: Click "New" → "Database" → "Redis"
6. **Wait for deployment** (~2-3 minutes)
7. **Get your URL**: Click "Generate Domain"

That's it! No configuration needed.

## What You Get

Once deployed, you'll have:

✅ **Live Dashboard** - Beautiful Tailwind UI at your Railway URL
✅ **REST API** - Full accessibility scanning API
✅ **Redis Cache** - 24-hour caching for performance
✅ **Auto-scaling** - Handles traffic automatically
✅ **Health Monitoring** - Built-in health checks
✅ **4 Verticals** - Healthcare, Fintech, E-commerce, Education

## Testing Your Deployment

### 1. Check Health
```bash
curl https://YOUR-APP.up.railway.app/health
```

### 2. List Verticals
```bash
curl https://YOUR-APP.up.railway.app/api/discovery/verticals
```

### 3. Discover Sites
```bash
curl "https://YOUR-APP.up.railway.app/api/discovery?vertical=healthcare&maxResults=5"
```

### 4. Scan a Website
```bash
curl -X POST https://YOUR-APP.up.railway.app/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://nih.gov"}'
```

### 5. Open Dashboard
Just visit `https://YOUR-APP.up.railway.app/` in your browser!

## Optional: Add SerpAPI Key

The app works great without it (using real 2025 fallback data), but you can add a SerpAPI key for live discovery:

1. Get free key: https://serpapi.com/manage-api-key
2. In Railway dashboard:
   - Click your service
   - Go to "Variables" tab
   - Add: `SERPAPI_KEY=your_key_here`
3. Redeploy (automatic)

## Cost

**Free to start!**
- Railway gives $5 free credit/month
- Enough for ~500 scans/month
- Perfect for testing and demos

**Production:**
- ~$12-20/month (includes Redis)
- Unlimited requests
- Auto-scaling included

## What's Included

This is a **fully production-ready** application with:

### Core Features
- ✅ Axe-core WCAG 2.0/2.1/2.2 scanning
- ✅ Puppeteer browser automation
- ✅ SerpAPI integration with fallback data
- ✅ Redis caching (24-hour TTL)
- ✅ Vertical intelligence (Healthcare: 74%, Fintech: 31%, etc.)
- ✅ Real-time compliance scoring
- ✅ ROI calculation
- ✅ Modern Tailwind dashboard
- ✅ Chart.js visualizations

### Quality & DevOps
- ✅ 66% test coverage (Jest + Supertest)
- ✅ Structured logging (Winston)
- ✅ Rate limiting (100 req/15min)
- ✅ Security (Helmet.js)
- ✅ Error tracking (Sentry-ready)
- ✅ Health checks
- ✅ Graceful shutdown
- ✅ API documentation (OpenAPI 3.0)

### Data Validation
- ✅ Real 2025 Semrush data (Healthcare)
- ✅ Real 2025 TestDevLab data (Fintech)
- ✅ Industry benchmarks
- ✅ WCAG 2.2 AA compliance

## Architecture

```
┌─────────────────────────────────────────┐
│        Railway Platform                 │
│  ┌─────────────────────────────────┐    │
│  │     WCAGAI v4.0 App             │    │
│  │  - Express.js REST API          │    │
│  │  - Puppeteer Scanner            │    │
│  │  - Tailwind Dashboard           │    │
│  └──────────┬──────────────────────┘    │
│             │                            │
│  ┌──────────▼──────────┐                │
│  │   Redis Cache       │                │
│  │   (Railway Plugin)  │                │
│  └─────────────────────┘                │
└─────────────────────────────────────────┘
         │              │
         ▼              ▼
    Browser         SerpAPI
    Scanning       Discovery
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info and dashboard |
| `/health` | GET | Health check |
| `/api/discovery/verticals` | GET | List all verticals |
| `/api/discovery?vertical=X` | GET | Discover sites |
| `/api/scan` | POST | Scan single URL |
| `/api/scan/vertical` | POST | Scan entire vertical |
| `/api/scan/status` | GET | Scanner status |
| `/api/docs` | GET | OpenAPI documentation |

## Troubleshooting

### Deployment Failed?
- Check Railway logs: Click your service → "Deployments" → "Logs"
- Verify Redis plugin added: Should see `REDIS_URL` in Variables
- Check build logs for errors

### Can't Access URL?
- Make sure you generated a domain: Railway dashboard → "Settings" → "Generate Domain"
- Wait 2-3 minutes for DNS propagation

### Redis Connection Error?
- Add Redis plugin: Railway dashboard → "New" → "Database" → "Redis"
- Redis URL auto-configured, no manual setup needed

### Scanner Not Working?
- Chromium installed via Nixpacks (automatic)
- Check logs for Puppeteer errors
- Increase timeout if needed: Set `SCAN_TIMEOUT_MS=60000`

## Support

- **Documentation**: See [README.md](./README.md)
- **Railway Docs**: https://docs.railway.app
- **Issues**: https://github.com/aaj441/wcagai-v4-reality-check/issues

## Next Steps

After deployment:

1. ✅ **Test all endpoints** (use test script above)
2. ✅ **Set up monitoring** (Railway metrics built-in)
3. ✅ **Add SerpAPI key** (optional)
4. ✅ **Configure Sentry** (optional, for error tracking)
5. ✅ **Share your scanner** with the world! 🌍

## Show Me!

**Live Demo Steps:**

1. Deploy (1 click)
2. Wait (2 minutes)
3. Visit dashboard
4. Click "Scan Healthcare Vertical"
5. See real-time results!

**What You'll See:**
- Compliance scores (e.g., Healthcare: 74%)
- Violation breakdown by severity
- Top accessibility issues
- Revenue impact calculation
- Site-by-site comparison

## Production Ready

This isn't a demo or prototype. You're deploying a **fully production-ready** application with:

- ✅ 2,800+ lines of application code
- ✅ 500+ lines of tests
- ✅ Real 2025 data validation
- ✅ Industry-grade architecture
- ✅ DevOps best practices
- ✅ Comprehensive documentation

## Let's Go! 🚀

Click the Railway button above and you'll have a live accessibility scanner in under 5 minutes.

No credit card required. No complex setup. Just deploy and scan.

---

**Status**: ✅ Ready to deploy
**Deploy Time**: ~2-3 minutes
**Cost**: Free to start ($5 credit)
**Support**: GitHub issues

**Your scanner will be live at**: `https://<your-project>.up.railway.app`

Let's make the web more accessible! ♿
