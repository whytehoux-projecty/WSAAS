#!/bin/bash

# Aurum Vault Development Environment Setup Script
# This script sets up the complete development environment using Docker

set -e

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.dev" ]; then
            cp .env.dev .env
            print_success "Copied .env.dev to .env"
        else
            print_warning ".env.dev not found, using .env.example"
            cp .env.example .env
        fi
    else
        print_warning ".env already exists, skipping copy"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=(
        "logs"
        "uploads"
        "nginx/ssl"
        "database/init"
        "monitoring/grafana/dashboards"
        "monitoring/grafana/datasources"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        fi
    done
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    docker-compose -f docker-compose.dev.yml build --no-cache
    
    if [ $? -eq 0 ]; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
}

# Start services
start_services() {
    print_status "Starting development services..."
    
    # Start infrastructure services first
    print_status "Starting infrastructure services (PostgreSQL, Redis)..."
    docker-compose -f docker-compose.dev.yml up -d postgres redis
    
    # Wait for infrastructure to be ready
    print_status "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Start application services
    print_status "Starting application services..."
    docker-compose -f docker-compose.dev.yml up -d
    
    if [ $? -eq 0 ]; then
        print_success "All services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    services=("postgres" "redis" "core-api-dev" "admin-interface-dev")
    
    for service in "${services[@]}"; do
        print_status "Waiting for $service to be healthy..."
        
        timeout=120
        counter=0
        
        while [ $counter -lt $timeout ]; do
            if docker-compose -f docker-compose.dev.yml ps | grep "$service" | grep -q "healthy\|Up"; then
                print_success "$service is ready"
                break
            fi
            
            sleep 2
            counter=$((counter + 2))
        done
        
        if [ $counter -ge $timeout ]; then
            print_warning "$service did not become healthy within $timeout seconds"
        fi
    done
}

# Run database migrations and seeding
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    docker-compose -f docker-compose.dev.yml exec -T core-api-dev npm run prisma:generate
    
    # Run migrations
    print_status "Running database migrations..."
    docker-compose -f docker-compose.dev.yml exec -T core-api-dev npm run prisma:migrate
    
    # Seed database
    print_status "Seeding database..."
    docker-compose -f docker-compose.dev.yml exec -T core-api-dev npm run prisma:seed
    
    print_success "Database setup completed"
}

# Display service URLs
display_urls() {
    print_success "Development environment is ready!"
    echo ""
    echo "🚀 Service URLs:"
    echo "   Core API:           http://localhost:3000"
    echo "   Admin Interface:    http://localhost:3002"
    echo "   pgAdmin:           http://localhost:5050"
    echo "   Redis Commander:   http://localhost:8081"
    echo "   Mailhog:           http://localhost:8025"
    echo "   Grafana:           http://localhost:3001"
    echo "   Prometheus:        http://localhost:9090"
    echo ""
    echo "📊 Credentials:"
    echo "   pgAdmin:           admin@aurumvault.dev / dev_admin_123"
    echo "   Redis Commander:   admin / dev_redis_admin_123"
    echo "   Grafana:           admin / dev_grafana_123"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs:         docker-compose -f docker-compose.dev.yml logs -f"
    echo "   Stop services:     docker-compose -f docker-compose.dev.yml down"
    echo "   Restart service:   docker-compose -f docker-compose.dev.yml restart <service>"
    echo "   Shell access:      docker-compose -f docker-compose.dev.yml exec <service> sh"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up development environment..."
    
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    
    print_success "Cleanup completed"
}

# Main function
main() {
    echo "🏦 Aurum Vault Development Environment Setup"
    echo "============================================="
    echo ""
    
    case "${1:-setup}" in
        "setup")
            check_prerequisites
            setup_environment
            create_directories
            build_images
            start_services
            wait_for_services
            setup_database
            display_urls
            ;;
        "start")
            print_status "Starting existing development environment..."
            docker-compose -f docker-compose.dev.yml up -d
            wait_for_services
            display_urls
            ;;
        "stop")
            print_status "Stopping development environment..."
            docker-compose -f docker-compose.dev.yml down
            print_success "Development environment stopped"
            ;;
        "restart")
            print_status "Restarting development environment..."
            docker-compose -f docker-compose.dev.yml restart
            wait_for_services
            display_urls
            ;;
        "rebuild")
            print_status "Rebuilding development environment..."
            docker-compose -f docker-compose.dev.yml down
            build_images
            start_services
            wait_for_services
            setup_database
            display_urls
            ;;
        "cleanup")
            cleanup
            ;;
        "logs")
            docker-compose -f docker-compose.dev.yml logs -f
            ;;
        "status")
            docker-compose -f docker-compose.dev.yml ps
            ;;
        *)
            echo "Usage: $0 {setup|start|stop|restart|rebuild|cleanup|logs|status}"
            echo ""
            echo "Commands:"
            echo "  setup    - Initial setup of development environment"
            echo "  start    - Start existing development environment"
            echo "  stop     - Stop development environment"
            echo "  restart  - Restart development environment"
            echo "  rebuild  - Rebuild and restart development environment"
            echo "  cleanup  - Clean up all containers and volumes"
            echo "  logs     - Show logs from all services"
            echo "  status   - Show status of all services"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"