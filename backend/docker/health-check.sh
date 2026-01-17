#!/bin/bash

# Aurum Vault Development Environment Health Check
# This script verifies that all services are running correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.dev.yml"
TIMEOUT=30

echo -e "${BLUE}🏥 Aurum Vault Development Environment Health Check${NC}"
echo "=================================================="

# Function to check if a service is healthy
check_service_health() {
    local service_name=$1
    local container_name=$2
    
    echo -n "Checking $service_name... "
    
    # Check if container is running
    if ! docker ps --format "table {{.Names}}" | grep -q "^$container_name$"; then
        echo -e "${RED}❌ Container not running${NC}"
        return 1
    fi
    
    # Check health status
    health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-health-check")
    
    if [ "$health_status" = "healthy" ]; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    elif [ "$health_status" = "starting" ]; then
        echo -e "${YELLOW}⏳ Starting...${NC}"
        return 1
    elif [ "$health_status" = "no-health-check" ]; then
        # For services without health checks, just check if running
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

# Function to check if a port is accessible
check_port() {
    local service_name=$1
    local port=$2
    local path=${3:-""}
    
    echo -n "Checking $service_name port $port... "
    
    if curl -s -f "http://localhost:$port$path" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ Not accessible${NC}"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    echo -n "Checking database connectivity... "
    
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U aurumvault_admin -d aurumvault_dev > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Connected${NC}"
        return 0
    else
        echo -e "${RED}❌ Connection failed${NC}"
        return 1
    fi
}

# Function to check Redis connectivity
check_redis() {
    echo -n "Checking Redis connectivity... "
    
    if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli -a dev_redis_123 ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Connected${NC}"
        return 0
    else
        echo -e "${RED}❌ Connection failed${NC}"
        return 1
    fi
}

# Main health check
main() {
    local failed_checks=0
    
    echo -e "\n${BLUE}📋 Service Health Status${NC}"
    echo "------------------------"
    
    # Check core services
    check_service_health "PostgreSQL Database" "aurumvault-db-dev" || ((failed_checks++))
    check_service_health "Redis Cache" "aurumvault-redis-dev" || ((failed_checks++))
    check_service_health "Core API" "aurumvault-core-api-dev" || ((failed_checks++))
    check_service_health "Admin Interface" "aurumvault-admin-interface-dev" || ((failed_checks++))
    
    # Check development tools
    check_service_health "pgAdmin" "aurumvault-pgadmin-dev" || ((failed_checks++))
    check_service_health "Redis Commander" "aurumvault-redis-commander-dev" || ((failed_checks++))
    check_service_health "Mailhog" "aurumvault-mailhog-dev" || ((failed_checks++))
    check_service_health "Nginx" "aurumvault-nginx-dev" || ((failed_checks++))
    
    # Check monitoring services
    check_service_health "Prometheus" "aurumvault-prometheus-dev" || ((failed_checks++))
    check_service_health "Grafana" "aurumvault-grafana-dev" || ((failed_checks++))
    
    echo -e "\n${BLUE}🌐 Port Accessibility${NC}"
    echo "---------------------"
    
    # Check port accessibility
    check_port "Core API" "3000" "/health" || ((failed_checks++))
    check_port "Admin Interface" "3002" || ((failed_checks++))
    check_port "pgAdmin" "5050" || ((failed_checks++))
    check_port "Redis Commander" "8081" || ((failed_checks++))
    check_port "Mailhog Web" "8025" || ((failed_checks++))
    check_port "Prometheus" "9090" || ((failed_checks++))
    check_port "Grafana" "3001" || ((failed_checks++))
    
    echo -e "\n${BLUE}🔌 Database Connectivity${NC}"
    echo "-------------------------"
    
    # Check database and Redis connectivity
    check_database || ((failed_checks++))
    check_redis || ((failed_checks++))
    
    echo -e "\n${BLUE}📊 Summary${NC}"
    echo "----------"
    
    if [ $failed_checks -eq 0 ]; then
        echo -e "${GREEN}🎉 All checks passed! Development environment is healthy.${NC}"
        echo ""
        echo -e "${BLUE}🔗 Service URLs:${NC}"
        echo "• Core API: http://localhost:3000"
        echo "• Admin Interface: http://localhost:3002"
        echo "• pgAdmin: http://localhost:5050"
        echo "• Redis Commander: http://localhost:8081"
        echo "• Mailhog: http://localhost:8025"
        echo "• Prometheus: http://localhost:9090"
        echo "• Grafana: http://localhost:3001"
        echo ""
        echo -e "${BLUE}🐛 Debug Ports:${NC}"
        echo "• Core API Debug: localhost:9229"
        echo "• Admin Interface Debug: localhost:9230"
        return 0
    else
        echo -e "${RED}❌ $failed_checks check(s) failed. Please review the issues above.${NC}"
        echo ""
        echo -e "${YELLOW}💡 Troubleshooting tips:${NC}"
        echo "• Run: docker-compose -f $COMPOSE_FILE logs <service-name>"
        echo "• Run: docker-compose -f $COMPOSE_FILE restart <service-name>"
        echo "• Run: ./dev-setup.sh restart"
        return 1
    fi
}

# Run the health check
main "$@"