# 🚀 Supabase Quick Start - UHI Staff Portal

## ⚡ 3-Minute Setup

### 1️⃣ Get Your Supabase Info

Go to: <https://app.supabase.com> → Your Project → Settings → Database

**You need:**

- Project Reference: `abcdefghijklmnop` (from URL)
- Database Password: (the one you set during project creation)
- Region: `us-east-1` (or your region)

---

### 2️⃣ Run Setup Script

```bash
cd staff_backend
./setup-supabase.sh
```

**The script will:**

- ✅ Create `.env` with Supabase connection
- ✅ Create `.env.test` for testing
- ✅ Update Prisma schema
- ✅ Generate Prisma Client
- ✅ Push schema to Supabase
- ✅ Seed database (optional)

---

### 3️⃣ Verify Setup

```bash
# Test connection
npx prisma studio

# Run tests
npm run test:integration

# Start server
npm run dev
```

---

## 🔑 Manual Setup (Alternative)

If you prefer manual setup:

### Step 1: Update `.env`

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Step 2: Update `prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Add this line
}
```

### Step 3: Push Schema

```bash
npx prisma generate
npx prisma db push
npm run seed:test
```

---

## 📍 Where to Find Credentials

### Supabase Dashboard Navigation

```
Dashboard
  └─ Settings (⚙️)
      └─ Database
          ├─ Connection string → Copy "Transaction" mode
          ├─ Connection pooling → Use port 6543
          └─ Host → db.[PROJECT-REF].supabase.co
```

### API Keys (for Supabase features)

```
Dashboard
  └─ Settings (⚙️)
      └─ API
          ├─ Project URL
          ├─ anon public key
          └─ service_role secret key
```

---

## 🎯 Connection String Format

### For Prisma (Pooled - Use This!)

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### For Migrations (Direct)

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `.env` file exists with Supabase URLs
- [ ] `npx prisma studio` opens successfully
- [ ] Can see tables in Prisma Studio
- [ ] `npm run dev` starts without errors
- [ ] Can login to app
- [ ] Tests pass: `npm run test:integration`

---

## 🐛 Quick Troubleshooting

### "Connection timeout"

→ Check Supabase project is not paused (Settings → General)

### "prepared statement already exists"

→ Add `?pgbouncer=true` to connection string

### "Migration failed"

→ Use `DIRECT_URL` for migrations:

```bash
DATABASE_URL=$DIRECT_URL npx prisma migrate deploy
```

### "Invalid password"

→ Reset password: Settings → Database → Reset database password

---

## 📚 Next Steps

1. **Enable RLS:** Settings → Authentication → Policies
2. **Set up backups:** Settings → Database → Backups
3. **Monitor usage:** Dashboard → Reports
4. **Add real-time:** See `SUPABASE_SETUP_GUIDE.md`

---

## 🆘 Need Help?

1. Check full guide: `SUPABASE_SETUP_GUIDE.md`
2. Supabase Docs: <https://supabase.com/docs>
3. Prisma + Supabase: <https://www.prisma.io/docs/guides/database/supabase>

---

**Created:** 2026-02-01
**Status:** Ready to use ✅
