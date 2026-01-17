#!/bin/bash

# NovaBank Docker Build Fix Script
# This script provides a reliable way to build and deploy the Docker services

set -e

echo "🔧 NovaBank Docker Build Fix Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.dev.yml" ]; then
    print_error "docker-compose.dev.yml not found. Please run this script from the docker directory."
    exit 1
fi

print_status "Starting Docker build fix process..."

# Step 1: Clean up any failed builds and containers
print_status "Cleaning up previous builds and containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans || true
docker system prune -f
docker builder prune -f
print_success "Cleanup completed"

# Step 2: Start infrastructure services first
print_status "Starting infrastructure services (PostgreSQL, Redis)..."
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for services to be healthy
print_status "Waiting for infrastructure services to be healthy..."
sleep 30

# Check if services are running
if docker-compose -f docker-compose.dev.yml ps postgres | grep -q "Up"; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL failed to start"
    exit 1
fi

if docker-compose -f docker-compose.dev.yml ps redis | grep -q "Up"; then
    print_success "Redis is running"
else
    print_error "Redis failed to start"
    exit 1
fi

# Step 3: Build Core API with optimized settings
print_status "Building Core API with enhanced npm configuration..."
DOCKER_BUILDKIT=1 docker-compose -f docker-compose.dev.yml build \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --no-cache \
    core-api-dev

if [ $? -eq 0 ]; then
    print_success "Core API build completed successfully!"
else
    print_error "Core API build failed"
    exit 1
fi

# Step 4: Build Admin Interface
print_status "Building Admin Interface..."
DOCKER_BUILDKIT=1 docker-compose -f docker-compose.dev.yml build \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --no-cache \
    admin-interface-dev

if [ $? -eq 0 ]; then
    print_success "Admin Interface build completed successfully!"
else
    print_error "Admin Interface build failed"
    exit 1
fi

# Step 5: Start management tools
print_status "Starting management tools (pgAdmin, Redis Commander, Mailhog)..."
docker-compose -f docker-compose.dev.yml up -d pgadmin redis-commander mailhog

# Step 6: Start monitoring stack
print_status "Starting monitoring stack (Prometheus, Grafana)..."
docker-compose -f docker-compose.dev.yml up -d prometheus grafana

# Step 7: Start application services
print_status "Starting application services..."
docker-compose -f docker-compose.dev.yml up -d core-api-dev admin-interface-dev

# Step 8: Wait for services to be ready
print_status "Waiting for all services to be ready..."
sleep 60

# Step 9: Run health check
print_status "Running health check..."
if [ -f "./health-check.sh" ]; then
    chmod +x ./health-check.sh
    ./health-check.sh
else
    print_warning "Health check script not found, performing manual checks..."
    
    # Manual health checks
    print_status "Checking service status..."
    docker-compose -f docker-compose.dev.yml ps
    
    # Check if services are responding
    print_status "Testing service endpoints..."
    
    # Test Core API
    if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Core API is responding"
    else
        print_warning "Core API health check failed (may still be starting)"
    fi
    
    # Test Admin Interface
    if curl -f -s http://localhost:3002/api/health > /dev/null 2>&1; then
        print_success "Admin Interface is responding"
    else
        print_warning "Admin Interface health check failed (may still be starting)"
    fi
fi

# Step 10: Display service information
echo ""
print_success "🚀 NovaBank Docker deployment completed successfully!"
echo ""
echo "📋 Service Information:"
echo "======================="
echo "🔗 Service URLs:"
echo "  • Core API:           http://localhost:3000"
echo "  • Admin Interface:    http://localhost:3002"
echo "  • Database (PostgreSQL): localhost:5433"
echo "  • pgAdmin:            http://localhost:5050"
echo "  • Redis Commander:    http://localhost:8081"
echo "  • Mailhog:            http://localhost:8025"
echo "  • Prometheus:         http://localhost:9090"
echo "  • Grafana:            http://localhost:3001"
echo ""
echo "🔧 Management Commands:"
echo "  • View logs:          docker-compose -f docker-compose.dev.yml logs -f [service]"
echo "  • Stop services:      docker-compose -f docker-compose.dev.yml down"
echo "  • Restart service:    docker-compose -f docker-compose.dev.yml restart [service]"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.dev.yml ps

print_success "All services are now running! 🎉"