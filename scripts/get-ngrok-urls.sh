#!/bin/bash

# AURUM VAULT - Get Current ngrok Tunnel URLs
# This script fetches and displays current ngrok tunnel URLs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  AURUM VAULT - ngrok Tunnel URLs${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo -e "${RED}Error: ngrok is not running${NC}"
    echo "Start ngrok first: ./scripts/start-ngrok.sh"
    exit 1
fi

# Check if ngrok API is accessible
if ! curl -s http://localhost:4040/api/tunnels > /dev/null; then
    echo -e "${RED}Error: Cannot connect to ngrok API${NC}"
    echo "ngrok may still be starting up..."
    exit 1
fi

# Get tunnel URLs from ngrok API
TUNNELS_JSON=$(curl -s http://localhost:4040/api/tunnels)

# Extract URLs
BACKEND_URL=$(echo "$TUNNELS_JSON" | grep -o '"public_url":"https://[^"]*"' | sed -n '1p' | cut -d'"' -f4)
ADMIN_URL=$(echo "$TUNNELS_JSON" | grep -o '"public_url":"https://[^"]*"' | sed -n '2p' | cut -d'"' -f4)
PORTAL_URL=$(echo "$TUNNELS_JSON" | grep -o '"public_url":"https://[^"]*"' | sed -n '3p' | cut -d'"' -f4)

# Display tunnel URLs
echo -e "${GREEN}Current Tunnel URLs:${NC}"
echo ""
echo -e "${BLUE}Backend API:${NC}      $BACKEND_URL"
echo -e "${BLUE}Admin Interface:${NC}  $ADMIN_URL"
echo -e "${BLUE}E-Banking Portal:${NC} $PORTAL_URL"
echo ""
echo -e "${BLUE}Web Interface:${NC}    http://localhost:4040"
echo ""

# Display as environment variables
echo -e "${YELLOW}Environment Variables:${NC}"
echo ""
echo "export NGROK_BACKEND_URL=\"$BACKEND_URL\""
echo "export NGROK_ADMIN_URL=\"$ADMIN_URL\""
echo "export NGROK_PORTAL_URL=\"$PORTAL_URL\""
echo ""

# Display for Netlify
echo -e "${YELLOW}Netlify Environment Variables:${NC}"
echo ""
echo "NEXT_PUBLIC_API_URL=$BACKEND_URL"
echo "NEXT_PUBLIC_PORTAL_URL=$PORTAL_URL"
echo "NEXT_PUBLIC_PORTAL_HEALTH_URL=$BACKEND_URL/api/portal/health"
echo ""
