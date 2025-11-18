# 🤖 Complete Automation Guide

**Transform manual validation into fully automated workflows**

This guide covers 4 levels of automation - from simple one-command scripts to full CI/CD pipelines.

---

## 🎯 Automation Options Overview

| Level | What It Automates | Setup Time | Best For |
|-------|-------------------|------------|----------|
| **Level 1: One-Command** | Deploy → Validate → Download | 2 min | Quick local runs |
| **Level 2: GitHub Actions** | Auto-deploy on git push | 5 min | CI/CD pipeline |
| **Level 3: Scheduled Scans** | Weekly validation runs | 5 min | Ongoing monitoring |
| **Level 4: Email Automation** | Send emails automatically | 15 min | Sales outreach at scale |

---

## 🚀 Level 1: One-Command Automation (Easiest)

**Automates:** Deploy → Validate → Download → Customize

### Setup (One Time)

```bash
# Make script executable
chmod +x scripts/automate-validation.sh

# Set your personalization (optional)
export YOUR_NAME="John Smith"
export YOUR_WEBSITE="https://wcagai.com"
export YOUR_CALENDLY="https://calendly.com/john/15min"
```

### Run Full Workflow

```bash
# Complete workflow: Deploy + Validate + Download
./scripts/automate-validation.sh

# Skip deployment (if already deployed)
./scripts/automate-validation.sh --skip-deploy

# Use demo mode (no Chrome needed)
./scripts/automate-validation.sh --demo
```

**What it does:**
1. ✅ Checks Railway CLI installed
2. ✅ Deploys to Railway (if not skipped)
3. ✅ Runs validation script
4. ✅ Downloads all results
5. ✅ Customizes emails with your info
6. ✅ Generates summary report

**Output:** `validation-results/` folder with everything ready to send

**Time:** 8 minutes (2 min deploy + 5 min scan + 1 min download)

---

## ⚙️ Level 2: GitHub Actions CI/CD (Recommended)

**Automates:** Deploy on every git push

### Setup (5 minutes)

#### Step 1: Get Railway Token

```bash
# Login to Railway
railway login

# Get your token
railway whoami

# Copy the token shown
```

**Or get from dashboard:**
1. Visit https://railway.app/account/tokens
2. Click "Create Token"
3. Copy token

#### Step 2: Get Railway Project ID

```bash
# Link to your project first
railway link

# Get project ID (shown in railway.json or)
cat railway.json | grep projectId

# Or from URL in dashboard:
# https://railway.app/project/YOUR-PROJECT-ID
```

#### Step 3: Add GitHub Secrets

1. Go to your repository: https://github.com/aaj441/wcagai-v4-reality-check
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets:

**Secret 1:**
- Name: `RAILWAY_TOKEN`
- Value: `[your Railway token from step 1]`

**Secret 2:**
- Name: `RAILWAY_PROJECT_ID`
- Value: `[your project ID from step 2]`

#### Step 4: Enable Actions

1. In your repo, click **Actions** tab
2. Click "I understand my workflows, go ahead and enable them"

### How It Works

**Automatic deployment:**
```bash
# Any push to main or your branch triggers deployment
git add .
git commit -m "Update validation script"
git push

# GitHub Actions automatically:
# 1. Checks out code
# 2. Installs Railway CLI
# 3. Deploys to Railway
# 4. Waits for deployment
# 5. Verifies health check
# 6. Notifies success/failure
```

**View deployment:**
- GitHub → Actions tab → See live deployment logs

---

## 📅 Level 3: Scheduled Validation (Autopilot)

**Automates:** Run validation weekly, download results automatically

### Setup (Already Done!)

The workflow file is already created: `.github/workflows/scheduled-validation.yml`

**Default schedule:** Every Monday at 9 AM UTC

### Customize Schedule

Edit `.github/workflows/scheduled-validation.yml` line 6:

```yaml
schedule:
  # Daily at 9 AM UTC
  - cron: '0 9 * * *'

  # Every Monday at 9 AM UTC (default)
  - cron: '0 9 * * 1'

  # First day of month at 9 AM UTC
  - cron: '0 9 1 * *'

  # Every Friday at 5 PM UTC
  - cron: '0 17 * * 5'
```

**Cron format:** `minute hour day month weekday`

### Manual Trigger

You can also run validation on-demand:

1. GitHub → **Actions** tab
2. Click **"Scheduled Validation"**
3. Click **"Run workflow"**
4. Click **"Run workflow"** button

### Download Results

After validation runs:

1. GitHub → **Actions** tab
2. Click latest **"Scheduled Validation"** run
3. Scroll down to **"Artifacts"**
4. Download `validation-results-XXX.zip`
5. Unzip and review emails

**Artifact retention:** 30 days (configurable)

