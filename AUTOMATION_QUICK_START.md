# 🤖 Automation Quick Start

**Choose your automation level and get started in minutes**

---

## 🎯 Pick Your Level

### Level 1: One Command (2 minutes) ⭐ **Start Here**

**Best for:** Quick local runs, testing

```bash
# Make executable
chmod +x scripts/automate-validation.sh

# Run complete workflow
./scripts/automate-validation.sh

# What it does:
# ✅ Deploys to Railway
# ✅ Runs validation
# ✅ Downloads results
# ✅ Customizes emails
# ✅ Generates summary

# Output: validation-results/ folder ready to send
```

**Time:** 8 minutes total
**Cost:** $0

---

### Level 2: GitHub Actions (5 minutes) ⭐ **Recommended**

**Best for:** CI/CD, automatic deployment

**Setup:**
```bash
# 1. Get Railway token
railway login
railway whoami  # Copy token

# 2. Add to GitHub Secrets
# Go to: github.com/aaj441/wcagai-v4-reality-check/settings/secrets/actions
# Add: RAILWAY_TOKEN = [your-token]
# Add: RAILWAY_PROJECT_ID = [your-project-id]

# 3. Push code (triggers auto-deploy)
git push
```

**What happens:**
```
Every git push:
├─ Auto-deploys to Railway
├─ Runs health checks
├─ Notifies on success/failure
└─ Live in 3 minutes
```

**Time:** 5 min setup, then automatic
**Cost:** $0

---

### Level 3: Scheduled Scans (0 minutes) ⭐ **Autopilot**

**Best for:** Weekly monitoring, hands-off operation

**Setup:** Already done! ✅

**What happens:**
```
Every Monday 9 AM UTC:
├─ Scans 5 prospects automatically
├─ Downloads results
├─ Saves to GitHub Artifacts
└─ Retention: 30 days
```

**Download results:**
```
GitHub → Actions → "Scheduled Validation" → Artifacts → Download
```

**Manual trigger:**
```
GitHub → Actions → "Scheduled Validation" → "Run workflow"
```

**Time:** 0 min (already set up)
**Cost:** $0

---

### Level 4: Email Automation (15 minutes)

**Best for:** Scaling outreach (use with caution)

**⚠️ WARNING:** Test thoroughly, respect anti-spam laws

**Setup:**
```bash
# 1. Enable Gmail 2FA
# Visit: myaccount.google.com/security

# 2. Create App Password
# Visit: myaccount.google.com/apppasswords
# Copy 16-character password

# 3. Set environment variables
export GMAIL_USER="your@email.com"
export GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"

# 4. Install dependencies
npm install nodemailer

# 5. Configure prospect emails
nano scripts/send-validation-emails.js
# Edit lines 29-35 with real email addresses

# 6. Test (dry run)
node scripts/send-validation-emails.js --dry-run

# 7. Send for real
node scripts/send-validation-emails.js
```

**What it does:**
```
Sends emails:
├─ 2 at a time (batch mode)
├─ 1 minute delays between batches
├─ Tracks success/failure
└─ Saves results to JSON
```

**Time:** 15 min setup, 10 min to send 5 emails
**Cost:** $0

---

## 📊 Comparison Table

| Feature | Level 1 | Level 2 | Level 3 | Level 4 |
|---------|---------|---------|---------|---------|
| **Setup Time** | 2 min | 5 min | 0 min ✅ | 15 min |
| **Run Time** | 8 min | 3 min | 8 min | 10 min |
| **Frequency** | On-demand | Every push | Weekly | On-demand |
| **Oversight** | Manual | Automatic | Automatic | Semi-auto |
| **Best For** | Testing | CI/CD | Monitoring | Scale |

---

## 🚀 Recommended Path

**Week 1: Validate Market**
```bash
# Use Level 1
./scripts/automate-validation.sh
# Review emails manually
# Send to 5 prospects via Gmail
# Track replies
```

**If 2+ replies (Success!):**
```bash
# Enable Level 2 (GitHub Actions)
# Add Railway secrets to GitHub
# Auto-deploy on every push

# Enable Level 3 (Scheduled)
# Already works! Check Artifacts weekly

# Optional: Level 4 (Email)
# Only if scaling to 50+ prospects
```

**If 0-1 replies:**
```bash
# Iterate messaging
# Try different verticals
# Re-run Level 1 with new prospects
```

---

## 💡 Quick Commands

```bash
# Level 1: One-command
./scripts/automate-validation.sh

# Level 1: Skip deploy
./scripts/automate-validation.sh --skip-deploy

# Level 1: Demo mode
./scripts/automate-validation.sh --demo

# Level 2: Already works (just push)
git push

# Level 3: Manual trigger
# GitHub → Actions → Run workflow

# Level 4: Test email sending
node scripts/send-validation-emails.js --dry-run

# Level 4: Send for real
node scripts/send-validation-emails.js
```

---

## 📚 Full Documentation

- **AUTOMATION_GUIDE.md** - Complete setup guide (all 4 levels)
- **RAILWAY_QUICK_DEPLOY.md** - Railway deployment guide
- **RAILWAY_COMMANDS.md** - All Railway CLI commands
- **scripts/README_VALIDATION.md** - Validation script guide

---

## ✅ What You Have Now

All automation is **ready to use**:

✅ **Level 1:** `scripts/automate-validation.sh` (ready)
✅ **Level 2:** `.github/workflows/deploy.yml` (ready)
✅ **Level 3:** `.github/workflows/scheduled-validation.yml` (ready)
✅ **Level 4:** `scripts/send-validation-emails.js` (ready)

**Just follow setup steps above for your chosen level!**

---

## 🎯 Start Now

**Fastest path to validation:**

```bash
# 1. Run automation (8 minutes)
chmod +x scripts/automate-validation.sh
./scripts/automate-validation.sh

# 2. Review results
cat validation-results/SUMMARY.md
ls validation-results/emails/

# 3. Send to prospects
# Copy emails to Gmail

# 4. Track replies
# Create spreadsheet

# 5. Decide (7 days later)
# 2+ replies → Build platform
# 0-1 replies → Iterate
```

**Ready? Run the first command now!** 🚀
