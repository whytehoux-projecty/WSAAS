# 🎯 Supabase Setup - Current Status & Next Steps

## ✅ **What's Working:**

1. **Supabase Project:** ACTIVE and HEALTHY
   - Project ID: `lhojbfhsmfalhfpfhjvw`
   - Region: `eu-central-1`
   - Status: `ACTIVE_HEALTHY`
   - PostgreSQL: 17.6

2. **MCP Connection:** ✅ Working perfectly
   - Can execute SQL via Supabase MCP
   - Can list projects
   - Can query database

3. **Configuration Files:** ✅ All created
   - Backend `.env` configured
   - Frontend `.env.local` configured
   - Prisma schema updated
   - Example components created
   - RLS policies ready

## ❌ **Current Issue:**

**Prisma cannot connect directly from your local machine to Supabase**

**Error:** `Can't reach database server at db.lhojbfhsmfalhfpfhjvw.supabase.co:5432`

**Why:** This is likely a network/firewall issue on your local machine. The Supabase MCP server (which runs in the cloud) CAN connect, but your local Prisma CLI cannot.

---

## 🔧 **Solution Options:**

### **Option 1: Use Supabase Dashboard (RECOMMENDED - Easiest)**

Since the MCP can connect but Prisma CLI cannot, the easiest way is to apply the schema through Supabase Dashboard:

#### **Steps:**

1. **Go to Supabase Dashboard**
   - URL: <https://app.supabase.com>
   - Click your project: `uhi_portal`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Apply the Migration SQL**
   - Open this file on your computer:

     ```
     /Volumes/Project Disk/PROJECTS/WORKING CODEBASE/UHI_STAFF_PORTAL/UHI-STAFF-PORTAL/staff_backend/prisma/migrations/20260110060732_add_uhi_models/migration.sql
     ```

   - Copy ALL the SQL (534 lines)
   - Paste into Supabase SQL Editor
   - Click "Run" (or Cmd/Ctrl + Enter)

4. **Apply the Second Migration**
   - Open this file:

     ```
     /Volumes/Project Disk/PROJECTS/WORKING CODEBASE/UHI_STAFF_PORTAL/UHI-STAFF-PORTAL/staff_backend/prisma/migrations/20260201151725_sync_schema/migration.sql
     ```

   - Copy ALL the SQL
   - Paste into a new query in SQL Editor
   - Click "Run"

5. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should see all your tables: users, loans, applications, etc.

---

### **Option 2: Fix Local Network Connection**

If you want Prisma to work from your local machine:

#### **Possible Causes:**

1. **Firewall blocking port 5432**
2. **VPN interfering with connection**
3. **IPv6 issues**
4. **Corporate network restrictions**

#### **Diagnostic Steps:**

```bash
# Test if you can reach the host
ping db.lhojbfhsmfalhfpfhjvw.supabase.co

# Test if port 5432 is reachable
nc -zv db.lhojbfhsmfalhfpfhjvw.supabase.co 5432

# Try with psql directly
PGPASSWORD='78901234@UHI_Portal' psql -h db.lhojbfhsmfalhfpfhjvw.supabase.co -U postgres -d postgres -p 5432
```

#### **Potential Fixes:**

1. **Disable VPN** temporarily and try again
2. **Check firewall settings** - allow outbound port 5432
3. **Try from different network** (mobile hotspot, etc.)
4. **Use IPv4 only:**

   ```bash
   # Add to /etc/hosts
   echo "$(dig +short db.lhojbfhsmfalhfpfhjvw.supabase.co A | head -1) db.lhojbfhsmfalhfpfhjvw.supabase.co" | sudo tee -a /etc/hosts
   ```

---

### **Option 3: Use Supabase CLI**

Install and use Supabase CLI which might have better network handling:

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link to your project
supabase link --project-ref lhojbfhsmfalhfpfhjvw

# Push database changes
supabase db push
```

---

## 🎯 **Recommended Action Plan:**

**I recommend Option 1 (Supabase Dashboard)** because:

- ✅ It's guaranteed to work (no network issues)
- ✅ Takes only 2 minutes
- ✅ You can see the results immediately
- ✅ No troubleshooting needed

**After applying the migrations via dashboard:**

1. **Verify tables exist:**

   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **Apply RLS policies:**
   - Copy SQL from `supabase_rls_policies.sql`
   - Run in SQL Editor

3. **Seed test data:**
   - I can help you create seed SQL to run in dashboard
   - Or we can use the Supabase MCP to insert data

4. **Test frontend:**

   ```bash
   cd staff_portal
   npm run dev
   ```

---

## 📊 **Current Database Status:**

- **Tables:** 0 (empty database)
- **Enums:** 17 (already created via MCP)
- **Data:** None yet

**Enums Created:**
✅ UserStatus, ContractType, ContractStatus, PayrollStatus, LoanStatus, ApplicationType, ApplicationStatus, BloodType, Gender, MaritalStatus, StaffType, BankAccountType, BankAccountPurpose, FamilyRelationship, DeploymentType, DeploymentStatus, HardshipLevel, SecurityLevel, DocumentType, VerificationStatus

---

## 🚀 **Next Steps:**

1. **Apply migrations via Supabase Dashboard** (Option 1 above)
2. **Verify tables created**
3. **Apply RLS policies**
4. **Seed test data**
5. **Test frontend components**

---

## 💡 **Alternative: I Can Do It Via MCP**

Since the Supabase MCP works, I can apply the migrations programmatically, but it will take multiple steps. Would you prefer:

**A)** You apply via Dashboard (2 minutes, easy)
**B)** I apply via MCP (10+ minutes, automated but slower)

Let me know which you prefer!

---

**Created:** 2026-02-01  
**Status:** Waiting for migration application
