#!/bin/bash

# AURUM VAULT Frontend Detachment Script
# This script splits the monolithic frontend into two separate applications

set -e  # Exit on error

echo "🚀 AURUM VAULT Frontend Detachment Process"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Volumes/Project Disk/PROJECTS/CODING/BANK/AutumVault"
SOURCE_DIR="$BASE_DIR/New_Frontend"
CORPORATE_DIR="$BASE_DIR/corporate-website"
PORTAL_DIR="$BASE_DIR/e-banking-portal"

echo -e "${BLUE}Step 1: Verifying source directory...${NC}"
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory not found: $SOURCE_DIR"
    exit 1
fi
echo -e "${GREEN}✓ Source directory verified${NC}"
echo ""

echo -e "${BLUE}Step 2: Creating corporate website structure...${NC}"
# Copy Tailwind config
cp "$SOURCE_DIR/tailwind.config.ts" "$CORPORATE_DIR/" 2>/dev/null || true
cp "$SOURCE_DIR/postcss.config.mjs" "$CORPORATE_DIR/" 2>/dev/null || true
cp "$SOURCE_DIR/next.config.ts" "$CORPORATE_DIR/" 2>/dev/null || true
cp "$SOURCE_DIR/tsconfig.json" "$CORPORATE_DIR/" 2>/dev/null || true

# Copy global styles
mkdir -p "$CORPORATE_DIR/app"
cp "$SOURCE_DIR/app/globals.css" "$CORPORATE_DIR/app/" 2>/dev/null || true

# Copy lib directory
cp -r "$SOURCE_DIR/lib" "$CORPORATE_DIR/" 2>/dev/null || true

# Copy public assets
cp -r "$SOURCE_DIR/public" "$CORPORATE_DIR/" 2>/dev/null || true

# Copy components
mkdir -p "$CORPORATE_DIR/components"
cp -r "$SOURCE_DIR/components/commercial" "$CORPORATE_DIR/components/" 2>/dev/null || true
cp -r "$SOURCE_DIR/components/layout" "$CORPORATE_DIR/components/" 2>/dev/null || true
cp -r "$SOURCE_DIR/components/ui" "$CORPORATE_DIR/components/" 2>/dev/null || true
cp -r "$SOURCE_DIR/components/forms" "$CORPORATE_DIR/components/" 2>/dev/null || true
cp -r "$SOURCE_DIR/components/portal" "$CORPORATE_DIR/components/" 2>/dev/null || true

# Copy commercial pages
mkdir -p "$CORPORATE_DIR/app"
cp "$SOURCE_DIR/app/page.tsx" "$CORPORATE_DIR/app/" 2>/dev/null || true
cp "$SOURCE_DIR/app/layout.tsx" "$CORPORATE_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/about" "$CORPORATE_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/personal-banking" "$CORPORATE_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/business-banking" "$CORPORATE_DIR/app/" 2>/dev/null || true

# Copy login page (from e-banking/auth/login to root login)
mkdir -p "$CORPORATE_DIR/app/login"
cp "$SOURCE_DIR/app/e-banking/auth/login/page.tsx" "$CORPORATE_DIR/app/login/" 2>/dev/null || true

echo -e "${GREEN}✓ Corporate website structure created${NC}"
echo ""

echo -e "${BLUE}Step 3: Creating e-banking portal structure...${NC}"
# Copy Tailwind config
cp "$SOURCE_DIR/tailwind.config.ts" "$PORTAL_DIR/" 2>/dev/null || true
cp "$SOURCE_DIR/postcss.config.mjs" "$PORTAL_DIR/" 2>/dev/null || true
cp "$SOURCE_DIR/next.config.ts" "$PORTAL_DIR/" 2>/dev/null || true
cp "$SOURCE_DIR/tsconfig.json" "$PORTAL_DIR/" 2>/dev/null || true

# Copy global styles
mkdir -p "$PORTAL_DIR/app"
cp "$SOURCE_DIR/app/globals.css" "$PORTAL_DIR/app/" 2>/dev/null || true

# Copy lib directory
cp -r "$SOURCE_DIR/lib" "$PORTAL_DIR/" 2>/dev/null || true

# Copy public assets
cp -r "$SOURCE_DIR/public" "$PORTAL_DIR/" 2>/dev/null || true

