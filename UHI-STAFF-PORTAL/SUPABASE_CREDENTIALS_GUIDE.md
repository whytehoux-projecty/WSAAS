# 🎯 Supabase Credentials - Visual Guide

## Step-by-Step Instructions with Screenshots

---

## 🔐 **Step 1: Log into Supabase**

1. Go to: **<https://app.supabase.com>**
2. Click **"Sign In"**
3. Choose your login method:
   - Continue with GitHub (recommended)
   - Continue with Email

**You should see:** Your list of projects

---

## 📍 **Step 2: Select Your Project**

1. Click on your **UHI Staff Portal** project (or whatever you named it)
2. You'll be taken to the project dashboard

**What you'll see:**

```
┌─────────────────────────────────────┐
│  Project: [Your Project Name]       │
│  ┌─────────────────────────────┐   │
│  │ 🏠 Home                      │   │
│  │ 🗄️  Database                 │   │
│  │ 🔐 Authentication            │   │
│  │ 💾 Storage                   │   │
│  │ ⚙️  Settings                 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🔑 **Step 3: Get Database Connection Strings**

### 3A. Navigate to Database Settings

1. Click **⚙️ Settings** (gear icon in left sidebar)
2. Click **Database** in the settings menu

**You'll see a page with several sections**

---

### 3B. Find Your Connection Strings

Scroll down to the **"Connection string"** section.

You'll see **TWO tabs:**

#### **Tab 1: Transaction Mode** (This is what you need for Prisma!)

```
┌──────────────────────────────────────────────────────┐
│ Connection string                                     │
│ ┌──────────────┬──────────────┐                      │
│ │ Transaction  │ Session      │                      │
│ └──────────────┴──────────────┘                      │
│                                                       │
│ postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@ │
│ aws-0-us-east-1.pooler.supabase.com:6543/postgres    │
│ ?pgbouncer=true                                       │
│                                                       │
│ [Copy] button                                         │
└──────────────────────────────────────────────────────┘
```

**✅ COPY THIS!** This is your `DATABASE_URL`

---

#### **Tab 2: Session Mode** (Skip this)

You don't need this one for Prisma.

---

### 3C. Find Direct Connection String

Scroll down a bit more to **"Connection parameters"** section:

```
┌──────────────────────────────────────────────────────┐
│ Connection parameters                                 │
│                                                       │
│ Host:     db.[PROJECT-REF].supabase.co               │
│ Database: postgres                                    │
│ Port:     5432                                        │
│ User:     postgres                                    │
│ Password: [YOUR-PASSWORD]                            │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**From this, construct your DIRECT_URL:**

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## 📝 **Step 4: Extract Key Information**

From the connection strings, you need to identify:

### **1. Project Reference**

Look at your connection string:

```
postgresql://postgres.ABCDEFGHIJKLMNOP:password@...
                      ^^^^^^^^^^^^^^^^^^
                      This is your PROJECT-REF
```

**Example:** If your string has `postgres.abcdefghijklmnop`, then:

- Project Reference = `abcdefghijklmnop`

---

### **2. Region**

Look at your connection string:

```
...@aws-0-us-east-1.pooler.supabase.com:6543/...
          ^^^^^^^^^^
          This is your REGION
```

**Common regions:**

- `us-east-1` (US East)
- `us-west-1` (US West)
- `eu-west-1` (Europe West)
- `ap-southeast-1` (Asia Pacific)

---

### **3. Database Password**

⚠️ **IMPORTANT:** The password is NOT shown in the connection string!

**Where is it?**

- It's the password you set when you created the Supabase project
- If you forgot it, you can reset it:
  1. Stay on Settings → Database page
  2. Scroll to **"Database password"** section
  3. Click **"Reset database password"**
  4. Copy the new password (you won't see it again!)

---

## 🎁 **BONUS: Get API Keys (Optional)**

If you want to use Supabase features (Auth, Storage, Real-time):

### Navigate to API Settings

1. Click **⚙️ Settings** (gear icon)
2. Click **API** in the settings menu

You'll see:

```
┌──────────────────────────────────────────────────────┐
│ Project URL                                           │
│ https://[PROJECT-REF].supabase.co                    │
│ [Copy]                                                │
│                                                       │
│ API Keys                                              │
│                                                       │
│ anon public                                           │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...              │
│ [Copy]                                                │
│                                                       │
│ service_role secret                                   │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...              │
│ [Copy] [Reveal]                                       │
└──────────────────────────────────────────────────────┘
```

**Copy these if you want to use Supabase features:**

- **Project URL** → `SUPABASE_URL`
- **anon public** → `SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (click Reveal first)

---

## ✅ **Checklist - What You Need**

Before running the setup script, make sure you have:

- [ ] **Transaction Mode Connection String** (from Database settings)
- [ ] **Project Reference** (extracted from connection string)
- [ ] **Region** (extracted from connection string)
- [ ] **Database Password** (the one you set, or newly reset)
- [ ] *(Optional)* **Project URL** (from API settings)
- [ ] *(Optional)* **Anon Key** (from API settings)
- [ ] *(Optional)* **Service Role Key** (from API settings)

---

## 📋 **Example Values**

Here's what your credentials might look like:

```bash
# Example (yours will be different!)
PROJECT_REF="abcdefghijklmnop"
REGION="us-east-1"
PASSWORD="your-secure-password-123"

# Resulting connection strings:
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:your-secure-password-123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres:your-secure-password-123@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

---

## 🚀 **Ready to Continue?**

Once you have these credentials, you can:

### **Option 1: Use the Setup Script**

```bash
cd staff_backend
./setup-supabase.sh
```

Enter your credentials when prompted.

### **Option 2: Manual Setup**

Copy the connection strings directly into your `.env` file.

---

## 🆘 **Troubleshooting**

### "I can't find my project"

- Make sure you're logged into the correct Supabase account
- Check if you created the project in a different organization

### "I forgot my database password"

1. Go to Settings → Database
2. Scroll to "Database password"
3. Click "Reset database password"
4. **Copy the new password immediately** (you won't see it again!)

### "The connection string looks different"

- Make sure you're on the **"Transaction"** tab, not "Session"
- The format should include `pgbouncer=true`

### "I don't see the Settings menu"

- Make sure you clicked on your project first
- The Settings gear icon is in the left sidebar

---

## 📸 **Visual Reference**

Here's what the navigation looks like:

```
Supabase Dashboard
    ↓
[Click your project]
    ↓
Left Sidebar → ⚙️ Settings
    ↓
Settings Menu → Database
    ↓
Scroll to "Connection string"
    ↓
Click "Transaction" tab
    ↓
Click [Copy] button
    ↓
✅ You have your DATABASE_URL!
```

---

**Need help?** Let me know which step you're stuck on!
