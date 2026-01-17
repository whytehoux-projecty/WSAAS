#!/bin/bash

# Test script to verify container directory structure
echo "🔍 Testing Docker container directory structure..."

# Build and run a temporary container to test directory structure
echo "📦 Building Core API container..."
docker-compose -f docker-compose.dev.yml build core-api-dev

echo "🚀 Starting temporary container to test directory structure..."
docker run --rm -it \
  --name test-core-api \
  -v "$(pwd)/../core-api/src:/app/core-api/src:ro" \
  -v "$(pwd)/../admin-interface/src:/app/admin-interface/src:ro" \
  -v "$(pwd)/../shared:/app/shared:ro" \
  novabank-backend_core-api-dev:latest \
  sh -c "
    echo '📁 Checking directory structure...'
    echo '=== Root directory ==='
    ls -la /app/
    echo ''
    echo '=== Core API directory ==='
    ls -la /app/core-api/
    echo ''
    echo '=== Admin Interface directory ==='
    ls -la /app/admin-interface/
    echo ''
    echo '=== Shared directory ==='
    ls -la /app/shared/
    echo ''
    echo '=== Core API source ==='
    ls -la /app/core-api/src/ | head -10
    echo ''
    echo '=== Admin Interface source ==='
    ls -la /app/admin-interface/src/ | head -10
    echo ''
    echo '✅ Directory structure test completed!'
  "

echo "🎉 Container test completed!"