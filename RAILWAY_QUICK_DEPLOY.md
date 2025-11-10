# 🚀 Railway Deployment Guide - Quick Start

**Time to Deploy:** 5 minutes
**Time to Validate:** 10 minutes (5 prospect scans)
**Total:** 15 minutes from zero to validated emails

---

## ✅ Prerequisites

- [ ] GitHub account (to connect repository)
- [ ] Railway account (free - sign up at https://railway.app)
- [ ] Repository pushed to GitHub

---

## 🚀 Step 1: Deploy to Railway (3 minutes)

### Option A: One-Click Deploy (Easiest)

1. **Visit Railway:**
   - Go to https://railway.app
   - Click **"Login"** → Sign in with GitHub

2. **Create New Project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose: `aaj441/wcagai-v4-reality-check`
   - Railway will automatically detect configuration

3. **Watch Deployment:**
   ```
   ✅ Reading configuration (railway.toml, nixpacks.toml)
   ✅ Installing Chromium + dependencies
   ✅ Installing Node.js packages
   ✅ Building application
   ✅ Deployment live!
   ```

4. **Copy Your URL:**
   - Click **"Settings"** → Copy domain
   - Example: `wcagai-v4-production.up.railway.app`

---

### Option B: Railway CLI (For Developers)

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login
# Opens browser for GitHub authentication

# 3. Initialize project
railway init
# Select: Create new project
# Name: wcagai-v4-production

# 4. Deploy
railway up
# Uploads code and deploys

# 5. Get deployment URL
railway domain
```

---

## 🔌 Step 2: Add Redis (1 minute)

**In Railway Dashboard:**

1. Click your project → **"+ New"**
2. Select **"Database"** → **"Add Redis"**
3. Redis auto-connects (REDIS_URL set automatically) ✅

**Verify:**
```bash
railway run echo $REDIS_URL
# Should show: redis://default:password@host:port
```

---

## ⚙️ Step 3: Set Environment Variables (1 minute)

**In Railway Dashboard → Variables tab:**

### Required:
```bash
NODE_ENV=production
```

### Recommended:
```bash
# Get your Railway domain first
ALLOWED_ORIGINS=https://your-project.up.railway.app

# Optional: For real site discovery (uses fallback without it)
SERPAPI_KEY=your_serpapi_key_here
```

**Click "Deploy" after adding variables** (triggers redeploy)

---

## ✅ Step 4: Verify Deployment (1 minute)

### Test Health Endpoint:
```bash
curl https://your-project.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T16:00:00.000Z",
  "uptime": 42.5,
  "redis": {
    "connected": true,
    "url": "redis://..."
  },
  "environment": "production"
}
```

### Test Dashboard:
Open in browser: `https://your-project.up.railway.app`

**Should see:**
- ✅ Modern Tailwind UI
- ✅ 5 vertical buttons (Healthcare, Fintech, Education, Gaming, E-commerce)
- ✅ No errors in console

---

## 🎯 Step 5: Run Validation Script (5 minutes)

Now the exciting part - run real accessibility scans!

### Option A: Via Railway Shell (Interactive)

```bash
# 1. Open shell
railway shell

# 2. Run validation (takes ~5 minutes for 5 sites)
node scripts/manual-validation.js

# 3. View results
ls output/emails/
cat output/emails/HealthTech_Solutions.txt

# 4. Exit
exit
```

### Option B: Via Railway Run (One Command)

```bash
# Run validation
railway run node scripts/manual-validation.js

# This will:
# - Launch real Chrome browsers
# - Scan 5 websites (webmd.com, chase.com, etc.)
# - Run axe-core audits
# - Generate personalized emails
# - Save screenshots of violations
```

**Expected Output:**
```
🚀 WCAG AI Platform - Manual Validation Script

============================================================
Scanning 5 prospect websites to validate market demand...

[1/5] Processing: HealthTech Solutions
------------------------------------------------------------
  → Launching browser...
  → Loading https://www.webmd.com...
  → Running accessibility audit...
  ✓ Scan complete: 47 critical violations
  ✓ Compliance score: 68/100
  → Drafting outreach email...
  ✓ Email saved: output/emails/HealthTech_Solutions.txt

[2/5] Processing: FinancePro Digital
------------------------------------------------------------
  → Launching browser...
  → Loading https://www.chase.com...
  → Running accessibility audit...
  ✓ Scan complete: 53 critical violations
  ✓ Compliance score: 54/100
  → Drafting outreach email...
  ✓ Email saved: output/emails/FinancePro_Digital.txt

[... 3 more prospects ...]

============================================================
✅ VALIDATION COMPLETE!

📊 Summary:
  • Prospects scanned: 5/5
  • Total violations found: 237
  • Average compliance: 58/100
  • High-risk prospects: 3
  • Estimated TAM: $75,000/year

📧 Generated Emails:
  1. HealthTech Solutions → output/emails/HealthTech_Solutions.txt
  2. FinancePro Digital → output/emails/FinancePro_Digital.txt
  3. EduLearn Platform → output/emails/EduLearn_Platform.txt
  4. GameHub Network → output/emails/GameHub_Network.txt
  5. ShopEasy Commerce → output/emails/ShopEasy_Commerce.txt

💾 Full report saved: output/reports/validation-[timestamp].json
```