# Copy components
mkdir -p "$PORTAL_DIR/components"
cp -r "$SOURCE_DIR/components/banking" "$PORTAL_DIR/components/" 2>/dev/null || true
cp -r "$SOURCE_DIR/components/ui" "$PORTAL_DIR/components/" 2>/dev/null || true
cp -r "$SOURCE_DIR/components/forms" "$PORTAL_DIR/components/" 2>/dev/null || true
cp -r "$SOURCE_DIR/components/charts" "$PORTAL_DIR/components/" 2>/dev/null || true

# Copy e-banking pages (excluding auth)
mkdir -p "$PORTAL_DIR/app"
cp -r "$SOURCE_DIR/app/e-banking/dashboard" "$PORTAL_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/e-banking/accounts" "$PORTAL_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/e-banking/transactions" "$PORTAL_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/e-banking/transfer" "$PORTAL_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/e-banking/bills" "$PORTAL_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/e-banking/cards" "$PORTAL_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/e-banking/beneficiaries" "$PORTAL_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/e-banking/statements" "$PORTAL_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/e-banking/settings" "$PORTAL_DIR/app/" 2>/dev/null || true
cp -r "$SOURCE_DIR/app/e-banking/support" "$PORTAL_DIR/app/" 2>/dev/null || true

# Copy e-banking layout
cp "$SOURCE_DIR/app/e-banking/layout.tsx" "$PORTAL_DIR/app/" 2>/dev/null || true

echo -e "${GREEN}✓ E-banking portal structure created${NC}"
echo ""

echo -e "${BLUE}Step 4: Installing dependencies...${NC}"
echo -e "${YELLOW}Installing corporate website dependencies...${NC}"
cd "$CORPORATE_DIR"
npm install lucide-react clsx tailwind-merge 2>/dev/null || true

echo -e "${YELLOW}Installing e-banking portal dependencies...${NC}"
cd "$PORTAL_DIR"
npm install lucide-react clsx tailwind-merge recharts 2>/dev/null || true

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}Step 5: Creating environment files...${NC}"
# Corporate website .env.local
cat > "$CORPORATE_DIR/.env.local" << EOF
# Corporate Website Environment Variables
NEXT_PUBLIC_PORTAL_HEALTH_URL=http://localhost:3001/api/portal/health
NEXT_PUBLIC_PORTAL_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
EOF

# E-Banking portal .env.local
cat > "$PORTAL_DIR/.env.local" << EOF
# E-Banking Portal Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CORPORATE_URL=http://localhost:3002
EOF

echo -e "${GREEN}✓ Environment files created${NC}"
echo ""

echo -e "${BLUE}Step 6: Creating Docker configuration for E-Banking Portal...${NC}"
# Create Dockerfile
cat > "$PORTAL_DIR/Dockerfile" << 'EOF'
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
EOF

# Create docker-compose.yml
cat > "$PORTAL_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  e-banking-portal:
    build: .
    ports:
      - "4000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF

echo -e "${GREEN}✓ Docker configuration created${NC}"
echo ""

echo -e "${BLUE}Step 7: Updating package.json scripts...${NC}"
# Update corporate website package.json
cd "$CORPORATE_DIR"
npm pkg set scripts.dev="next dev -p 3002"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start -p 3002"

# Update e-banking portal package.json
cd "$PORTAL_DIR"
npm pkg set scripts.dev="next dev -p 4000"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start -p 4000"
npm pkg set scripts.docker:build="docker-compose build"
npm pkg set scripts.docker:up="docker-compose up -d"
npm pkg set scripts.docker:down="docker-compose down"

echo -e "${GREEN}✓ Package.json scripts updated${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Frontend detachment complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Corporate Website: cd corporate-website && npm run dev"
echo "   → Runs on http://localhost:3002"
echo ""
echo "2. E-Banking Portal: cd e-banking-portal && npm run dev"
echo "   → Runs on http://localhost:4000"
echo ""
echo "3. Docker Deployment: cd e-banking-portal && npm run docker:up"
echo "   → Runs on http://localhost:4000 (containerized)"
echo ""
echo -e "${YELLOW}Note: Make sure the backend is running on port 3001${NC}"
