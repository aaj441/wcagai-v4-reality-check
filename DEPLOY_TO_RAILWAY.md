# Deploy WCAGAI v4.0 to Railway - Complete Guide

This guide will walk you through deploying the WCAGAI v4.0 accessibility scanner to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- Railway CLI installed
- Git repository pushed to GitHub

## Quick Deploy (Recommended)

### Option 1: Deploy via Railway UI (Easiest)

1. **Visit Railway Dashboard**
   - Go to https://railway.app/dashboard
   - Click "New Project"

2. **Deploy from GitHub**
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub
   - Select the `wcagai-v4-reality-check` repository
   - Railway will auto-detect the configuration from `railway.json`

3. **Add Redis Plugin**
   - In your project, click "New"
   - Select "Database" → "Redis"
   - Railway will automatically set the `REDIS_URL` environment variable

4. **Set Environment Variables** (Optional)
   - Click on your service
   - Go to "Variables" tab
   - Add these optional variables:
     ```
     NODE_ENV=production
     SERPAPI_KEY=your_serpapi_key_here (optional)
     ```

5. **Deploy**
   - Railway will automatically deploy
   - Wait for build to complete (~2-3 minutes)
   - Click on the deployment to get your public URL

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd /path/to/wcagai-v4-reality-check
   railway init
   ```
   - Select "Create a new project"
   - Name it "wcagai-v4"

4. **Add Redis Plugin**
   ```bash
   railway add --plugin redis
   ```

5. **Set Environment Variables**
   ```bash
   # Production environment
   railway variables set NODE_ENV=production

   # Optional: Add SerpAPI key
   railway variables set SERPAPI_KEY=your_key_here
   ```

6. **Deploy**
   ```bash
   railway up
   ```

7. **Generate Public Domain**
   ```bash
   railway domain
   ```

8. **Check Deployment**
   ```bash
   railway status
   railway logs
   ```

## Configuration Details

### Automatic Configuration

Railway automatically configures:
- `PORT` - Set by Railway (usually 3000 or dynamic)
- `REDIS_URL` - Auto-configured when Redis plugin is added
- Build command from `railway.json`
- Health check endpoint `/health`

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | Set to `production` |
| `PORT` | No | 3000 | Auto-set by Railway |
| `REDIS_URL` | **Yes** | - | Auto-set by Redis plugin |
| `SERPAPI_KEY` | No | - | API key from serpapi.com |
| `MAX_CONCURRENT_SCANS` | No | 3 | Concurrent scan limit |
| `SCAN_TIMEOUT_MS` | No | 30000 | Scan timeout (30s) |
| `SENTRY_DSN` | No | - | Error tracking DSN |

### Build Configuration

Railway uses the `railway.json` configuration:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install --production=false"
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

### Nixpacks Configuration

The `nixpacks.toml` file configures Chromium for Puppeteer:

- Installs Chromium and dependencies
- Sets Puppeteer to use system Chromium
- Includes necessary fonts and libraries

## Verification

Once deployed, verify your deployment:

1. **Health Check**
   ```bash
   curl https://your-app.up.railway.app/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-11-09T...",
     "services": {
       "redis": "connected",
       "scanner": "ready"
     }
   }
   ```

2. **API Endpoint**
   ```bash
   curl https://your-app.up.railway.app/api/discovery/verticals
   ```

3. **Dashboard**
   Open `https://your-app.up.railway.app/` in your browser

## Testing the Deployed App

### Test Discovery API
```bash
curl "https://your-app.up.railway.app/api/discovery?vertical=healthcare&maxResults=5"
```

### Test Scan API
```bash
curl -X POST https://your-app.up.railway.app/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://nih.gov"}'
```

### Test Vertical Scan
```bash
curl -X POST https://your-app.up.railway.app/api/scan/vertical \
  -H "Content-Type: application/json" \
  -d '{"vertical": "healthcare", "maxSites": 3}'
```

## Monitoring

### View Logs
```bash
railway logs --follow
```

