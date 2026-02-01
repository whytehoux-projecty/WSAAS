#!/bin/bash

# Supabase Connection Diagnostic Script
# This helps you get the correct connection string from Supabase

echo "🔍 Supabase Connection Diagnostic"
echo "=================================="
echo ""

echo "Your Project Reference: lhojbfhsmfalhfpfhjvw"
echo ""

echo "📋 INSTRUCTIONS:"
echo ""
echo "1. Go to: https://app.supabase.com"
echo "2. Click on your project"
echo "3. Click 'Settings' → 'Database'"
echo "4. Scroll to 'Connection string'"
echo "5. Click the 'URI' tab (or 'Connection string' tab)"
echo ""
echo "You should see something like:"
echo ""
echo "Option A (Pooler/Transaction mode):"
echo "postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
echo ""
echo "Option B (Direct connection):"
echo "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
echo ""
echo "Option C (IPv6 format):"
echo "postgresql://postgres:[PASSWORD]@[IPv6-ADDRESS]:5432/postgres"
echo ""
echo "=================================="
echo ""
echo "❓ QUESTIONS TO ANSWER:"
echo ""
echo "1. What does the 'Host' field show in Connection Parameters?"
echo "   Current guess: db.lhojbfhsmfalhfpfhjvw.supabase.co"
echo ""
echo "2. What region is your project in?"
echo "   Options: us-east-1, us-west-1, eu-west-1, eu-central-1, ap-southeast-1"
echo "   Current guess: eu-central-1"
echo ""
echo "3. Can you copy the EXACT connection string from Supabase?"
echo "   (Replace the password with [PASSWORD] when sharing)"
echo ""
echo "=================================="
echo ""
echo "🧪 TESTING CURRENT CONFIGURATION:"
echo ""

# Test if host resolves
echo "Testing DNS resolution..."
if host db.lhojbfhsmfalhfpfhjvw.supabase.co > /dev/null 2>&1; then
    echo "✅ Host resolves: db.lhojbfhsmfalhfpfhjvw.supabase.co"
    host db.lhojbfhsmfalhfpfhjvw.supabase.co
else
    echo "❌ Cannot resolve: db.lhojbfhsmfalhfpfhjvw.supabase.co"
    echo ""
    echo "This means the hostname is incorrect."
    echo "Please get the EXACT host from Supabase Dashboard."
fi

echo ""
echo "Testing pooler host..."
if host aws-0-eu-central-1.pooler.supabase.com > /dev/null 2>&1; then
    echo "✅ Pooler host resolves: aws-0-eu-central-1.pooler.supabase.com"
else
    echo "❌ Cannot resolve pooler host"
    echo "Your region might be different from eu-central-1"
fi

echo ""
echo "=================================="
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "1. Go to Supabase Dashboard → Settings → Database"
echo "2. Copy the EXACT connection string shown there"
echo "3. Share it here (replace password with [PASSWORD])"
echo "4. I'll update your .env file with the correct values"
echo ""
