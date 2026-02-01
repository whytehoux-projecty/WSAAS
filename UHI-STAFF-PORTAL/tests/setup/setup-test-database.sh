#!/bin/bash

###############################################################################
# UHI Staff Portal - Real Test Database Setup Script
#
# This script sets up a complete test database with REAL data:
# - Creates test database
# - Runs all migrations
# - Seeds with realistic production-like data
# - Creates test users with real credentials
# - Populates all tables with minimum 1000 records
#
# NO MOCK DATA - All data is realistic and production-like
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
BACKEND_DIR="${PROJECT_ROOT}/staff_backend"

# Test database configuration
TEST_DB_NAME="${TEST_DB_NAME:-uhi_staff_portal_test}"
TEST_DB_USER="${TEST_DB_USER:-uhi_test_user}"
TEST_DB_PASSWORD="${TEST_DB_PASSWORD:-test_password}"
TEST_DB_HOST="${TEST_DB_HOST:-localhost}"
TEST_DB_PORT="${TEST_DB_PORT:-5432}"

# Logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL client not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm not installed"
        exit 1
    fi
    
    log_info "All prerequisites met"
}

# Drop existing test database
drop_test_database() {
    log_step "Dropping existing test database (if exists)..."
    
    PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U postgres -c "DROP DATABASE IF EXISTS $TEST_DB_NAME;" 2>/dev/null || true
    PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U postgres -c "DROP USER IF EXISTS $TEST_DB_USER;" 2>/dev/null || true
    
    log_info "Cleaned up existing test database"
}

# Create test database
create_test_database() {
    log_step "Creating test database..."
    
    # Create user
    PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U postgres -c "CREATE USER $TEST_DB_USER WITH PASSWORD '$TEST_DB_PASSWORD';" || true
    
    # Create database
    PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U postgres -c "CREATE DATABASE $TEST_DB_NAME OWNER $TEST_DB_USER;"
    
    # Grant privileges
    PGPASSWORD="$TEST_DB_PASSWORD" psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $TEST_DB_NAME TO $TEST_DB_USER;"
    
    log_info "Test database created: $TEST_DB_NAME"
}

# Run migrations
run_migrations() {
    log_step "Running database migrations..."
    
    cd "$BACKEND_DIR"
    
    # Set test database URL
    export DATABASE_URL="postgresql://$TEST_DB_USER:$TEST_DB_PASSWORD@$TEST_DB_HOST:$TEST_DB_PORT/$TEST_DB_NAME"
    
    # Run Prisma migrations
    npx prisma migrate deploy
    
    # Generate Prisma client
    npx prisma generate
    
    log_info "Migrations completed successfully"
}

# Seed test data
seed_test_data() {
    log_step "Seeding test database with REAL data..."
    
    cd "$BACKEND_DIR"
    
    # Set test database URL
    export DATABASE_URL="postgresql://$TEST_DB_USER:$TEST_DB_PASSWORD@$TEST_DB_HOST:$TEST_DB_PORT/$TEST_DB_NAME"
    export NODE_ENV="test"
    
    # Run seed script
    npm run seed:test
    
    log_info "Test data seeded successfully"
}

# Verify data
verify_data() {
    log_step "Verifying seeded data..."
    
    export PGPASSWORD="$TEST_DB_PASSWORD"
    
    # Count records in major tables
    ORGANIZATIONS=$(psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -t -c "SELECT COUNT(*) FROM organizations;")
    USERS=$(psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -t -c "SELECT COUNT(*) FROM users;")
    STAFF=$(psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -t -c "SELECT COUNT(*) FROM staff;")
    
    log_info "Data verification:"
    log_info "  Organizations: $ORGANIZATIONS"
    log_info "  Users: $USERS"
    log_info "  Staff: $STAFF"
    
    # Verify minimum records
    if [ "$USERS" -lt 100 ]; then
        log_warn "Less than 100 users seeded (found: $USERS)"
    fi
    
    if [ "$STAFF" -lt 100 ]; then
        log_warn "Less than 100 staff records seeded (found: $STAFF)"
    fi
}

