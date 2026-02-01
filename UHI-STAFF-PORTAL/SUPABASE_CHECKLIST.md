# ✅ Supabase Credentials Checklist

## Quick Reference - Fill This Out

```
┌─────────────────────────────────────────────────────────┐
│                 SUPABASE CREDENTIALS                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Project Reference:  _______________________________    │
│                                                          │
│  Region:            _______________________________     │
│                                                          │
│  Database Password: _______________________________     │
│                                                          │
│  ─────────────────────────────────────────────────      │
│                                                          │
│  Transaction URL:                                        │
│  ________________________________________________        │
│  ________________________________________________        │
│                                                          │
│  Direct URL:                                             │
│  ________________________________________________        │
│  ________________________________________________        │
│                                                          │
│  ─────────────────────────────────────────────────      │
│  OPTIONAL (for Supabase features):                      │
│                                                          │
│  Project URL:       _______________________________     │
│                                                          │
│  Anon Key:          _______________________________     │
│                                                          │
│  Service Role Key:  _______________________________     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📍 Where to Find Each Item

| Item | Location | How to Get It |
|------|----------|---------------|
| **Project Reference** | Connection string | Extract from `postgres.XXXXX` |
| **Region** | Connection string | Extract from `aws-0-XXXXX` |
| **Database Password** | You set this | Or reset in Settings → Database |
| **Transaction URL** | Settings → Database | Click "Transaction" tab, copy |
| **Direct URL** | Settings → Database | Use connection parameters |
| **Project URL** | Settings → API | Copy from top |
| **Anon Key** | Settings → API | Copy from "anon public" |
| **Service Role Key** | Settings → API | Click "Reveal", then copy |

---

## 🎯 Navigation Path

```
1. Go to: https://app.supabase.com
2. Sign in
3. Click your project
4. Click ⚙️ Settings (left sidebar)
5. Click "Database"
6. Scroll to "Connection string"
7. Click "Transaction" tab
8. Click [Copy]
```

---

## 💡 Quick Tips

- ✅ Use **Transaction mode** connection string (has `pgbouncer=true`)
- ✅ Save your password somewhere safe (password manager)
- ✅ The Project Reference is in the connection string
- ✅ You can reset your password anytime in Settings → Database
- ⚠️ Don't share your Service Role Key publicly (it has admin access)

---

## 🚀 Once You Have Everything

Run this command:

```bash
cd staff_backend
./setup-supabase.sh
```

Or manually create `.env`:

```env
DATABASE_URL="[paste Transaction URL here]"
DIRECT_URL="[paste Direct URL here]"
```

---

**Status:** [ ] Not started  [ ] In progress  [ ] Complete ✅
