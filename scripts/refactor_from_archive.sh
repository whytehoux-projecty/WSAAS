#!/bin/bash

# AURUM VAULT - Refactor & Detach Script
# Restores files from archive to valid new locations

set -e

ARCHIVE_PATH="archived_frontends/New_Frontend_backup_20260116_004537"
CORP_DIR="corporate-website"
PORTAL_DIR="e-banking-portal"

echo "🚀 Starting Refactor & Detach Process"
echo "From: $ARCHIVE_PATH"

# ==========================================
# 1. E-BANKING PORTAL SETUP
# ==========================================
echo "📦 Setting up E-Banking Portal..."

# Copy E-Banking pages (dashboard, accounts, etc.) to root of portal app
# We exclude 'auth' as it belongs to corporate website now
echo "   - Copying E-Banking pages..."
for dir in dashboard accounts transactions transfer bills cards beneficiaries statements settings support; do
    if [ -d "$ARCHIVE_PATH/app/e-banking/$dir" ]; then
        cp -R "$ARCHIVE_PATH/app/e-banking/$dir" "$PORTAL_DIR/app/"
    fi
done

# Copy E-Banking Layout as Root Layout
echo "   - Copying Layout..."
cp "$ARCHIVE_PATH/app/e-banking/layout.tsx" "$PORTAL_DIR/app/layout.tsx"

# Copy Components
echo "   - Copying Components..."
mkdir -p "$PORTAL_DIR/components"
cp -R "$ARCHIVE_PATH/components/banking" "$PORTAL_DIR/components/" 2>/dev/null || true
cp -R "$ARCHIVE_PATH/components/shared" "$PORTAL_DIR/components/" 2>/dev/null || true
cp -R "$ARCHIVE_PATH/components/ui" "$PORTAL_DIR/components/" 2>/dev/null || true
cp -R "$ARCHIVE_PATH/components/forms" "$PORTAL_DIR/components/" 2>/dev/null || true
cp -R "$ARCHIVE_PATH/components/charts" "$PORTAL_DIR/components/" 2>/dev/null || true

# Copy Lib & Public
echo "   - Copying Assets & Libs..."
cp -R "$ARCHIVE_PATH/lib" "$PORTAL_DIR/" 2>/dev/null || true
cp -R "$ARCHIVE_PATH/public" "$PORTAL_DIR/" 2>/dev/null || true

# ==========================================
# 2. CORPORATE WEBSITE SETUP
# ==========================================
echo "🏢 Setting up Corporate Website..."

# Copy Commercial pages (about, personal-banking, etc.)
echo "   - Copying Commercial pages..."
cp -R "$ARCHIVE_PATH/app/(commercial)" "$CORP_DIR/app/" 2>/dev/null || true

# Restore root page (Landing)
cp "$ARCHIVE_PATH/app/page.tsx" "$CORP_DIR/app/" 2>/dev/null || true
cp "$ARCHIVE_PATH/app/layout.tsx" "$CORP_DIR/app/" 2>/dev/null || true
cp "$ARCHIVE_PATH/app/globals.css" "$CORP_DIR/app/" 2>/dev/null || true

# Move Login Page (from e-banking/auth/login to app/login)
echo "   - Setting up Login Page..."
mkdir -p "$CORP_DIR/app/login"
if [ -d "$ARCHIVE_PATH/app/e-banking/auth/login" ]; then
    cp -R "$ARCHIVE_PATH/app/e-banking/auth/login/"* "$CORP_DIR/app/login/"
fi

# Copy Components
echo "   - Copying Components..."
mkdir -p "$CORP_DIR/components"
cp -R "$ARCHIVE_PATH/components/commercial" "$CORP_DIR/components/" 2>/dev/null || true
cp -R "$ARCHIVE_PATH/components/layout" "$CORP_DIR/components/" 2>/dev/null || true
cp -R "$ARCHIVE_PATH/components/ui" "$CORP_DIR/components/" 2>/dev/null || true
cp -R "$ARCHIVE_PATH/components/forms" "$CORP_DIR/components/" 2>/dev/null || true
cp -R "$ARCHIVE_PATH/components/portal" "$CORP_DIR/components/" 2>/dev/null || true

# Copy Lib & Public
echo "   - Copying Assets & Libs..."
cp -R "$ARCHIVE_PATH/lib" "$CORP_DIR/" 2>/dev/null || true
cp -R "$ARCHIVE_PATH/public" "$CORP_DIR/" 2>/dev/null || true

# Copy Configs
echo "   - Copying Configurations..."
cp "$ARCHIVE_PATH/tailwind.config.ts" "$CORP_DIR/" 2>/dev/null || true
cp "$ARCHIVE_PATH/tailwind.config.ts" "$PORTAL_DIR/" 2>/dev/null || true

echo "✅ Refactor Complete!"
