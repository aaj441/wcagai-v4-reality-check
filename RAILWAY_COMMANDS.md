# Railway Commands - Quick Reference Card

**Project:** WCAGAI v4.0 Market Validation
**Purpose:** Deploy scanner + run validation + download results

---

## 🚀 Initial Setup (One Time)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login (opens browser)
railway login

# Link to your deployed project
railway init
# Or if already deployed:
railway link
```

---

## 📦 Deployment Commands

```bash
# Deploy code changes
railway up

# Deploy specific file
railway up scripts/manual-validation.js

# Force rebuild
railway up --detach

# View deployment status
railway status
```

---

## 🔍 Viewing Information

```bash
# View logs (live tail)
railway logs

# View last 100 log lines
railway logs --lines 100

# View environment variables
railway variables

# Get deployment URL
railway domain

# Check Redis connection
railway run echo $REDIS_URL
```

---

## 🎯 Running Validation Script

```bash
# Run validation (full workflow)
railway run node scripts/manual-validation.js

# Run in demo mode (no Chrome)
railway run DEMO_MODE=true node scripts/manual-validation.js

# Run with custom prospects
# First edit scripts/manual-validation.js, then:
railway run node scripts/manual-validation.js
```

---

## 📥 Downloading Results

```bash
# Download all results (automated)
./scripts/download-validation-results.sh

# Download individual files
railway run cat output/emails/HealthTech_Solutions.txt > email.txt

# Download as archive
railway run tar -czf results.tar.gz output/
railway run cat results.tar.gz > results.tar.gz
tar -xzf results.tar.gz

# List available files
railway run ls -la output/emails/
railway run ls -la output/screenshots/
railway run ls -la output/reports/
```

---

## 🐚 Interactive Shell

```bash
# Open shell in Railway environment
railway shell

# Inside shell:
node scripts/manual-validation.js
ls output/emails/
cat output/emails/HealthTech_Solutions.txt
exit
```

---

## 🧪 Testing Scanner API

```bash
# Get your Railway URL
RAILWAY_URL=$(railway domain)

# Test health check
curl https://$RAILWAY_URL/health

# Test single site scan
curl -X POST https://$RAILWAY_URL/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Test vertical discovery
curl "https://$RAILWAY_URL/api/discover/healthcare"
```

---

## ⚙️ Environment Variables

```bash
# List all variables
railway variables

# Set variable
railway variables set NODE_ENV=production

# Set multiple variables
railway variables set \
  NODE_ENV=production \
  ALLOWED_ORIGINS=https://your-domain.railway.app

# Delete variable
railway variables delete SERPAPI_KEY
```

---

## 🔌 Redis Management

```bash
# Check Redis connection
railway run node -e "const redis = require('./src/services/cache'); redis.connect().then(() => console.log('Connected!'))"

# View Redis status
railway run curl http://localhost:3000/health | grep -i redis

# Add Redis plugin (via dashboard)
# Railway Dashboard → + New → Database → Redis
```

---

## 🛠️ Troubleshooting

```bash
# View recent errors
railway logs --lines 500 | grep -i error

# Restart service
railway restart

# Check build logs
railway logs --deployment

# Check resource usage
railway status

# Open Railway dashboard
railway open
```

---

## 🔄 Common Workflows

### Workflow 1: Deploy & Validate

```bash
# 1. Deploy latest code
railway up

# 2. Wait for deployment
railway status

# 3. Run validation
railway run node scripts/manual-validation.js

# 4. Download results
./scripts/download-validation-results.sh

# 5. View first email
cat validation-results/emails/HealthTech_Solutions.txt
```

### Workflow 2: Update Prospects & Re-run

```bash
# 1. Edit prospects locally
nano scripts/manual-validation.js

# 2. Deploy changes
railway up

# 3. Run validation with new prospects
railway run node scripts/manual-validation.js

# 4. Download new results
./scripts/download-validation-results.sh
```

### Workflow 3: Debug Validation Issues

```bash
# 1. Open shell
railway shell

# 2. Run validation interactively
node scripts/manual-validation.js

# 3. Check for errors
ls output/
cat output/reports/*.json

# 4. Exit
exit
```

---

## 📊 Monitoring Commands

```bash
# Watch logs in real-time
railway logs --follow

# Check uptime
railway status

# View health check
curl https://$(railway domain)/health

# Check Redis status
railway run node -e "console.log(process.env.REDIS_URL)"
```

---

## 🧹 Cleanup Commands

```bash
# Remove old validation results (on Railway)
railway run rm -rf output/*

# Reset validation
railway run mkdir -p output/emails output/screenshots output/reports

# Delete project (CAUTION!)
railway delete
```

---

## 🆘 Emergency Commands

```bash
# Service crashed - restart
railway restart

# Logs not showing - force refresh
railway logs --refresh

# Deployment stuck - force redeploy
railway up --force

# Need to rollback - check deployments
railway deployments

# Critical error - open dashboard
railway open
```

---

## 💡 Pro Tips

### Tip 1: Create Aliases
```bash
# Add to ~/.bashrc or ~/.zshrc
alias rv='railway run node scripts/manual-validation.js'
alias rl='railway logs --follow'
alias rs='railway status'
alias rsh='railway shell'

# Now use:
rv  # Run validation
rl  # View logs
rs  # Check status
```

### Tip 2: Quick Validation Check
```bash
# One-liner to run & download
railway run node scripts/manual-validation.js && ./scripts/download-validation-results.sh
```

### Tip 3: Background Validation
```bash
# Run in background, check logs later
railway run node scripts/manual-validation.js &
# Check later:
railway logs --lines 100
```

---

## 📋 Pre-flight Checklist

Before running validation:

```bash
# ✅ Check deployment is live
railway status

# ✅ Check health endpoint
curl https://$(railway domain)/health

# ✅ Check Redis connected
railway run echo $REDIS_URL

# ✅ Check Chromium available
railway run which chromium

# ✅ Check output directory exists
railway run ls output/
```

---

## 🎯 Quick Start (Complete Flow)

```bash
# 1. Setup (one time)
npm i -g @railway/cli
railway login
railway link

# 2. Deploy
railway up

# 3. Validate
railway run node scripts/manual-validation.js

# 4. Download
./scripts/download-validation-results.sh

# 5. Review
cat validation-results/emails/*.txt

# 6. Send to prospects!
```

---

## 📞 Get Help

```bash
# Railway CLI help
railway help

# Specific command help
railway run --help
railway logs --help

# Open docs
open https://docs.railway.app

# Check version
railway version
```

---

**Copy this file to your desktop for quick reference during deployment!**

**Most Used Commands:**
1. `railway run node scripts/manual-validation.js` - Run validation
2. `./scripts/download-validation-results.sh` - Download results
3. `railway logs` - View logs
4. `railway status` - Check deployment status
5. `railway shell` - Interactive debugging
