#!/bin/bash

# NovaBank Infrastructure Quick Start
# This script starts only the infrastructure services for immediate use

set -e

echo "🚀 NovaBank Infrastructure Quick Start"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "Error: docker-compose.dev.yml not found. Please run this script from the docker directory."
    exit 1
fi

print_status "Starting infrastructure services..."

# Clean up any existing containers
docker-compose -f docker-compose.dev.yml down --remove-orphans || true

# Start infrastructure services
print_status "Starting PostgreSQL and Redis..."
docker-compose -f docker-compose.dev.yml up -d postgres redis

print_status "Starting management tools..."
docker-compose -f docker-compose.dev.yml up -d pgadmin redis-commander mailhog

print_status "Starting monitoring stack..."
docker-compose -f docker-compose.dev.yml up -d prometheus grafana

print_status "Waiting for services to be ready..."
sleep 30

print_success "Infrastructure services are now running!"
echo ""
echo "🔗 Available Services:"
echo "  • Database (PostgreSQL): localhost:5433"
echo "  • Cache (Redis):         localhost:6379"
echo "  • pgAdmin:              http://localhost:5050"
echo "  • Redis Commander:      http://localhost:8081"
echo "  • Mailhog:              http://localhost:8025"
echo "  • Prometheus:           http://localhost:9090"
echo "  • Grafana:              http://localhost:3001"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.dev.yml ps

echo ""
print_success "Infrastructure is ready! You can now build the API services separately."
echo ""
echo "Next steps:"
echo "  1. Run './quick-fix.sh' to build and start all services"
echo "  2. Or build services individually:"
echo "     docker-compose -f docker-compose.dev.yml build core-api-dev"
echo "     docker-compose -f docker-compose.dev.yml build admin-interface-dev"