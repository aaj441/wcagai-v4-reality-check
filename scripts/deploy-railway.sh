#!/bin/bash

#######################################
# WCAGAI v4.0 - Railway Deployment Script
# Automated deployment to Railway
#######################################

set -e

echo "🚀 WCAGAI v4.0 Railway Deployment"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo ""
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
    echo -e "${GREEN}✓ Railway CLI installed${NC}"
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}Please log in to Railway:${NC}"
    railway login
fi

echo ""
echo "Current Railway user:"
railway whoami
echo ""

# Initialize project if needed
if [ ! -f ".railway.json" ]; then
    echo -e "${YELLOW}Initializing Railway project...${NC}"
    railway init
    echo -e "${GREEN}✓ Project initialized${NC}"
fi

# Check if Redis plugin exists
echo ""
echo "Checking for Redis plugin..."
if ! railway variables | grep -q "REDIS_URL"; then
    echo -e "${YELLOW}Redis not found. Adding Redis plugin...${NC}"
    railway add --plugin redis
    echo -e "${GREEN}✓ Redis plugin added${NC}"
else
    echo -e "${GREEN}✓ Redis already configured${NC}"
fi

# Set production environment variables
echo ""
echo "Setting environment variables..."
railway variables set NODE_ENV=production
echo -e "${GREEN}✓ Environment variables set${NC}"

# Optional: Set SerpAPI key
echo ""
read -p "Do you have a SerpAPI key? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your SerpAPI key: " SERPAPI_KEY
    railway variables set SERPAPI_KEY="$SERPAPI_KEY"
    echo -e "${GREEN}✓ SerpAPI key configured${NC}"
fi

# Deploy to Railway
echo ""
echo "Deploying to Railway..."
railway up

echo ""
echo -e "${GREEN}✓ Deployment initiated${NC}"
echo ""
echo "Waiting for deployment to complete..."
sleep 10

# Generate domain if needed
echo ""
echo "Setting up public URL..."
railway domain

# Get deployment URL
echo ""
echo "Getting deployment information..."
RAILWAY_URL=$(railway domain 2>&1 | grep -oP 'https://[^\s]+' || echo "")

if [ -n "$RAILWAY_URL" ]; then
    echo ""
    echo "================================="
    echo -e "${GREEN}✓ Deployment Successful!${NC}"
    echo "================================="
    echo ""
    echo "Your app is deployed at:"
    echo -e "${GREEN}$RAILWAY_URL${NC}"
    echo ""
    echo "Testing deployment..."
    echo ""

    # Test health endpoint
    if curl -s -f "$RAILWAY_URL/health" > /dev/null; then
        echo -e "${GREEN}✓ Health check passed${NC}"
    else
        echo -e "${YELLOW}⚠ Health check pending (app may still be starting)${NC}"
    fi

    echo ""
    echo "Next steps:"
    echo "1. Visit $RAILWAY_URL to see the dashboard"
    echo "2. Test API: curl $RAILWAY_URL/api/discovery/verticals"
    echo "3. View logs: railway logs"
    echo "4. Monitor: railway status"
else
    echo -e "${YELLOW}⚠ Couldn't retrieve URL automatically${NC}"
    echo "Run 'railway domain' to get your deployment URL"
fi

echo ""
echo "Useful commands:"
echo "  railway logs        - View application logs"
echo "  railway status      - Check deployment status"
echo "  railway open        - Open dashboard in browser"
echo "  railway variables   - View environment variables"
echo ""
echo -e "${GREEN}Deployment complete! 🎉${NC}"
