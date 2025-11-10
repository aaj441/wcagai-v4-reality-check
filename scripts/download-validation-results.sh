#!/bin/bash
# Download Validation Results from Railway
# Usage: ./scripts/download-validation-results.sh

set -e

echo "🚀 Downloading Validation Results from Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "Install with: npm i -g @railway/cli"
    exit 1
fi

# Create local output directory
mkdir -p validation-results/{emails,screenshots,reports}

echo "📧 Downloading emails..."
railway run cat output/emails/HealthTech_Solutions.txt > validation-results/emails/HealthTech_Solutions.txt 2>/dev/null || echo "  ⚠️  HealthTech email not found"
railway run cat output/emails/FinancePro_Digital.txt > validation-results/emails/FinancePro_Digital.txt 2>/dev/null || echo "  ⚠️  FinancePro email not found"
railway run cat output/emails/EduLearn_Platform.txt > validation-results/emails/EduLearn_Platform.txt 2>/dev/null || echo "  ⚠️  EduLearn email not found"
railway run cat output/emails/GameHub_Network.txt > validation-results/emails/GameHub_Network.txt 2>/dev/null || echo "  ⚠️  GameHub email not found"
railway run cat output/emails/ShopEasy_Commerce.txt > validation-results/emails/ShopEasy_Commerce.txt 2>/dev/null || echo "  ⚠️  ShopEasy email not found"

echo "📊 Downloading reports..."
railway run sh -c 'cat output/reports/*.json' > validation-results/reports/full-report.json 2>/dev/null || echo "  ⚠️  Reports not found"

echo "📸 Downloading screenshots..."
railway run sh -c 'ls output/screenshots/' > validation-results/screenshot-list.txt 2>/dev/null || echo "  ⚠️  Screenshots not found"

echo ""
echo "✅ Download complete!"
echo ""
echo "📁 Results saved to: validation-results/"
echo ""
echo "View emails:"
echo "  cat validation-results/emails/HealthTech_Solutions.txt"
echo ""
echo "View full report:"
echo "  cat validation-results/reports/full-report.json | python3 -m json.tool"
echo ""
echo "Count downloaded files:"
echo "  find validation-results -type f | wc -l"
