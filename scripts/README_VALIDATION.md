# Manual Validation Script - Quick Start Guide

## Purpose

This script validates market demand for the WCAG AI Compliance Platform by:

1. **Scanning** 5 real prospect websites for accessibility violations
2. **Identifying** critical WCAG 2.2 compliance gaps
3. **Drafting** personalized outreach emails with specific findings
4. **Generating** compliance scores and ROI estimates

**Goal:** Get 2+ positive replies within 7 days → strong product-market fit signal

---

## Prerequisites

### 1. Environment Setup

```bash
# Navigate to project root
cd /home/user/wcagai-v4-reality-check

# Install dependencies (if not already installed)
npm install

# Verify Puppeteer and axe-core are installed
npm list puppeteer axe-core
```

### 2. Optional: OpenAI API Key

The current script generates emails using templates. To enable AI-powered email drafting:

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

Get your key from: https://platform.openai.com/api-keys

---

## Running the Script

### Quick Start (3 commands)

```bash
# 1. Create output directory
mkdir -p output

# 2. Run validation
node scripts/manual-validation.js

# 3. Review results
ls -la output/emails/
```

### Expected Output

```
🚀 WCAG AI Platform - Manual Validation Script

============================================================
Scanning 5 prospect websites to validate market demand...

[1/5] Processing: HealthTech Solutions
------------------------------------------------------------
  → Launching browser...
  → Loading https://www.webmd.com...
  → Running accessibility audit...
  ✓ Scan complete: 12 critical violations
  ✓ Compliance score: 68/100
  → Drafting outreach email...
  ✓ Email saved: output/emails/HealthTech_Solutions.txt

[2/5] Processing: FinancePro Digital
...

============================================================
✅ VALIDATION COMPLETE!

📊 Summary:
  • Prospects scanned: 5/5
  • Total violations found: 47
  • Average compliance: 64/100
  • High-risk prospects: 3
  • Estimated TAM: $75,000/year

📧 Generated Emails:
  1. HealthTech Solutions → output/emails/HealthTech_Solutions.txt
  2. FinancePro Digital → output/emails/FinancePro_Digital.txt
  ...

💾 Full report saved: output/reports/validation-1731283445821.json

📋 NEXT STEPS:
  1. Review emails in output/emails/ folder
  2. Customize the top 3 emails for your prospects
  3. Send via HubSpot, Gmail, or your CRM
  4. Track replies for 7 days
  5. If ≥2 positive replies → Build full platform

💡 Success Metric: 40%+ reply rate = strong product-market fit
```

---

## Output Files

### Directory Structure

```
output/
├── emails/
│   ├── HealthTech_Solutions.txt
│   ├── FinancePro_Digital.txt
│   ├── EduLearn_Platform.txt
│   ├── GameHub_Network.txt
│   └── ShopEasy_Commerce.txt
├── screenshots/
│   ├── https___www_webmd_com.png
│   ├── https___www_chase_com.png
│   └── ...
└── reports/
    └── validation-1731283445821.json
```

### Email Format

Each email file contains:

```
Subject: [Compliance Alert] Company Name - WCAG Accessibility Gap Identified

Body:
Hi [Company] Team,

I ran a quick accessibility audit on [website] and found [N] critical
WCAG 2.2 violations that could expose you to ADA lawsuits.

Your current compliance score: [score]/100 ([risk] legal risk)

Top issues blocking [vertical] users:
- [Violation 1]
- [Violation 2]
- [Violation 3]

[ROI calculation and value proposition...]

Would you be open to a 15-minute audit review call this week?

[CTA and booking link]
```

### JSON Report

The full report includes:

```json
{
  "summary": {
    "totalProspects": 5,
    "successfulScans": 5,
    "totalViolations": 47,
    "avgCompliance": 64,
    "highRiskProspects": 3,
    "estimatedTAM": "$75,000/year"
  },
  "results": [
    {
      "prospect": {
        "name": "HealthTech Solutions",
        "website": "https://www.webmd.com",
        "vertical": "healthcare"
      },
      "scanResults": {
        "totalViolations": 18,
        "criticalViolations": [...],
        "complianceScore": 68,
        "screenshotPath": "output/screenshots/..."
      },
      "email": {
        "subject": "...",
        "body": "..."
      }
    }
  ]
}
```

---

## Customizing Prospects

