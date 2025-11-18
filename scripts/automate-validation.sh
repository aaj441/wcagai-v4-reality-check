#!/bin/bash
# Complete Validation Automation Script
# Runs: Deploy → Validate → Download → Customize → Ready to Send
#
# Usage:
#   ./scripts/automate-validation.sh
#
# Options:
#   --skip-deploy    Skip Railway deployment
#   --demo           Use demo mode (no Chrome)
#   --send-emails    Automatically send emails via Gmail (requires config)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
YOUR_NAME="${YOUR_NAME:-[Your Name]}"
YOUR_WEBSITE="${YOUR_WEBSITE:-[Your Website]}"
YOUR_CALENDLY="${YOUR_CALENDLY:-[Your Calendly Link]}"

# Parse arguments
SKIP_DEPLOY=false
DEMO_MODE=false
SEND_EMAILS=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-deploy)
      SKIP_DEPLOY=true
      shift
      ;;
    --demo)
      DEMO_MODE=true
      shift
      ;;
    --send-emails)
      SEND_EMAILS=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🚀 WCAG AI Validation Automation${NC}"
echo "=================================="
echo ""

# Step 1: Check Railway CLI
echo -e "${YELLOW}Step 1/7: Checking Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Installing Railway CLI..."
    npm i -g @railway/cli
    echo -e "${GREEN}✅ Railway CLI installed${NC}"
else
    echo -e "${GREEN}✅ Railway CLI found${NC}"
fi
echo ""

# Step 2: Deploy to Railway (optional)
if [ "$SKIP_DEPLOY" = false ]; then
    echo -e "${YELLOW}Step 2/7: Deploying to Railway...${NC}"

    # Check if already linked
    if ! railway status &> /dev/null; then
        echo "Not linked to Railway project. Please run:"
        echo "  railway login"
        echo "  railway link"
        exit 1
    fi

    railway up --detach
    echo -e "${GREEN}✅ Deployment started${NC}"

    echo "Waiting 120 seconds for deployment..."
    sleep 120

    # Verify deployment
    DOMAIN=$(railway domain 2>/dev/null || echo "")
    if [ -n "$DOMAIN" ]; then
        echo "Testing health check at https://$DOMAIN/health"
        if curl -sf "https://$DOMAIN/health" > /dev/null; then
            echo -e "${GREEN}✅ Deployment verified${NC}"
        else
            echo -e "${YELLOW}⚠️  Health check failed but continuing...${NC}"
        fi
    fi
else
    echo -e "${YELLOW}Step 2/7: Skipping deployment${NC}"
fi
echo ""

# Step 3: Run validation
echo -e "${YELLOW}Step 3/7: Running validation script...${NC}"
if [ "$DEMO_MODE" = true ]; then
    echo "Running in DEMO mode (no Chrome required)"
    DEMO_MODE=true node scripts/manual-validation.js
else
    echo "Running validation on Railway (with real Chrome)"
    railway run node scripts/manual-validation.js
fi
echo -e "${GREEN}✅ Validation complete${NC}"
echo ""

# Step 4: Download results
echo -e "${YELLOW}Step 4/7: Downloading results...${NC}"
mkdir -p validation-results/{emails,screenshots,reports}