### View Metrics
- Go to Railway dashboard
- Select your project
- View "Metrics" tab for CPU, memory, and network usage

### Health Monitoring
Set up monitoring on the `/health` endpoint:
- Expected status code: 200
- Response time: < 500ms
- Check interval: 30 seconds

## Troubleshooting

### Deployment Fails

**Check logs:**
```bash
railway logs
```

**Common issues:**
- Missing Redis plugin → Add via `railway add --plugin redis`
- Build timeout → Check `nixpacks.toml` configuration
- Port binding → Railway auto-assigns PORT

### Redis Connection Fails

**Verify Redis plugin:**
```bash
railway variables
```

Look for `REDIS_URL` variable. If missing:
```bash
railway add --plugin redis
```

### Puppeteer/Chromium Errors

**Check Nixpacks configuration:**
- Ensure `nixpacks.toml` includes Chromium packages
- Verify `PUPPETEER_EXECUTABLE_PATH` is set
- Check logs for missing dependencies

**Manual fix:**
Add these environment variables:
```bash
railway variables set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### Application Not Responding

**Check health endpoint:**
```bash
curl https://your-app.up.railway.app/health
```

**Restart deployment:**
```bash
railway up --detach
```

**View service status:**
```bash
railway status
```

## Scaling & Performance

### Vertical Scaling
- Railway automatically scales based on usage
- Default: 512MB RAM, 0.5 vCPU
- Upgrade plan for higher limits

### Horizontal Scaling
- Not required for most use cases
- Consider if handling >1000 scans/hour

### Optimization Tips
1. **Enable Redis caching** - Already configured
2. **Rate limiting** - Already configured (100 req/15min)
3. **Concurrent scans** - Default: 3 (adjustable via `MAX_CONCURRENT_SCANS`)
4. **Monitor memory** - Puppeteer can use 100-200MB per scan

## Cost Estimation

Railway pricing (as of 2025):
- **Hobby Plan** (Free): $5 credit/month
  - Enough for development and testing
  - ~500 scans/month

- **Developer Plan**: $5/month + usage
  - Redis: ~$2-5/month
  - App: ~$5-10/month
  - Total: ~$12-20/month

## Production Checklist

- [ ] Redis plugin added
- [ ] Environment variables set
- [ ] Health check responding
- [ ] Dashboard accessible
- [ ] API endpoints tested
- [ ] Sentry configured (optional)
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Rate limits tested
- [ ] Error handling verified

## Custom Domain (Optional)

1. **Go to Railway dashboard**
2. **Select your service**
3. **Go to "Settings"**
4. **Click "Generate Domain"** or **"Custom Domain"**
5. **Add CNAME record** to your DNS:
   ```
   CNAME www your-app.up.railway.app
   ```

## CI/CD Integration

Railway auto-deploys on git push:

1. **Connect GitHub repo** (already done)
2. **Push to main branch**
   ```bash
   git push origin main
   ```
3. **Railway automatically deploys**

### Manual Trigger
```bash
railway up
```

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **WCAGAI Issues**: https://github.com/aaj441/wcagai-v4-reality-check/issues

## Next Steps

After successful deployment:

1. **Test all endpoints** using the verification steps above
2. **Set up monitoring** with health checks
3. **Configure Sentry** for error tracking (optional)
4. **Add custom domain** (optional)
5. **Share the URL** and start scanning!

## Example Deployment Flow

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize
railway init

# 4. Add Redis
railway add --plugin redis

# 5. Set environment
railway variables set NODE_ENV=production

# 6. Deploy
railway up

# 7. Generate domain
railway domain

# 8. Test
curl https://your-app.up.railway.app/health

# 9. View logs
railway logs --follow
```

---

**Deployment Status**: ✅ Ready to deploy
**Estimated Deploy Time**: 2-3 minutes
**Required Services**: Redis (automatically configured)
**Cost**: ~$12-20/month (includes Redis)

**Your app will be live at**: `https://<your-project>.up.railway.app`

Happy deploying! 🚀