# Create test users
create_test_users() {
    log_step "Creating test users with real credentials..."
    
    cd "$BACKEND_DIR"
    
    export DATABASE_URL="postgresql://$TEST_DB_USER:$TEST_DB_PASSWORD@$TEST_DB_HOST:$TEST_DB_PORT/$TEST_DB_NAME"
    
    # Run test user creation script
    node -e "
    const { PrismaClient, UserStatus } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    
    const prisma = new PrismaClient();
    
    async function createTestUsers() {
        console.log('Creating test users...');
        const adminRole = await prisma.role.upsert({
             where: { name: 'ADMIN' },
             update: {},
             create: { name: 'ADMIN', permissions: {} }
        });

        const staffRole = await prisma.role.upsert({
             where: { name: 'STAFF' },
             update: {},
             create: { name: 'STAFF', permissions: {} }
        });

        const managerRole = await prisma.role.upsert({
             where: { name: 'MANAGER' },
             update: {},
             create: { name: 'MANAGER', permissions: {} }
        });
        
        // Admin user
        const admin = await prisma.user.upsert({
            where: { email: 'admin.test@uhi.org' },
            update: {},
            create: {
                staff_id: 'ADM001',
                email: 'admin.test@uhi.org',
                password_hash: await bcrypt.hash('TestAdmin123!', 10),
                first_name: 'Admin',
                last_name: 'Test',
                status: 'active',
            },
        });
        await prisma.userRole.create({ data: { user_id: admin.id, role_id: adminRole.id } }).catch(() => {});
        
        // Staff user
        const staff = await prisma.user.upsert({
            where: { email: 'staff.test@uhi.org' },
            update: {},
            create: {
                staff_id: 'STF001',
                email: 'staff.test@uhi.org',
                password_hash: await bcrypt.hash('TestStaff123!', 10),
                first_name: 'Staff',
                last_name: 'Test',
                status: 'active',
            },
        });
        await prisma.userRole.create({ data: { user_id: staff.id, role_id: staffRole.id } }).catch(() => {});
        
        // Manager user
        const manager = await prisma.user.upsert({
            where: { email: 'manager.test@uhi.org' },
            update: {},
            create: {
                staff_id: 'MGR001',
                email: 'manager.test@uhi.org',
                password_hash: await bcrypt.hash('TestManager123!', 10),
                first_name: 'Manager',
                last_name: 'Test',
                status: 'active',
            },
        });
        await prisma.userRole.create({ data: { user_id: manager.id, role_id: managerRole.id } }).catch(() => {});
        
        console.log('✅ Test users created');
        await prisma.\$disconnect();
    }
    
    createTestUsers().catch((e) => {
        console.error(e);
        process.exit(1);
    });
    "
    
    log_info "Test users created successfully"
}

# Generate summary
generate_summary() {
    log_step "Generating test database summary..."
    
    SUMMARY_FILE="${PROJECT_ROOT}/tests/test-database-summary.txt"
    
    {
        echo "=========================================="
        echo "UHI Staff Portal - Test Database Summary"
        echo "=========================================="
        echo ""
        echo "Database: $TEST_DB_NAME"
        echo "Host: $TEST_DB_HOST:$TEST_DB_PORT"
        echo "User: $TEST_DB_USER"
        echo "Created: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        echo "Test Users:"
        echo "  Admin: admin.test@uhi.org / TestAdmin123!"
        echo "  Staff: staff.test@uhi.org / TestStaff123!"
        echo "  Manager: manager.test@uhi.org / TestManager123!"
        echo ""
        echo "Data Summary:"
        export PGPASSWORD="$TEST_DB_PASSWORD"
        psql -h "$TEST_DB_HOST" -p "$TEST_DB_PORT" -U "$TEST_DB_USER" -d "$TEST_DB_NAME" -c "
        SELECT 
            schemaname,
            tablename,
            n_live_tup as row_count
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC;
        "
        echo ""
        echo "=========================================="
    } > "$SUMMARY_FILE"
    
    cat "$SUMMARY_FILE"
    log_info "Summary saved to: $SUMMARY_FILE"
}

# Main execution
main() {
    log_info "=== UHI Staff Portal Test Database Setup ==="
    echo ""
    
    check_prerequisites
    drop_test_database
    create_test_database
    run_migrations
    create_test_users
    seed_test_data
    verify_data
    generate_summary
    
    echo ""
    log_info "=== Test Database Setup Complete ==="
    log_info "Connection string: postgresql://$TEST_DB_USER:$TEST_DB_PASSWORD@$TEST_DB_HOST:$TEST_DB_PORT/$TEST_DB_NAME"
    echo ""
}

# Run main function
main "$@"
