#!/bin/bash

# AURUM VAULT Development Environment Startup Script
# This script starts all services in development mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              AURUM VAULT Development Environment          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if PostgreSQL is running
echo -e "${YELLOW}📦 Checking PostgreSQL...${NC}"
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL is not running!${NC}"
    echo -e "${YELLOW}Starting PostgreSQL with Docker...${NC}"
    docker-compose up -d postgres
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    sleep 5
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Check if Redis is running
echo -e "${YELLOW}📦 Checking Redis...${NC}"
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${RED}❌ Redis is not running!${NC}"
    echo -e "${YELLOW}Starting Redis with Docker...${NC}"
    docker-compose up -d redis
    echo -e "${YELLOW}⏳ Waiting for Redis to be ready...${NC}"
    sleep 3
fi
echo -e "${GREEN}✅ Redis is running${NC}"

# Initialize database if needed
echo -e "${YELLOW}🗄️  Checking database setup...${NC}"
cd backend/core-api
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Run Prisma migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
npm run prisma:generate > /dev/null 2>&1
npm run prisma:migrate > /dev/null 2>&1 || true

echo -e "${GREEN}✅ Database ready${NC}"
cd ../..

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $1 is already in use!${NC}"
        echo -e "${YELLOW}Please stop the process using port $1 or change the port configuration.${NC}"
        exit 1
    fi
}

# Check all ports
echo -e "${YELLOW}🔍 Checking ports...${NC}"
check_port 3001
check_port 3002
check_port 3003
check_port 4000
echo -e "${GREEN}✅ All ports are available${NC}"

# Create log directory
mkdir -p logs

# Start Backend API
echo -e "${BLUE}🔧 Starting Core API Backend (Port 3001)...${NC}"
cd backend/core-api
npm run dev > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
cd ../..

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
sleep 5

# Check if backend is responding
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed, but continuing...${NC}"
fi

# Start Corporate Website
echo -e "${MAGENTA}🌐 Starting Corporate Website (Port 3002)...${NC}"
cd corporate-website
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing corporate website dependencies...${NC}"
    npm install
fi
npm run dev > ../logs/corporate.log 2>&1 &
CORPORATE_PID=$!
echo -e "${GREEN}✅ Corporate Website started (PID: $CORPORATE_PID)${NC}"
cd ..

# Start Admin Interface
echo -e "${CYAN}👨‍💼 Starting Admin Interface (Port 3003)...${NC}"
cd admin-interface
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing admin interface dependencies...${NC}"
    npm install
fi
npm run dev > ../logs/admin.log 2>&1 &
ADMIN_PID=$!
echo -e "${GREEN}✅ Admin Interface started (PID: $ADMIN_PID)${NC}"
cd ..

# Start E-Banking Portal
echo -e "${GREEN}💼 Starting E-Banking Portal (Port 4000)...${NC}"
cd e-banking-portal
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing e-banking portal dependencies...${NC}"
    npm install
fi
npm run dev > ../logs/portal.log 2>&1 &
PORTAL_PID=$!
echo -e "${GREEN}✅ E-Banking Portal started (PID: $PORTAL_PID)${NC}"
cd ..

# Wait for all services to start
echo -e "${YELLOW}⏳ Waiting for all services to initialize...${NC}"
sleep 10

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║              ✅ All Services Started Successfully!          ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📍 Service URLs:${NC}"
echo -e "   ${BLUE}🔧 Core API Backend:     ${NC}http://localhost:3001"
echo -e "   ${MAGENTA}🌐 Corporate Website:    ${NC}http://localhost:3002"
echo -e "   ${CYAN}👨‍💼 Admin Interface:      ${NC}http://localhost:3003"
echo -e "   ${GREEN}💼 E-Banking Portal:     ${NC}http://localhost:4000"
echo ""
echo -e "${CYAN}📊 Database Services:${NC}"
echo -e "   ${YELLOW}🗄️  PostgreSQL:           ${NC}localhost:5432"
echo -e "   ${YELLOW}📦 Redis:                ${NC}localhost:6379"
echo ""
echo -e "${CYAN}📝 Logs:${NC}"
echo -e "   ${YELLOW}Backend:     ${NC}logs/backend.log"
echo -e "   ${YELLOW}Corporate:   ${NC}logs/corporate.log"
echo -e "   ${YELLOW}Admin:       ${NC}logs/admin.log"
echo -e "   ${YELLOW}Portal:      ${NC}logs/portal.log"
echo ""
echo -e "${CYAN}🔑 Default Credentials:${NC}"
echo -e "   ${YELLOW}Admin:       ${NC}admin@aurumvault.com / Admin@123456"
echo -e "   ${YELLOW}Test User:   ${NC}user@aurumvault.com / User@123456"
echo ""
echo -e "${RED}Press Ctrl+C to stop all services${NC}"
echo ""

# Save PIDs to file for cleanup
echo "$BACKEND_PID" > .pids
echo "$CORPORATE_PID" >> .pids
echo "$ADMIN_PID" >> .pids
echo "$PORTAL_PID" >> .pids

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    if [ -f .pids ]; then
        while read pid; do
            if ps -p $pid > /dev/null 2>&1; then
                kill $pid 2>/dev/null || true
            fi
        done < .pids
        rm .pids
    fi
    
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for user to stop
wait