---

## 📧 Level 4: Email Automation (Advanced)

**Automates:** Send emails automatically to prospects

**⚠️ IMPORTANT WARNINGS:**
- Test thoroughly before sending to real prospects
- Respect anti-spam laws (CAN-SPAM Act, GDPR)
- Use email warm-up services to avoid spam folder
- Consider starting with manual sends for first batch
- Never send unsolicited emails in Europe (GDPR)

### Setup Gmail App Password (5 minutes)

#### Step 1: Enable 2FA on Gmail

1. Visit: https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Follow setup wizard
4. Verify with phone number

#### Step 2: Create App Password

1. Visit: https://myaccount.google.com/apppasswords
2. Select app: **"Mail"**
3. Select device: **"Other"** → Type: "WCAG Scanner"
4. Click **"Generate"**
5. Copy the 16-character password

#### Step 3: Set Environment Variables

```bash
# Add to ~/.bashrc or ~/.zshrc
export GMAIL_USER="your-email@gmail.com"
export GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"  # From step 2

# Reload
source ~/.bashrc  # or source ~/.zshrc
```

### Install Dependencies

```bash
npm install nodemailer
```

### Configure Prospect Emails

Edit `scripts/send-validation-emails.js` lines 29-35:

```javascript
prospects: {
  'HealthTech_Solutions.txt': 'cto@real-company.com',       // Real email
  'FinancePro_Digital.txt': 'engineering@real-fintech.com', // Real email
  'EduLearn_Platform.txt': 'product@real-edu.com',          // Real email
  'GameHub_Network.txt': 'dev@real-gaming.com',             // Real email
  'ShopEasy_Commerce.txt': 'tech@real-commerce.com'         // Real email
}
```

### Test Sending (DRY RUN)

```bash
# Test without actually sending
node scripts/send-validation-emails.js --dry-run

# Output:
# [DRY RUN] Would send to: cto@real-company.com
# Subject: [Compliance Alert] ...
# Preview: Hi HealthTech Solutions Team...
```

### Send For Real

```bash
# Send emails (2 at a time, 1 minute between batches)
node scripts/send-validation-emails.js

# Output:
# ⚠️  WARNING: This will send real emails!
# Press Ctrl+C to cancel, or wait 5 seconds...
#
# Sending batch 1/3...
#   → cto@real-company.com
#   ✓ Sent (Message ID: xxx)
#   → engineering@real-fintech.com
#   ✓ Sent (Message ID: xxx)
#
# Waiting 60 seconds before next batch...
```

### Email Sending Best Practices

**1. Warm up your email:**
- Send to yourself first (5-10 emails over 3 days)
- Reply to yourself
- Mark as "Not Spam" if needed
- Gradually increase volume

**2. Avoid spam filters:**
- Send max 5-10 emails per day initially
- Use 1-minute delays between emails
- Don't send identical content to all prospects
- Personalize each email (add custom intro)

**3. Legal compliance:**
- ✅ Only send to business contacts (B2B)
- ✅ Include your real name and website
- ✅ Provide clear unsubscribe mechanism
- ✅ Honor opt-out requests immediately
- ❌ Never send to personal emails without consent
- ❌ Never send in bulk to European contacts (GDPR)

**4. Track results:**
- Use unique tracking links per prospect
- Log all sends in spreadsheet
- Track open rates (use email tracking service)
- Monitor reply rates

---

## 🔄 Complete Automated Workflow

Combine all levels for maximum automation:

### Option A: Full Automation (Weekly)

```yaml
# .github/workflows/full-automation.yml
# Runs every Monday:
# 1. Deploy latest code
# 2. Run validation
# 3. Download results
# 4. Send emails (optional)
```

**Setup:**
1. Enable GitHub Actions (Level 2)
2. Enable Scheduled Validation (Level 3)
3. Configure Gmail (Level 4)
4. Add email sending step to scheduled workflow

### Option B: Semi-Automated (Review Before Send)

```bash
# Monday 9 AM: GitHub Actions runs validation automatically
# Monday 10 AM: Download results from Artifacts
# Monday 11 AM: Review emails manually
# Monday 12 PM: Send via Gmail manually (or run script)
```

**Best for:** Quality control before sending

### Option C: One-Command Everything

```bash
# Run complete workflow locally
./scripts/automate-validation.sh

# Review results
cat validation-results/SUMMARY.md

# Send emails
node scripts/send-validation-emails.js
```

**Best for:** Ad-hoc validation runs

---

## 📊 Automation Comparison