if [ "$DEMO_MODE" = true ]; then
    # Copy local results
    cp -r output/emails/* validation-results/emails/ 2>/dev/null || true
    cp -r output/reports/* validation-results/reports/ 2>/dev/null || true
else
    # Download from Railway
    railway run cat output/emails/HealthTech_Solutions.txt > validation-results/emails/HealthTech_Solutions.txt 2>/dev/null || true
    railway run cat output/emails/FinancePro_Digital.txt > validation-results/emails/FinancePro_Digital.txt 2>/dev/null || true
    railway run cat output/emails/EduLearn_Platform.txt > validation-results/emails/EduLearn_Platform.txt 2>/dev/null || true
    railway run cat output/emails/GameHub_Network.txt > validation-results/emails/GameHub_Network.txt 2>/dev/null || true
    railway run cat output/emails/ShopEasy_Commerce.txt > validation-results/emails/ShopEasy_Commerce.txt 2>/dev/null || true
    railway run sh -c 'cat output/reports/*.json' > validation-results/reports/full-report.json 2>/dev/null || true
fi

EMAIL_COUNT=$(ls validation-results/emails/*.txt 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Downloaded $EMAIL_COUNT emails${NC}"
echo ""

# Step 5: Customize emails
echo -e "${YELLOW}Step 5/7: Customizing emails...${NC}"
if [ "$YOUR_NAME" != "[Your Name]" ]; then
    echo "Replacing [Your Name] with $YOUR_NAME"
    find validation-results/emails -name "*.txt" -exec sed -i.bak "s/\[Your Name\]/$YOUR_NAME/g" {} \;
fi

if [ "$YOUR_WEBSITE" != "[Your Website]" ]; then
    echo "Replacing [Your Website] with $YOUR_WEBSITE"
    find validation-results/emails -name "*.txt" -exec sed -i.bak "s|\[Your Website\]|$YOUR_WEBSITE|g" {} \;
fi

if [ "$YOUR_CALENDLY" != "[Your Calendly Link]" ]; then
    echo "Replacing [Your Calendly Link] with $YOUR_CALENDLY"
    find validation-results/emails -name "*.txt" -exec sed -i.bak "s|\[Your Calendly Link\]|$YOUR_CALENDLY|g" {} \;
fi

# Remove backup files
find validation-results/emails -name "*.bak" -delete 2>/dev/null || true

echo -e "${GREEN}✅ Emails customized${NC}"
echo ""

# Step 6: Generate summary
echo -e "${YELLOW}Step 6/7: Generating summary...${NC}"

cat > validation-results/SUMMARY.md << EOF
# Validation Results Summary

**Date:** $(date)
**Mode:** $([ "$DEMO_MODE" = true ] && echo "Demo" || echo "Real Chrome")
**Emails Generated:** $EMAIL_COUNT

## Generated Emails

EOF

for email in validation-results/emails/*.txt; do
    if [ -f "$email" ]; then
        FILENAME=$(basename "$email" .txt)
        echo "- **$FILENAME**" >> validation-results/SUMMARY.md
    fi
done

cat >> validation-results/SUMMARY.md << 'EOF'

## Next Steps

1. Review emails in `emails/` folder
2. Customize any additional details
3. Send via Gmail, HubSpot, or your CRM
4. Track replies in a spreadsheet

## Expected Results

- **2+ replies (40%+):** Strong product-market fit → BUILD PLATFORM
- **1 reply (20%):** Moderate interest → Iterate messaging
- **0 replies (0%):** Weak fit → Pivot vertical or value prop

## Tracking Template

| Company | Sent | Reply? | Interest | Next Steps |
|---------|------|--------|----------|------------|
| HealthTech Solutions | [Date] | [ ] | - | - |
| FinancePro Digital | [Date] | [ ] | - | - |
| EduLearn Platform | [Date] | [ ] | - | - |
| GameHub Network | [Date] | [ ] | - | - |
| ShopEasy Commerce | [Date] | [ ] | - | - |
EOF

echo -e "${GREEN}✅ Summary generated${NC}"
echo ""

# Step 7: Send emails (optional)
if [ "$SEND_EMAILS" = true ]; then
    echo -e "${YELLOW}Step 7/7: Sending emails...${NC}"
    echo -e "${RED}⚠️  Automated email sending requires additional configuration${NC}"
    echo "See: scripts/send-validation-emails.js"
    echo "For now, send manually via Gmail"
else
    echo -e "${YELLOW}Step 7/7: Email sending (skipped)${NC}"
    echo "To send emails, run with: --send-emails"
fi
echo ""

# Final summary
echo "=================================="
echo -e "${GREEN}✅ AUTOMATION COMPLETE!${NC}"
echo "=================================="
echo ""
echo "📁 Results location: validation-results/"
echo ""
echo "📧 Generated emails:"
ls validation-results/emails/*.txt 2>/dev/null | while read email; do
    echo "   - $(basename "$email")"
done
echo ""
echo "📊 View summary:"
echo "   cat validation-results/SUMMARY.md"
echo ""
echo "📝 Next action:"
echo "   Review emails and send to prospects!"
echo ""
echo "🎯 Success metric:"
echo "   2+ replies within 7 days = Strong product-market fit"
echo ""