---

## 📥 Step 6: Download Results (2 minutes)

### Download Individual Emails:

```bash
# Download each email
railway run cat output/emails/HealthTech_Solutions.txt > HealthTech_email.txt
railway run cat output/emails/FinancePro_Digital.txt > FinancePro_email.txt
railway run cat output/emails/EduLearn_Platform.txt > EduLearn_email.txt
railway run cat output/emails/GameHub_Network.txt > GameHub_email.txt
railway run cat output/emails/ShopEasy_Commerce.txt > ShopEasy_email.txt
```

### Download All at Once:

```bash
# Package everything
railway run tar -czf validation-results.tar.gz output/

# Download archive
railway run cat validation-results.tar.gz > validation-results.tar.gz

# Extract locally
tar -xzf validation-results.tar.gz

# Now you have:
# output/emails/*.txt - All generated emails
# output/screenshots/*.png - Violation screenshots
# output/reports/*.json - Full scan data
```

---

## 🎨 Optional: View Results in Dashboard

The deployed app also has a web dashboard:

1. **Open Dashboard:** `https://your-project.up.railway.app`

2. **Scan a Prospect:**
   - Click **"Healthcare"** vertical
   - Click **"Scan Now"**
   - See live results in browser

3. **View Violations:**
   - Table shows all sites scanned
   - Compliance scores
   - Violation counts
   - Click for details

---

## 🎯 What You Get With Real Scans

### Real Data vs Demo Data

| Metric | Demo Mode | Real Railway Scans |
|--------|-----------|-------------------|
| **Violations** | Simulated (3-18) | **Actual from axe-core (20-80+)** |
| **Compliance Score** | Estimated | **Accurate calculation** |
| **Screenshots** | Not captured | **Real violation screenshots** |
| **WCAG Criteria** | Generic | **Specific (1.4.3, 2.1.1, etc.)** |
| **Fix Instructions** | General | **Developer-ready** |
| **Credibility** | Low | **HIGH - real data** |

### Email Quality Improvement

**Demo Email:**
```
"I found 3 critical violations..."
- Generic violation descriptions
- No specific WCAG criteria
- No proof available
```

**Real Scan Email:**
```
"I found 47 critical WCAG 2.2 violations..."
- Specific: "Missing alt text on 12 product images"
- WCAG criteria: "Fails 1.1.1 Non-text Content (Level A)"
- Can attach screenshot proof
- Can send full PDF report on request
```

**Reply rate expected: 2-3x higher with real data**

---

## 📧 Step 7: Customize & Send Emails (1 hour)

### Customize Your Emails:

Each generated email has placeholders:

```
[Your Calendly Link] → https://calendly.com/yourname/15min
[Your Name] → John Smith
[Your Website] → https://wcagai.com
```

**Find & replace in all files:**

```bash
# On Mac/Linux:
cd output/emails/
sed -i 's/\[Your Name\]/John Smith/g' *.txt
sed -i 's/\[Your Website\]/https:\/\/wcagai.com/g' *.txt
sed -i 's/\[Your Calendly Link\]/https:\/\/calendly.com\/john\/15min/g' *.txt

# On Windows (PowerShell):
Get-ChildItem output/emails/*.txt | ForEach-Object {
  (Get-Content $_) -replace '\[Your Name\]', 'John Smith' | Set-Content $_
}
```

### Add Your Real Prospects:

1. Edit `scripts/manual-validation.js` lines 24-48
2. Replace with your real target companies
3. Re-run validation: `railway run node scripts/manual-validation.js`

### Send Via Gmail:

1. Open Gmail
2. Compose new email
3. Copy subject + body from `.txt` file
4. Attach screenshot from `output/screenshots/`
5. Send!

---

## 📊 Track Results (7 days)

