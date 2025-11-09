#!/bin/bash

#######################################
# WCAGAI v4.0 - Deployment Test Script
# Tests deployed application endpoints
#######################################

if [ -z "$1" ]; then
    echo "Usage: ./scripts/test-deployment.sh <deployment-url>"
    echo "Example: ./scripts/test-deployment.sh https://wcagai-v4.up.railway.app"
    exit 1
fi

BASE_URL=$1
echo "Testing WCAGAI v4.0 Deployment at: $BASE_URL"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4

    echo -n "Testing $name... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
        ((PASSED++))
        echo "  Response: $(echo "$body" | head -c 100)..."
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $status_code)"
        ((FAILED++))
        echo "  Error: $(echo "$body" | head -c 200)"
    fi
    echo ""
}

echo "1. Core Endpoints"
echo "-----------------"
test_endpoint "Root Endpoint" "GET" "/"
test_endpoint "Health Check" "GET" "/health"
echo ""

echo "2. Discovery API"
echo "----------------"
test_endpoint "List Verticals" "GET" "/api/discovery/verticals"
test_endpoint "Discover Healthcare Sites" "GET" "/api/discovery?vertical=healthcare&maxResults=5"
test_endpoint "Discover Fintech Sites" "GET" "/api/discovery?vertical=fintech&maxResults=3"
echo ""

echo "3. Scan API"
echo "-----------"
test_endpoint "Scanner Status" "GET" "/api/scan/status"
# Note: Actual scanning disabled in test to avoid timeout
# test_endpoint "Scan Single URL" "POST" "/api/scan" '{"url":"https://example.com"}'
echo "  (Skipping actual scan tests to avoid timeout)"
echo ""

echo "4. Documentation"
echo "----------------"
test_endpoint "API Documentation" "GET" "/api/docs"
echo ""

echo "5. Dashboard"
echo "------------"
echo -n "Testing Dashboard HTML... "
dashboard_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/")
dashboard_status=$(echo "$dashboard_response" | tail -n 1)
dashboard_body=$(echo "$dashboard_response" | sed '$d')

if [ "$dashboard_status" -eq 200 ] && echo "$dashboard_body" | grep -q "WCAGAI"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi
echo ""

echo "================================================"
echo "Test Summary"
echo "================================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Deployment is healthy.${NC}"
    echo ""
    echo "Your accessibility scanner is ready to use!"
    echo "Dashboard: $BASE_URL"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed. Check the logs.${NC}"
    echo ""
    echo "Run 'railway logs' to see application logs"
    exit 1
fi