Edit `scripts/manual-validation.js` line 20-48:

```javascript
const PROSPECTS = [
  {
    name: 'Your Target Company',          // Company name
    website: 'https://example.com',       // Website to scan
    email: 'cto@example.com',             // Decision-maker email
    vertical: 'healthcare'                // Industry vertical
  },
  // Add your real prospects here...
];
```

**Pro Tip:** Start with companies you already have relationships with for higher reply rates.

---

## Sending Emails

### Option 1: Gmail (Manual)

1. Open each `.txt` file in `output/emails/`
2. Copy subject + body
3. Paste into Gmail compose
4. Attach screenshot from `output/screenshots/`
5. Personalize the intro line
6. Send!

### Option 2: HubSpot (Batch)

```bash
# Upload CSV to HubSpot Sequences
# Include fields: email, subject, body, attachment_url
```

### Option 3: Script (Automated)

```javascript
// Add to manual-validation.js:
const nodemailer = require('nodemailer');

async function sendEmail(prospect, email, screenshotPath) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: 'your@email.com',
    to: prospect.email,
    subject: email.subject,
    text: email.body,
    attachments: [{ path: screenshotPath }]
  });
}
```

---

## Tracking Results

Create a simple spreadsheet:

| Company | Email Sent | Reply? | Interest Level | Notes |
|---------|------------|--------|----------------|-------|
| HealthTech Solutions | Nov 10 | Yes | High | Wants demo |
| FinancePro Digital | Nov 10 | No | - | Follow up Nov 17 |
| EduLearn Platform | Nov 10 | Yes | Medium | Asked for pricing |

### Success Metrics

- **Strong PMF:** 40%+ reply rate (2/5)
- **Moderate PMF:** 20-40% reply rate (1/5)
- **Weak PMF:** <20% reply rate (0/5)

### Decision Matrix

| Replies | Interest Level | Next Action |
|---------|---------------|-------------|
| 2+ | High | Build full platform (Option A) |
| 1-2 | Medium | Build MVP with confidence scoring (Option B) |
| 0-1 | Low | Iterate messaging or pivot vertical |

---

## Troubleshooting

### Error: "Could not find Chrome"

**Fix:**

```bash
# Railway/Docker
# Add to nixpacks.toml
[phases.setup]
nixPkgs = ["nodejs", "chromium"]

# Or install locally
sudo apt-get install chromium-browser
```

### Error: "Navigation timeout"

**Fix:** Increase timeout in `manual-validation.js` line 71:

```javascript
await page.goto(url, {
  waitUntil: 'networkidle2',
  timeout: 60000  // Increase from 30000 to 60000
});
```

### Error: "Cannot find module 'axe-core'"

**Fix:**

```bash
npm install axe-core --save
```

### Error: "Screenshot directory not found"

**Fix:**

```bash
mkdir -p output/screenshots
```

---

## Advanced: AI-Powered Email Drafting

### 1. Install OpenAI SDK

```bash
npm install openai
```

### 2. Add to `manual-validation.js`

```javascript
const { Configuration, OpenAIApi } = require('openai');

async function draftEmailWithAI(prospect, scanResults) {
  const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  );

  const prompt = `
    You are a WCAG accessibility consultant. Draft a cold email to ${prospect.name}'s CTO.

    Found ${scanResults.criticalViolations.length} critical accessibility issues:
    ${scanResults.criticalViolations.slice(0, 3).map(v => `- ${v.help}`).join('\n')}

    Keep it:
    - 150 words max
    - Consultative, not salesy
    - Include one specific example
    - End with clear CTA (15-min audit review)
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300
  });

  return response.data.choices[0].message.content;
}
```

### 3. Replace Template Function

Change line 135 in `manual-validation.js`:

```javascript
// Old:
const email = generateEmailTemplate(prospect, {...});

