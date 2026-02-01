#!/bin/bash

# Supabase Setup Script for UHI Staff Portal
# This script helps you configure Supabase connection

set -e

echo "🚀 UHI Staff Portal - Supabase Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the staff_backend directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Supabase Credentials${NC}"
echo "Please provide your Supabase connection details:"
echo ""

# Get Supabase credentials
read -p "Enter your Supabase Project Reference (e.g., abcdefghijklmnop): " PROJECT_REF
read -p "Enter your Supabase Database Password: " -s DB_PASSWORD
echo ""
read -p "Enter your Supabase Region (e.g., us-east-1): " REGION

echo ""
echo -e "${YELLOW}Step 2: Optional Supabase Features${NC}"
read -p "Do you want to use Supabase Auth/Storage features? (y/n): " USE_SUPABASE_FEATURES

if [ "$USE_SUPABASE_FEATURES" = "y" ]; then
    read -p "Enter your Supabase URL (e.g., https://xxx.supabase.co): " SUPABASE_URL
    read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
    read -p "Enter your Supabase Service Role Key: " -s SUPABASE_SERVICE_ROLE_KEY
    echo ""
fi

# Construct connection strings
POOLER_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo ""
echo -e "${YELLOW}Step 3: Creating .env file${NC}"

# Backup existing .env if it exists
if [ -f ".env" ]; then
    cp .env .env.backup
    echo -e "${GREEN}✓ Backed up existing .env to .env.backup${NC}"
fi

# Create new .env file
cat > .env << EOF
# Supabase Database Connection
DATABASE_URL="${POOLER_URL}"
DIRECT_URL="${DIRECT_URL}"

# Application Settings
JWT_SECRET="dev_secret_key_change_me_32_chars_minimum!"
PORT=3000
NODE_ENV=development

# Redis
REDIS_URL="redis://localhost:6379"

# Email (Mailtrap for development)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
SMTP_FROM=noreply@uhi.org

# Sentry (optional)
SENTRY_DSN=

# Stripe (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
EOF

# Add Supabase features if requested
if [ "$USE_SUPABASE_FEATURES" = "y" ]; then
    cat >> .env << EOF

# Supabase Features
SUPABASE_URL="${SUPABASE_URL}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
EOF
fi

echo -e "${GREEN}✓ Created .env file${NC}"

# Create .env.test
echo ""
echo -e "${YELLOW}Step 4: Creating .env.test file${NC}"

cat > .env.test << EOF
# Test Database - Supabase Connection with test schema
DATABASE_URL="${POOLER_URL}&schema=test"
DIRECT_URL="${DIRECT_URL}?schema=test"

# Test Configuration
JWT_SECRET="test_secret_key_change_me_32_chars_minimum!"
NODE_ENV=test
PORT=3001

# Redis
REDIS_URL="redis://localhost:6379"
EOF

if [ "$USE_SUPABASE_FEATURES" = "y" ]; then
    cat >> .env.test << EOF

# Supabase
SUPABASE_URL="${SUPABASE_URL}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY}"
EOF
fi

echo -e "${GREEN}✓ Created .env.test file${NC}"

# Update Prisma schema
echo ""
echo -e "${YELLOW}Step 5: Updating Prisma schema${NC}"

# Check if directUrl already exists in schema
if ! grep -q "directUrl" prisma/schema.prisma; then
    # Add directUrl to datasource
    sed -i.bak '/datasource db {/,/}/ s/url.*=.*env("DATABASE_URL")/url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")/' prisma/schema.prisma
    echo -e "${GREEN}✓ Added directUrl to Prisma schema${NC}"
else
    echo -e "${GREEN}✓ Prisma schema already has directUrl${NC}"
fi

# Generate Prisma Client
echo ""
echo -e "${YELLOW}Step 6: Generating Prisma Client${NC}"
npm run prisma:generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"

# Push schema to Supabase
echo ""
echo -e "${YELLOW}Step 7: Pushing schema to Supabase${NC}"
echo "This will create all tables in your Supabase database..."
read -p "Continue? (y/n): " CONTINUE

if [ "$CONTINUE" = "y" ]; then
    npx prisma db push
    echo -e "${GREEN}✓ Schema pushed to Supabase${NC}"
else
    echo -e "${YELLOW}⚠ Skipped schema push. Run 'npx prisma db push' manually when ready.${NC}"
fi

# Seed database
echo ""
echo -e "${YELLOW}Step 8: Seeding database${NC}"
read -p "Do you want to seed the database with test data? (y/n): " SEED

if [ "$SEED" = "y" ]; then
    npm run seed:test
    echo -e "${GREEN}✓ Database seeded${NC}"
else
    echo -e "${YELLOW}⚠ Skipped seeding. Run 'npm run seed:test' manually when ready.${NC}"
fi

# Test connection
echo ""
echo -e "${YELLOW}Step 9: Testing connection${NC}"
npx prisma db pull > /dev/null 2>&1 && echo -e "${GREEN}✓ Connection successful!${NC}" || echo -e "${RED}✗ Connection failed. Please check your credentials.${NC}"

# Summary
echo ""
echo "===================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Review your .env file"
echo "2. Run 'npm run dev' to start the server"
echo "3. Run 'npm run test:integration' to test"
echo "4. Open Prisma Studio: 'npx prisma studio'"
echo ""
echo "📚 See SUPABASE_SETUP_GUIDE.md for more details"
echo ""
echo "Connection strings:"
echo "  Pooler: ${POOLER_URL}"
echo "  Direct: ${DIRECT_URL}"
echo ""
