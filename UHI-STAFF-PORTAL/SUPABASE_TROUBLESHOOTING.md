# 🚨 Supabase Connection Troubleshooting

## Current Status

✅ **Completed:**

- `.env` file created with Supabase credentials
- `.env.test` file created
- Prisma schema updated with `directUrl`
- Prisma Client generated
- Password URL-encoded (`@` → `%40`)

❌ **Issue:**

- Cannot connect to Supabase database
- Error: `Can't reach database server at db.lhojbfhsmfalhfpfhjvw.supabase.co:5432`

---

## Most Likely Cause: Supabase Project Paused

**Supabase Free Tier** pauses projects after 7 days of inactivity.

### ✅ Solution: Wake Up Your Project

1. **Go to:** <https://app.supabase.com>
2. **Click your project:** UHI Staff Portal
3. **Look for a message** saying "Project paused"
4. **Click "Restore project"** or "Resume"
5. **Wait 1-2 minutes** for the database to start

**Then try again:**

```bash
cd staff_backend
npx prisma db push
```

---

## Other Possible Causes

### 1. Network/Firewall Issue

**Test connection with psql:**

```bash
PGPASSWORD='78901234@UHI_Portal' psql -h db.lhojbfhsmfalhfpfhjvw.supabase.co -U postgres -d postgres -p 5432
```

If this fails, it's a network issue.

---

### 2. Wrong Password

**Reset your password:**

1. Go to Supabase Dashboard
2. Settings → Database
3. Scroll to "Database password"
4. Click "Reset database password"
5. Copy the new password
6. Update `.env` file (remember to URL-encode special characters)

**URL Encoding Reference:**

- `@` → `%40`
- `!` → `%21`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`

---

### 3. Wrong Region

Your connection string uses `aws-0-eu-central-1` but Supabase might be in a different region.

**Check your actual region:**

1. Go to Supabase Dashboard → Settings → General
2. Look for "Region"
3. Update `.env` if different

**Common regions:**

- `aws-0-us-east-1` (US East)
- `aws-0-us-west-1` (US West)
- `aws-0-eu-west-1` (Europe West)
- `aws-0-eu-central-1` (Europe Central)
- `aws-0-ap-southeast-1` (Asia Pacific)

---

### 4. IPv6 Issue

Some networks block IPv6. Try using IPv4:

```bash
# Test with IPv4
ping -4 db.lhojbfhsmfalhfpfhjvw.supabase.co
```

---

## Quick Diagnostic Commands

### Test 1: Can you reach the host?

```bash
ping db.lhojbfhsmfalhfpfhjvw.supabase.co
```

### Test 2: Is port 5432 open?

```bash
nc -zv db.lhojbfhsmfalhfpfhjvw.supabase.co 5432
```

### Test 3: Can psql connect?

```bash
PGPASSWORD='78901234@UHI_Portal' psql -h db.lhojbfhsmfalhfpfhjvw.supabase.co -U postgres -d postgres -p 5432
```

### Test 4: Try the pooler connection

```bash
PGPASSWORD='78901234@UHI_Portal' psql -h aws-0-eu-central-1.pooler.supabase.com -U postgres.lhojbfhsmfalhfpfhjvw -d postgres -p 6543
```

---

## Alternative: Use Session Mode Instead

If Transaction mode doesn't work, try Session mode:

**Update `.env`:**

```env
DATABASE_URL="postgresql://postgres:78901234%40UHI_Portal@db.lhojbfhsmfalhfpfhjvw.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:78901234%40UHI_Portal@db.lhojbfhsmfalhfpfhjvw.supabase.co:5432/postgres"
```

**Update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Remove directUrl temporarily
}
```

---

## Fallback: Use Local PostgreSQL

If Supabase connection continues to fail, you can temporarily use local PostgreSQL:

**Update `.env`:**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/staff_portal"
```

**Start local PostgreSQL:**

```bash
# macOS with Homebrew
brew services start postgresql@14

# Or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14
```

---

## Next Steps After Connection Works

Once you can connect:

```bash
# 1. Push schema to Supabase
npx prisma db push

# 2. Seed database
npm run seed:test

# 3. Test connection
npx prisma studio

# 4. Run tests
npm run test:integration

# 5. Start server
npm run dev
```

---

## Contact Supabase Support

If nothing works:

1. **Check Supabase Status:** <https://status.supabase.com>
2. **Supabase Discord:** <https://discord.supabase.com>
3. **GitHub Issues:** <https://github.com/supabase/supabase/issues>

---

## Current Connection Strings

**Your configured connection strings:**

**Transaction Mode (Pooled):**

```
postgresql://postgres.lhojbfhsmfalhfpfhjvw:78901234%40UHI_Portal@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct Connection:**

```
postgresql://postgres:78901234%40UHI_Portal@db.lhojbfhsmfalhfpfhjvw.supabase.co:5432/postgres
```

**Project URL:**

```
https://lhojbfhsmfalhfpfhjvw.supabase.co
```

---

## Summary

**Most likely issue:** Project is paused (free tier)

**Quick fix:**

1. Go to <https://app.supabase.com>
2. Click your project
3. Click "Restore" if paused
4. Wait 1-2 minutes
5. Run `npx prisma db push`

**If that doesn't work:**

- Check network connectivity
- Verify password is correct
- Try Session mode instead of Transaction mode
- Use local PostgreSQL temporarily

---

**Created:** 2026-02-01
**Status:** Awaiting project resume
