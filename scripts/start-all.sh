#!/bin/bash

# AURUM VAULT - Start All Services
# This script starts Docker services and ngrok tunnels

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
echo -e "${BLUE}  AURUM VAULT - Start All Services${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Create .env from .env.example:"
    echo "  cp .env.example .env"
    echo "  # Edit .env with your configuration"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker Desktop"
    exit 1
fi

# Step 1: Start Docker services
echo -e "${YELLOW}Step 1: Starting Docker services...${NC}"
cd "$PROJECT_ROOT"
docker-compose up -d

echo ""
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# Check service health
echo -e "${YELLOW}Checking service health...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✓ Docker services started${NC}"
echo ""

# Step 2: Start ngrok tunnels
echo -e "${YELLOW}Step 2: Starting ngrok tunnels...${NC}"
"$SCRIPT_DIR/start-ngrok.sh"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All Services Started Successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Display service URLs
echo -e "${GREEN}Service URLs:${NC}"
echo ""
echo -e "${BLUE}Local Services:${NC}"
echo "  Backend API:      http://localhost:3001"
echo "  Admin Interface:  http://localhost:3003"
echo "  E-Banking Portal: http://localhost:4000"
echo "  PostgreSQL:       localhost:5432"
echo "  Redis:            localhost:6379"
echo ""

# Read ngrok URLs if available
if [ -f "$PROJECT_ROOT/.ngrok-urls" ]; then
    source "$PROJECT_ROOT/.ngrok-urls"
    echo -e "${BLUE}Public URLs (ngrok):${NC}"
    echo "  Backend API:      $NGROK_BACKEND_URL"
    echo "  Admin Interface:  $NGROK_ADMIN_URL"
    echo "  E-Banking Portal: $NGROK_PORTAL_URL"
    echo ""
fi

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. View logs: docker-compose logs -f [service]"
echo "2. View ngrok traffic: http://localhost:4040"
echo "3. Update Netlify environment variables (see above)"
echo "4. Stop all services: ./scripts/stop-all.sh"
echo ""