Create a tracking spreadsheet:

| Company | Email | Sent Date | Reply? | Interest | Next Steps |
|---------|-------|-----------|--------|----------|------------|
| HealthTech Solutions | cto@... | Nov 10 | ✅ Yes | High | Demo call Nov 15 |
| FinancePro Digital | eng@... | Nov 10 | ⏳ Pending | - | Follow up Nov 17 |
| EduLearn Platform | prod@... | Nov 10 | ✅ Yes | Medium | Sent full report |
| GameHub Network | dev@... | Nov 10 | ❌ No | - | - |
| ShopEasy Commerce | tech@... | Nov 10 | ⏳ Pending | - | Follow up Nov 17 |

**Success Metrics:**
- **2+ replies** (40%+) → Strong PMF → BUILD FULL PLATFORM ✅
- **1 reply** (20%) → Moderate interest → Iterate, try 5 more
- **0 replies** (0%) → Weak PMF → Pivot vertical or messaging

---

## 🔧 Troubleshooting

### Issue: "Could not find Chrome"

**Cause:** Nixpacks didn't install Chromium properly

**Fix:**
```bash
# Check nixpacks.toml includes:
[phases.setup]
nixPkgs = ["chromium", "nss", "freetype"]

# Redeploy
railway up
```

---

### Issue: "Redis connection failed"

**Cause:** Redis plugin not added or not connected

**Fix:**
1. Railway Dashboard → Add Redis plugin
2. Verify `REDIS_URL` in Variables tab
3. Redeploy

---

### Issue: "Validation script times out"

**Cause:** Scanning 5 sites takes time (1 min each)

**Fix:**
```bash
# Scan one site at a time for testing
railway shell
node scripts/manual-validation.js

# Or increase Railway timeout
# Settings → Healthcheck Timeout → 300 seconds
```

---

### Issue: "Output files not found"

**Cause:** Files saved to ephemeral filesystem (lost on restart)

**Fix:**
```bash
# Download immediately after validation
railway run tar -czf validation-results.tar.gz output/
railway run cat validation-results.tar.gz > validation-results.tar.gz
```

**For permanent storage:**
- Use Railway volumes (persistent storage)
- Or upload to S3/cloud storage after generation

---

## 💰 Costs

### Railway Free Tier:
- ✅ $5 free credit per month
- ✅ Enough for validation + testing
- ✅ No credit card required

### Expected Usage:
- **App deployment:** ~$0.50/month (hobby tier)
- **Redis:** ~$1.00/month (512MB)
- **Running validation:** ~$0.10 per run
- **Total:** ~$2/month for validation

**You can validate for FREE with Railway's $5 credit**

---

## ✅ Success Checklist

Before sending emails, verify:

- [ ] Railway deployed successfully
- [ ] Health check returns 200 OK
- [ ] Redis connected
- [ ] Dashboard loads in browser
- [ ] Validation script ran without errors
- [ ] 5 emails generated
- [ ] Emails downloaded locally
- [ ] Placeholders replaced with your info
- [ ] Real prospects added (optional)
- [ ] Tracking spreadsheet created

---

## 🚀 Quick Command Reference

```bash
# Deploy
railway login
railway init
railway up

# Add Redis
# Via dashboard: + New → Database → Redis

# Run validation
railway run node scripts/manual-validation.js

# Download results
railway run cat output/emails/HealthTech_Solutions.txt

# View logs
railway logs

# Open shell
railway shell

# Check status
railway status
```

---

## 🎯 What's Next?

### Immediate (Today):
1. ✅ Deploy to Railway (5 minutes)
2. ✅ Run validation script (5 minutes)
3. ✅ Download emails (2 minutes)
4. ✅ Customize placeholders (10 minutes)

### This Week:
5. ✅ Send to 5 real prospects
6. ✅ Track replies in spreadsheet
7. ✅ Follow up after 3 days (if no reply)

### Next Week (Day 7):
8. ✅ Analyze results:
   - **2+ replies** → Build full platform (Option C)
   - **1 reply** → Iterate messaging, try 5 more
   - **0 replies** → Pivot vertical or value prop

---

## 📚 Additional Resources

- **Railway Docs:** https://docs.railway.app
- **Puppeteer on Railway:** https://docs.railway.app/guides/puppeteer
- **Full Deployment Guide:** `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Validation Guide:** `scripts/README_VALIDATION.md`

---

**You're ready to deploy! Let's get those real scan results.** 🚀

```bash
# Start here:
railway login
railway init
railway up
```
