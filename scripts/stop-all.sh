#!/bin/bash

# AURUM VAULT - Stop All Services
# This script stops ngrok tunnels and Docker services

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
echo -e "${BLUE}  AURUM VAULT - Stop All Services${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Stop ngrok tunnels
echo -e "${YELLOW}Step 1: Stopping ngrok tunnels...${NC}"
"$SCRIPT_DIR/stop-ngrok.sh"

echo ""

# Step 2: Stop Docker services
echo -e "${YELLOW}Step 2: Stopping Docker services...${NC}"
cd "$PROJECT_ROOT"
docker-compose down

echo ""
echo -e "${GREEN}✓ All services stopped${NC}"
echo ""

echo -e "${YELLOW}To remove volumes (database data):${NC}"
echo "  docker-compose down -v"
echo ""
