# 🎯 Complete Supabase Setup Checklist

## Step-by-Step Guide to Complete Your Setup

---

## ✅ **STEP 1: Wake Up Supabase Project** (DO THIS FIRST!)

### Instructions

1. **Open your browser** and go to: <https://app.supabase.com>
2. **Log in** to your account
3. **Find your project** (look for reference: `lhojbfhsmfalhfpfhjvw`)
4. **Check the status:**
   - If it says **"Paused"** or **"Inactive"**: Click **"Restore"** or **"Resume"**
   - Wait 1-2 minutes for it to start
   - Status should change to **"Active"** (green indicator)

### How to know it's ready

- ✅ Status shows "Active" or green checkmark
- ✅ You can click into the project dashboard
- ✅ No "paused" or "inactive" messages

---

## ✅ **STEP 2: Test Backend Connection**

Once your Supabase project is active, test the connection:

```bash
cd /Volumes/Project\ Disk/PROJECTS/WORKING\ CODEBASE/UHI_STAFF_PORTAL/UHI-STAFF-PORTAL/staff_backend

# Test connection
npx prisma db pull
```

### Expected Result

```
✔ Introspecting based on datasource defined in prisma/schema.prisma
✔ Introspected 15 models and wrote them into prisma/schema.prisma
```

### If it fails

- Go back to Step 1 and make sure project is truly active
- Check `SUPABASE_TROUBLESHOOTING.md` for solutions

---

## ✅ **STEP 3: Push Schema to Supabase**

Create all your tables in Supabase:

```bash
# Still in staff_backend directory
npx prisma db push
```

### Expected Result

```
✔ Generated Prisma Client
✔ The database is now in sync with your Prisma schema
```

### What this does

- Creates all tables (users, loans, applications, etc.)
- Sets up relationships
- Creates indexes

---

## ✅ **STEP 4: Seed Test Data**

Add sample data to your database:

```bash
npm run seed:test
```

### Expected Result

```
✔ Seeded test users
✔ Seeded test loans
✔ Seeded test applications
```

### What this creates

- Test users (admin, staff, manager)
- Sample loans
- Sample applications
- Sample payroll records

---

## ✅ **STEP 5: Verify with Prisma Studio**

Open a visual database browser:

```bash
npx prisma studio
```

### Expected Result

- Browser opens at `http://localhost:5555`
- You can see all your tables
- You can browse the seeded data

### What to check

- ✅ Users table has test users
- ✅ Loans table has sample loans
- ✅ Applications table has sample applications

---

## ✅ **STEP 6: Set Up Row Level Security**

Secure your database so users can only access their own data:

### Instructions

1. **Go to Supabase Dashboard** → Your Project
2. **Click "SQL Editor"** in the left sidebar
3. **Click "New query"**
4. **Open the file:** `supabase_rls_policies.sql` (in your project root)
5. **Copy ALL the SQL** from that file
6. **Paste into Supabase SQL Editor**
7. **Click "Run"** (or press Cmd/Ctrl + Enter)

### Expected Result

```
Success. No rows returned
```

### What this does

- Enables Row Level Security on all tables
- Creates policies so users can only see their own data
- Allows backend (service role) full access
- Protects sensitive data

### Verify it worked

Run this query in SQL Editor:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

You should see `rowsecurity = true` for all tables.

---

## ✅ **STEP 7: Install Frontend Dependencies**

Set up the frontend to use Supabase:

```bash
cd /Volumes/Project\ Disk/PROJECTS/WORKING\ CODEBASE/UHI_STAFF_PORTAL/UHI-STAFF-PORTAL/staff_portal

# Install Supabase client
npm install @supabase/supabase-js

# Install React Query (recommended)
npm install @tanstack/react-query
```

---

## ✅ **STEP 8: Test Frontend Connection**

Create a test page to verify frontend can connect:

### Create file: `staff_portal/app/test/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [status, setStatus] = useState('Testing...');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function test() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('staff_id, first_name, last_name, email')
          .limit(5);

        if (error) {
          setStatus(`Error: ${error.message}`);
        } else {
          setStatus('✅ Connection successful!');
          setUsers(data || []);
        }
      } catch (err) {
        setStatus(`Error: ${err}`);
      }
    }
    test();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <p className="mb-4">{status}</p>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(users, null, 2)}
      </pre>
    </div>
  );
}
```

### Test it

```bash
# Start frontend
npm run dev

