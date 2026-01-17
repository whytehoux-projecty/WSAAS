#!/bin/bash

# AURUM VAULT - Stop ngrok Tunnels
# This script stops all running ngrok processes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  AURUM VAULT - Stop ngrok Tunnels${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo -e "${YELLOW}No ngrok processes found${NC}"
    exit 0
fi

# Get ngrok PIDs
NGROK_PIDS=$(pgrep -x "ngrok")

echo -e "${YELLOW}Stopping ngrok processes...${NC}"
echo "PIDs: $NGROK_PIDS"
echo ""

# Kill ngrok processes
pkill ngrok

# Wait for processes to stop
sleep 2

# Verify stopped
if pgrep -x "ngrok" > /dev/null; then
    echo -e "${RED}Warning: Some ngrok processes still running${NC}"
    echo "Forcing termination..."
    pkill -9 ngrok
    sleep 1
fi

echo -e "${GREEN}✓ All ngrok tunnels stopped${NC}"
echo ""

# Clean up URLs file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
URLS_FILE="$PROJECT_ROOT/.ngrok-urls"

if [ -f "$URLS_FILE" ]; then
    echo -e "${YELLOW}Removing saved tunnel URLs...${NC}"
    rm "$URLS_FILE"
    echo -e "${GREEN}✓ Cleanup complete${NC}"
fi

echo ""
echo -e "${BLUE}ngrok tunnels stopped successfully${NC}"
echo ""
