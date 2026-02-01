# Supabase Setup Guide for UHI Staff Portal

## 🎯 Overview

This guide will help you connect your UHI Staff Portal backend to Supabase cloud database while keeping Prisma as your ORM.

## 📋 Prerequisites

- ✅ Supabase account created
- ✅ Supabase project created
- ✅ Database password saved

## 🔧 Step-by-Step Setup

### Step 1: Get Your Supabase Credentials

1. **Go to Supabase Dashboard:** <https://app.supabase.com>
2. **Select your project**
3. **Navigate to:** Settings → Database
4. **Copy the following:**

#### Connection String (for Prisma)

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Direct Connection (for migrations)

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### Also note

- **Project URL:** `https://[PROJECT-REF].supabase.co`
- **Anon Key:** (from Settings → API)
- **Service Role Key:** (from Settings → API)

---

### Step 2: Update Environment Variables

#### A. Development Environment (`.env`)

Update `/staff_backend/.env`:

```env
# Database - Supabase Connection (Transaction Mode for Prisma)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (for migrations only)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase (Optional - for using Supabase features)
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Application
JWT_SECRET="dev_secret_key_change_me_32_chars_minimum!"
PORT=3000
NODE_ENV=development

# Redis (keep existing or use Supabase alternative)
REDIS_URL="redis://localhost:6379"

# Email (keep existing)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-pass
```

#### B. Test Environment (`.env.test`)

Create `/staff_backend/.env.test`:

```env
# Test Database - Supabase Connection
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&schema=test"

# Direct Connection for test migrations
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=test"

# Test Configuration
JWT_SECRET="test_secret_key_change_me_32_chars_minimum!"
NODE_ENV=test
PORT=3001

# Supabase
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
```

---

### Step 3: Update Prisma Schema

Update `/staff_backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Add this line for migrations
}

generator client {
  provider = "prisma-client-js"
}

// ... rest of your schema
```

**Why two URLs?**

- `DATABASE_URL`: Uses connection pooling (pgBouncer) for app queries
- `DIRECT_URL`: Direct connection for migrations (required by Prisma)

---

### Step 4: Push Schema to Supabase

Run these commands in order:

```bash
# Navigate to backend directory
cd staff_backend

# Generate Prisma Client
npm run prisma:generate

# Push your schema to Supabase (creates all tables)
npx prisma db push

# OR if you want to use migrations:
npx prisma migrate deploy
```

---

### Step 5: Seed Your Database

```bash
# Seed production data
npm run prisma:seed

# OR seed test data
npm run seed:test
```

---

### Step 6: Verify Connection

Test the connection:

```bash
# Test Prisma connection
npx prisma db pull

# Run a simple query
npx prisma studio
```

This will open Prisma Studio where you can browse your Supabase database!

---

## 🔒 Security Best Practices

### 1. Enable Row Level Security (RLS) in Supabase

Go to Supabase Dashboard → Authentication → Policies

**Example policy for users table:**

```sql
-- Allow users to read their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Allow service role to do everything
CREATE POLICY "Service role has full access"
ON users FOR ALL
USING (auth.role() = 'service_role');
```

### 2. Use Environment-Specific Databases

**Option 1: Separate Supabase Projects**

- Development: One Supabase project
- Production: Another Supabase project
- Testing: Use schema isolation (see below)

**Option 2: Schema Isolation (Same Project)**

```sql
-- Create separate schemas
CREATE SCHEMA IF NOT EXISTS development;
CREATE SCHEMA IF NOT EXISTS test;
CREATE SCHEMA IF NOT EXISTS production;
```

---

## 🧪 Testing with Supabase

### Option 1: Use Separate Test Schema

Update `tests/config/test.config.ts`:

```typescript
export default {
  database: {
    connectionString: process.env.DATABASE_URL || 
      'postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&schema=test'
  },
  // ... rest of config
};
```

### Option 2: Use Local Database for Tests

Keep local PostgreSQL for tests (faster, isolated):

```env
# .env.test
DATABASE_URL="postgresql://postgres:password@localhost:5432/staff_portal_test"
```

---

## 🚀 Deployment Considerations

### Environment Variables for Production

```env
# Production .env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[STRONG-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[STRONG-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

NODE_ENV=production
JWT_SECRET="[STRONG-RANDOM-SECRET-64-CHARS]"

# Use Supabase Auth (optional)
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
```

---

## 🎁 Bonus: Using Supabase Features

### 1. Real-time Subscriptions

Install Supabase client:

```bash
npm install @supabase/supabase-js
```

Create Supabase client:

```typescript
// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

Use real-time:

```typescript
// Listen to loan changes
supabase
  .channel('loans')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'loans'
  }, (payload) => {
    console.log('Loan changed:', payload);
  })
  .subscribe();
```

### 2. Storage for File Uploads

```typescript
// Upload file to Supabase Storage
const { data, error } = await supabase.storage
  .from('documents')
  .upload('public/avatar.png', file);
```

### 3. Supabase Auth (Alternative to JWT)

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

---

## 📊 Monitoring & Debugging

### Supabase Dashboard Features

1. **Database → Tables:** View/edit data
2. **Database → Logs:** See query logs
3. **Database → Roles:** Manage permissions
4. **API → Logs:** Monitor API usage
5. **Storage:** Manage uploaded files

### Prisma Studio (Local)

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

---

## 🐛 Troubleshooting

### Issue: "prepared statement already exists"

**Solution:** Use transaction mode in connection string:

```
?pgbouncer=true
```

### Issue: Migration fails

**Solution:** Use `DIRECT_URL` for migrations:

```bash
DATABASE_URL=$DIRECT_URL npx prisma migrate deploy
```

### Issue: Connection timeout

**Solution:** Check Supabase project is not paused (free tier pauses after 7 days inactivity)

### Issue: SSL error

**Solution:** Add SSL mode to connection string:

```
?sslmode=require
```

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Connection strings copied
- [ ] `.env` updated with Supabase credentials
- [ ] `.env.test` created
- [ ] `schema.prisma` updated with `directUrl`
- [ ] Prisma client generated (`npm run prisma:generate`)
- [ ] Schema pushed to Supabase (`npx prisma db push`)
- [ ] Database seeded
- [ ] Connection tested with Prisma Studio
- [ ] Tests running successfully
- [ ] RLS policies configured (optional)

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Supabase project status (not paused)
2. Verify connection string is correct
3. Check Prisma logs: `DEBUG="*" npx prisma db push`
4. Review Supabase logs in dashboard
5. Test direct connection with `psql` or database client

---

**Last Updated:** 2026-02-01
**Status:** Ready for implementation ✅