# Open browser
# Go to: http://localhost:3001/test
```

### Expected Result

- ✅ Page shows "Connection successful!"
- ✅ Shows list of users from database

---

## ✅ **STEP 9: Run Backend Tests**

Test that everything works:

```bash
cd /Volumes/Project\ Disk/PROJECTS/WORKING\ CODEBASE/UHI_STAFF_PORTAL/UHI-STAFF-PORTAL/staff_backend

npm run test:integration
```

### Expected Result

- Tests should pass now that database is connected
- Auth tests should work
- Applications/Loans tests should work

---

## ✅ **STEP 10: Use Example Components**

I've created 3 ready-to-use components for you:

### 1. **UsersList Component**

File: `staff_portal/components/UsersList.tsx`

**Features:**

- Displays all active users
- Real-time updates
- Search functionality
- Modern UI with avatars

**Usage:**

```typescript
import UsersList from '@/components/UsersList';

export default function UsersPage() {
  return <UsersList />;
}
```

---

### 2. **LoansDashboard Component**

File: `staff_portal/components/LoansDashboard.tsx`

**Features:**

- Shows all loans with statistics
- Filter by status (active, pending, completed)
- Progress bars for active loans
- Real-time updates

**Usage:**

```typescript
import LoansDashboard from '@/components/LoansDashboard';

export default function LoansPage() {
  return <LoansDashboard />;
}
```

---

### 3. **ApplicationsManager Component**

File: `staff_portal/components/ApplicationsManager.tsx`

**Features:**

- Create new applications
- View all applications
- Withdraw pending applications
- Real-time status updates

**Usage:**

```typescript
import ApplicationsManager from '@/components/ApplicationsManager';

export default function ApplicationsPage() {
  return <ApplicationsManager />;
}
```

---

## 📚 **Documentation Reference**

I've created comprehensive guides for you:

1. **`FRONTEND_SUPABASE_GUIDE.md`** - How to use Supabase in Next.js
2. **`SUPABASE_SETUP_GUIDE.md`** - Complete backend setup
3. **`SUPABASE_TROUBLESHOOTING.md`** - Fix connection issues
4. **`SUPABASE_QUICKSTART.md`** - Quick reference
5. **`supabase_rls_policies.sql`** - Security policies

---

## 🎯 **Quick Command Reference**

### Backend Commands

```bash
cd staff_backend

# Test connection
npx prisma db pull

# Push schema
npx prisma db push

# Seed data
npm run seed:test

# Open database browser
npx prisma studio

# Run tests
npm run test:integration

# Start backend
npm run dev
```

### Frontend Commands

```bash
cd staff_portal

# Install dependencies
npm install

# Start frontend
npm run dev

# Build for production
npm run build
```

---

## ✅ **Completion Checklist**

Mark these off as you complete them:

- [ ] Step 1: Supabase project is active
- [ ] Step 2: Backend connection tested (`npx prisma db pull` works)
- [ ] Step 3: Schema pushed to Supabase (`npx prisma db push` works)
- [ ] Step 4: Test data seeded
- [ ] Step 5: Prisma Studio opens and shows data
- [ ] Step 6: Row Level Security policies applied
- [ ] Step 7: Frontend dependencies installed
- [ ] Step 8: Frontend connection test passes
- [ ] Step 9: Backend tests pass
- [ ] Step 10: Example components working

---

## 🆘 **If You Get Stuck**

### Connection Issues

1. Check Supabase project status (must be "Active")
2. Verify `.env` file has correct credentials
3. Check password is URL-encoded (`@` → `%40`)
4. See `SUPABASE_TROUBLESHOOTING.md`

### RLS Issues

1. Make sure policies are applied
2. Check you're using correct key (Anon for frontend, Service for backend)
3. Test with Service Role Key first (bypasses RLS)

### Frontend Issues

1. Check `.env.local` exists and has `NEXT_PUBLIC_` prefix
2. Restart Next.js dev server after changing `.env.local`
3. Check browser console for errors

---

## 🎉 **Success Indicators**

You'll know everything is working when:

✅ Prisma Studio shows your tables and data  
✅ Backend tests pass  
✅ Frontend test page shows users  
✅ Example components display data  
✅ Real-time updates work (change data in Prisma Studio, see it update in frontend)  

---

## 🚀 **Next Steps After Setup**

Once everything is working:

1. **Customize the components** for your needs
2. **Add authentication** (Supabase Auth or custom JWT)
3. **Build more features** using the examples as templates
4. **Deploy to production** (Vercel for frontend, Railway/Render for backend)
5. **Monitor usage** in Supabase Dashboard

---

**Created:** 2026-02-01  
**Status:** Ready to follow! 🎯

**Start with Step 1 and work your way down. Come back here if you need help!**