// New:
const emailBody = await draftEmailWithAI(prospect, scanResults);
const email = { subject: `...`, body: emailBody };
```

---

## Cost Estimate

### Current Script (Free)

- Puppeteer: Free
- axe-core: Free
- Email templates: Free
- **Total: $0**

### With AI Enhancement

- OpenAI GPT-4: $0.03/email × 5 = **$0.15**
- Still essentially free for validation

### Full Platform (If You Build)

- Development: $0-$80K (depends on path)
- Monthly hosting: $50-$200 (Railway + Redis + PostgreSQL)
- OpenAI API: ~$100/month (for 100 scans)
- **Total first year: $1,800-$82,400**

---

## What This Validates

### ✅ If Successful (2+ replies)

**You've proven:**

1. **Problem exists:** Companies have accessibility gaps
2. **Pain is real:** They care enough to reply
3. **Solution resonates:** Your value prop is compelling
4. **Willingness to pay:** They're asking about pricing/demos

**Build confidence: HIGH**

### ⚠️ If Marginal (1 reply)

**You've learned:**

1. Problem exists but messaging needs work
2. Wrong vertical or wrong persona (CTO vs VP Eng)
3. Timing issue (budget cycles, priorities)

**Action: Iterate messaging, try 5 more prospects**

### ❌ If Failed (0 replies)

**Possible reasons:**

1. Problem not urgent enough
2. Value prop unclear
3. Wrong market segment
4. Email landed in spam

**Action: Pivot approach or vertical before building**

---

## Timeline

### Week 1: Validate

- **Day 1:** Run script, review emails (1 hour)
- **Day 2:** Customize + send emails (2 hours)
- **Day 3-7:** Track replies, follow up

### Week 2: Decide

- **2+ replies:** Start building platform (Option A)
- **1 reply:** Run second batch of validation
- **0 replies:** Analyze why, iterate

### Week 3+: Build (if validated)

- Follow sprint plan in copilot-instructions.md
- Start with confidence scoring MVP
- Ship first version in 4-6 weeks

---

## Success Stories (Examples)

### Company A (Healthcare)

- **Sent:** 5 emails to hospital systems
- **Replies:** 3 (60% rate)
- **Outcome:** 2 paid pilots at $5K each
- **Action:** Built platform, expanded to 20 customers

### Company B (E-commerce)

- **Sent:** 5 emails to Shopify stores
- **Replies:** 0 (0% rate)
- **Action:** Pivoted to agencies, 40% reply rate

### Company C (Education)

- **Sent:** 5 emails to universities
- **Replies:** 1 (20% rate)
- **Outcome:** One said "not now, ask in Q1"
- **Action:** Set calendar reminder, sent 5 more to colleges

---

## FAQ

**Q: Can I scan password-protected sites?**
A: Not with this script. You'd need to add authentication logic to Puppeteer.

**Q: Will I get IP banned for scanning?**
A: Unlikely for 5 sites. Add delays if concerned: `await page.waitForTimeout(5000)` between scans.

**Q: How accurate is axe-core?**
A: ~70-80% without confidence scoring. That's why we're building the AI enhancement.

**Q: Should I offer free audits?**
A: For validation, yes. Mention "complimentary audit" in email for higher reply rates.

**Q: What if they ask for full report?**
A: Send the JSON report + screenshot. Offer 15-min call to walk through it.

**Q: How do I handle legal questions?**
A: Disclaimer: "I'm not a lawyer. Recommend consulting ADA counsel for legal advice."

---

## Support

**Issues with script:**

- Check [Puppeteer Troubleshooting](https://pptr.dev/troubleshooting)
- Check [axe-core Issues](https://github.com/dequelabs/axe-core/issues)
- Review error logs in console

**Business questions:**

- Refer to `FINAL-BLUEPRINT-EXECUTION-GUIDE.md`
- Review market sizing in `GAMING_ACCESSIBILITY_REPORT.md`
- Check pricing models in `PRODUCTION_AUDIT_REPORT.md`

---

## Next Steps After Validation

### If Successful → Choose Your Build Path

**Option A: Full Build (8-12 weeks)**

- Follow `.github/copilot-instructions.md`
- Implement confidence scoring engine
- Build dashboard + PDF reports
- Integrate HubSpot + email drafting
- Launch beta with paying customers

**Option B: MVP (4-6 weeks)**

- Keep current v4.0 scanner as-is
- Add confidence scoring module only
- Manual PDF generation (no automation)
- Manual email drafting with templates
- Validate with 10 customers before expanding

**Option C: No-Code (2 weeks)**

- Use Zapier to connect v4.0 scanner API
- Google Sheets for manual review queue
- Loom videos instead of PDF reports
- Copy/paste email templates
- Prove $10K MRR before building custom platform

---

**You're ready to validate. Run the script now and get real market feedback within 7 days.**

```bash
node scripts/manual-validation.js
```

Good luck! 🚀
