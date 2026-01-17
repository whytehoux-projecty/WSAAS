#!/bin/bash

# AURUM VAULT Production Deployment Script
# This script deploys the complete system to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        AURUM VAULT Production Deployment                  ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}Please create .env.production with all required variables.${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo -e "${YELLOW}📋 Pre-deployment Checklist${NC}"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is installed${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose is installed${NC}"

# Check if required environment variables are set
required_vars=("DB_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "JWT_REFRESH_SECRET" "ADMIN_JWT_SECRET" "SESSION_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable $var is not set${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ All required environment variables are set${NC}"

echo ""
echo -e "${YELLOW}🚀 Starting Deployment...${NC}"
echo ""

# Stop existing containers
echo -e "${BLUE}1. Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true
echo -e "${GREEN}✅ Containers stopped${NC}"

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo -e "${BLUE}2. Pulling latest code...${NC}"
    git pull origin main
    echo -e "${GREEN}✅ Code updated${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository, skipping pull${NC}"
fi

# Build Docker images
echo -e "${BLUE}3. Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache
echo -e "${GREEN}✅ Images built${NC}"

# Start database and redis first
echo -e "${BLUE}4. Starting database and Redis...${NC}"
docker-compose -f docker-compose.prod.yml up -d postgres redis
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 10

# Run database migrations
echo -e "${BLUE}5. Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml run --rm backend npm run prisma:migrate:prod
echo -e "${GREEN}✅ Migrations completed${NC}"

# Seed database (optional - only on first deployment)
read -p "Do you want to seed the database? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}6. Seeding database...${NC}"
    docker-compose -f docker-compose.prod.yml run --rm backend npm run prisma:seed
    echo -e "${GREEN}✅ Database seeded${NC}"
fi

# Start all services
echo -e "${BLUE}7. Starting all services...${NC}"
docker-compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}✅ All services started${NC}"

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 15

# Check service health
echo -e "${BLUE}8. Checking service health...${NC}"

# Check backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is healthy${NC}"
else
    echo -e "${RED}❌ Backend API health check failed${NC}"
fi

# Check portal
if curl -f http://localhost:4000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ E-Banking Portal is healthy${NC}"
else
    echo -e "${RED}❌ E-Banking Portal health check failed${NC}"
fi

# Check admin
if curl -f http://localhost:3003 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin Interface is healthy${NC}"
else
    echo -e "${RED}❌ Admin Interface health check failed${NC}"
fi

# Create backup directory
mkdir -p backups
echo -e "${GREEN}✅ Backup directory created${NC}"

# Setup cron job for backups (optional)
read -p "Do you want to setup automatic daily backups? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    CRON_JOB="0 2 * * * cd $(pwd) && ./scripts/backup.sh"
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}✅ Daily backup cron job created (runs at 2 AM)${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║          ✅ Deployment Completed Successfully!             ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📍 Service URLs (Local):${NC}"
echo -e "   ${BLUE}🔧 Backend API:          ${NC}http://localhost:3001"
echo -e "   ${BLUE}💼 E-Banking Portal:     ${NC}http://localhost:4000"
echo -e "   ${BLUE}👨‍💼 Admin Interface:      ${NC}http://localhost:3003"
echo ""
echo -e "${CYAN}📊 Useful Commands:${NC}"
echo -e "   ${YELLOW}View logs:               ${NC}docker-compose -f docker-compose.prod.yml logs -f"
echo -e "   ${YELLOW}Stop services:           ${NC}docker-compose -f docker-compose.prod.yml down"
echo -e "   ${YELLOW}Restart services:        ${NC}docker-compose -f docker-compose.prod.yml restart"
echo -e "   ${YELLOW}View running containers: ${NC}docker-compose -f docker-compose.prod.yml ps"
echo -e "   ${YELLOW}Backup database:         ${NC}./scripts/backup.sh"
echo ""
echo -e "${CYAN}🔐 Next Steps:${NC}"
echo -e "   1. Setup Cloudflare Tunnel for internet exposure"
echo -e "   2. Configure DNS records"
echo -e "   3. Test all services"
echo -e "   4. Monitor logs for errors"
echo -e "   5. Setup monitoring and alerts"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo -e "   - Keep .env.production secure and backed up"
echo -e "   - Monitor disk space for database and logs"
echo -e "   - Setup regular backups"
echo -e "   - Review security settings"
echo ""