| Feature | Manual | Level 1 | Level 2 | Level 3 | Level 4 |
|---------|--------|---------|---------|---------|---------|
| **Deploy** | Manual | Auto | Auto | Auto | Auto |
| **Validate** | Manual | Auto | Auto | Auto | Auto |
| **Download** | Manual | Auto | Auto | Auto | Auto |
| **Customize** | Manual | Auto | Manual | Manual | Auto |
| **Send** | Manual | Manual | Manual | Manual | Auto |
| **Schedule** | No | No | No | Yes | Yes |
| **Setup Time** | 0 min | 2 min | 5 min | 5 min | 20 min |
| **Run Time** | 15 min | 8 min | 8 min | 8 min | 10 min |
| **Best For** | Testing | Quick runs | CI/CD | Monitoring | Scale |

---

## 🛠️ Troubleshooting

### Issue: "Railway CLI not found"

```bash
# Install globally
npm i -g @railway/cli

# Verify
railway --version
```

### Issue: "Not linked to Railway project"

```bash
# Login first
railway login

# Link to project
railway link
# Choose your project from list
```

### Issue: "Gmail authentication failed"

```bash
# Check app password (not regular password)
echo $GMAIL_APP_PASSWORD

# Verify 2FA enabled
# Visit: https://myaccount.google.com/security

# Regenerate app password if needed
# Visit: https://myaccount.google.com/apppasswords
```

### Issue: "Emails going to spam"

**Solutions:**
1. Warm up your email (send to yourself first)
2. Use email warm-up service (Mailreach, Warmbox)
3. Reduce send volume (2-5 per day max initially)
4. Increase delays (5 minutes between emails)
5. Personalize more (don't send identical content)
6. Use professional email domain (not @gmail)

### Issue: "GitHub Actions workflow not running"

```bash
# Check if Actions enabled
# GitHub → Settings → Actions → Allow all actions

# Check secrets are set
# GitHub → Settings → Secrets → Check RAILWAY_TOKEN exists

# Manually trigger
# GitHub → Actions → Scheduled Validation → Run workflow
```

---

## 💡 Recommended Setup

**For Market Validation (First Time):**
1. Use **Level 1** (one-command script)
2. Review emails manually
3. Send manually via Gmail
4. Track replies

**After Validation Succeeds:**
1. Enable **Level 2** (GitHub Actions CI/CD)
2. Enable **Level 3** (scheduled weekly scans)
3. Optionally use **Level 4** (email automation) if sending at scale

**For Ongoing Operations:**
1. Scheduled validation every Monday
2. Auto-download results to GitHub Artifacts
3. Review + customize emails
4. Send semi-automatically (with oversight)

---

## 📋 Setup Checklist

### Level 1: One-Command ✅
- [ ] Make script executable: `chmod +x scripts/automate-validation.sh`
- [ ] Set environment variables (YOUR_NAME, YOUR_WEBSITE, YOUR_CALENDLY)
- [ ] Test with `--demo` flag first
- [ ] Run full workflow: `./scripts/automate-validation.sh`

### Level 2: GitHub Actions ✅
- [ ] Get Railway token
- [ ] Get Railway project ID
- [ ] Add RAILWAY_TOKEN to GitHub secrets
- [ ] Add RAILWAY_PROJECT_ID to GitHub secrets
- [ ] Enable GitHub Actions
- [ ] Push code to trigger deployment

### Level 3: Scheduled Validation ✅
- [ ] Customize schedule in `.github/workflows/scheduled-validation.yml`
- [ ] Commit and push changes
- [ ] Verify workflow appears in Actions tab
- [ ] Test manual trigger

### Level 4: Email Automation ✅
- [ ] Enable 2FA on Gmail
- [ ] Create Gmail app password
- [ ] Set GMAIL_USER environment variable
- [ ] Set GMAIL_APP_PASSWORD environment variable
- [ ] Install nodemailer: `npm install nodemailer`
- [ ] Configure prospect emails in script
- [ ] Test with --dry-run flag
- [ ] Send test email to yourself
- [ ] Warm up email account (3-5 days)
- [ ] Send to real prospects

---

## 🎯 Quick Start Commands

```bash
# Level 1: One-command automation
chmod +x scripts/automate-validation.sh
./scripts/automate-validation.sh

# Level 2: Already set up (push triggers deploy)
git push

# Level 3: Already set up (runs Mondays 9 AM)
# Or trigger manually: GitHub → Actions → Run workflow

# Level 4: Email automation
npm install nodemailer
export GMAIL_USER="your@email.com"
export GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
node scripts/send-validation-emails.js --dry-run  # Test
node scripts/send-validation-emails.js            # Send
```

---

## 🚀 Next Steps

**Choose your automation level:**
- **Just testing?** → Use Level 1
- **Building product?** → Enable Level 2 + 3
- **Scaling outreach?** → Add Level 4

**Start simple, add automation as you validate demand.**

All scripts are ready to use - just follow the setup steps above!
