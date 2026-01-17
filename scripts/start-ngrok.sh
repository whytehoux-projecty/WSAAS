#!/bin/bash

# AURUM VAULT - Start ngrok Tunnels
# This script starts all required ngrok tunnels for the hybrid deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  AURUM VAULT - ngrok Tunnel Startup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}Error: ngrok is not installed${NC}"
    echo "Please install ngrok from: https://ngrok.com/download"
    echo "Or use: brew install ngrok (macOS)"
    exit 1
fi

# Check if ngrok config exists
NGROK_CONFIG="$PROJECT_ROOT/ngrok.yml"
if [ ! -f "$NGROK_CONFIG" ]; then
    echo -e "${RED}Error: ngrok.yml not found${NC}"
    echo "Please create ngrok.yml in the project root"
    exit 1
fi

# Check if auth token is set
if grep -q "YOUR_NGROK_AUTH_TOKEN_HERE" "$NGROK_CONFIG"; then
    echo -e "${RED}Error: ngrok auth token not set${NC}"
    echo "Please update ngrok.yml with your auth token from:"
    echo "https://dashboard.ngrok.com/get-started/your-authtoken"
    exit 1
fi

# Check if Docker services are running
echo -e "${YELLOW}Checking if Docker services are running...${NC}"
if ! docker ps | grep -q "aurumvault-api"; then
    echo -e "${RED}Warning: Backend API container not running${NC}"
    echo "Start Docker services first: docker-compose up -d"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Kill any existing ngrok processes
echo -e "${YELLOW}Stopping any existing ngrok processes...${NC}"
pkill ngrok || true
sleep 2

# Start ngrok with all tunnels
echo -e "${GREEN}Starting ngrok tunnels...${NC}"
echo ""

# Start ngrok in background
ngrok start --all --config "$NGROK_CONFIG" > /dev/null 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
echo -e "${YELLOW}Waiting for ngrok to initialize...${NC}"
sleep 5

# Check if ngrok is running
if ! ps -p $NGROK_PID > /dev/null; then
    echo -e "${RED}Error: ngrok failed to start${NC}"
    echo "Check ngrok.yml configuration"
    exit 1
fi

# Get tunnel URLs from ngrok API
echo -e "${GREEN}Fetching tunnel URLs...${NC}"
echo ""

TUNNELS_JSON=$(curl -s http://localhost:4040/api/tunnels)

# Extract URLs
BACKEND_URL=$(echo "$TUNNELS_JSON" | grep -o '"public_url":"https://[^"]*"' | grep "backend" | head -1 | cut -d'"' -f4)
ADMIN_URL=$(echo "$TUNNELS_JSON" | grep -o '"public_url":"https://[^"]*"' | grep "admin" | head -1 | cut -d'"' -f4)
PORTAL_URL=$(echo "$TUNNELS_JSON" | grep -o '"public_url":"https://[^"]*"' | grep "portal" | head -1 | cut -d'"' -f4)

# If specific tunnel names not found, try generic extraction
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL=$(echo "$TUNNELS_JSON" | grep -o '"public_url":"https://[^"]*"' | sed -n '1p' | cut -d'"' -f4)
fi
if [ -z "$ADMIN_URL" ]; then
    ADMIN_URL=$(echo "$TUNNELS_JSON" | grep -o '"public_url":"https://[^"]*"' | sed -n '2p' | cut -d'"' -f4)
fi
if [ -z "$PORTAL_URL" ]; then
    PORTAL_URL=$(echo "$TUNNELS_JSON" | grep -o '"public_url":"https://[^"]*"' | sed -n '3p' | cut -d'"' -f4)
fi

# Display tunnel URLs
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ ngrok Tunnels Started Successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Backend API:${NC}      $BACKEND_URL"
echo -e "${GREEN}Admin Interface:${NC}  $ADMIN_URL"
echo -e "${GREEN}E-Banking Portal:${NC} $PORTAL_URL"
echo ""
echo -e "${BLUE}Web Interface:${NC}    http://localhost:4040"
echo -e "${BLUE}ngrok PID:${NC}        $NGROK_PID"
echo ""

# Save URLs to file for other scripts
URLS_FILE="$PROJECT_ROOT/.ngrok-urls"
cat > "$URLS_FILE" << EOF
# ngrok Tunnel URLs - Auto-generated
# Last updated: $(date)
NGROK_BACKEND_URL=$BACKEND_URL
NGROK_ADMIN_URL=$ADMIN_URL
NGROK_PORTAL_URL=$PORTAL_URL
EOF

echo -e "${GREEN}✓ URLs saved to .ngrok-urls${NC}"
echo ""

# Offer to update .env file
echo -e "${YELLOW}Update .env file with these URLs?${NC}"
read -p "(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "$PROJECT_ROOT/.env" ]; then
        # Backup existing .env
        cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.backup"
        
        # Update or add ngrok URLs
        sed -i.bak "s|NGROK_BACKEND_URL=.*|NGROK_BACKEND_URL=$BACKEND_URL|" "$PROJECT_ROOT/.env"
        sed -i.bak "s|NGROK_ADMIN_URL=.*|NGROK_ADMIN_URL=$ADMIN_URL|" "$PROJECT_ROOT/.env"
        sed -i.bak "s|NGROK_PORTAL_URL=.*|NGROK_PORTAL_URL=$PORTAL_URL|" "$PROJECT_ROOT/.env"
        
        rm "$PROJECT_ROOT/.env.bak"
        echo -e "${GREEN}✓ .env file updated${NC}"
    else
        echo -e "${RED}Error: .env file not found${NC}"
        echo "Create .env from .env.example first"
    fi
fi

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "1. Restart Docker services to apply new URLs:"
echo "   docker-compose restart"
echo ""
echo "2. Update Netlify environment variables:"
echo "   NEXT_PUBLIC_API_URL=$BACKEND_URL"
echo "   NEXT_PUBLIC_PORTAL_URL=$PORTAL_URL"
echo ""
echo "3. View tunnel traffic: http://localhost:4040"
echo ""
echo "4. Stop tunnels: ./scripts/stop-ngrok.sh"
echo ""
echo -e "${GREEN}ngrok is running in the background (PID: $NGROK_PID)${NC}"
echo ""
