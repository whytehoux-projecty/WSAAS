# 🎨 Frontend Supabase Integration Guide

## UHI Staff Portal - Next.js + Supabase

This guide shows you how to use Supabase in your Next.js frontend (`staff_portal/`).

---

## ⚠️ Important: Backend vs Frontend

### Backend (`staff_backend/`)

- Uses **Prisma** as ORM
- Connects to Supabase **PostgreSQL database**
- Uses `DATABASE_URL` and `DIRECT_URL`
- Uses **Service Role Key** (admin access)

### Frontend (`staff_portal/`)

- Uses **Supabase JS Client**
- Connects to Supabase **API**
- Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Uses **Anon Key** (public, row-level security)

**Both can work together!** Backend handles complex logic, frontend handles UI and real-time features.

---

## 🚀 Setup (Already Done!)

✅ **Files Created:**

1. `.env.local` - Environment variables
2. `lib/supabase.ts` - Supabase client
3. `examples/supabase-example.tsx` - Example component

---

## 📦 Installation

```bash
cd staff_portal
npm install @supabase/supabase-js
```

---

## 🔑 Environment Variables

**File:** `staff_portal/.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lhojbfhsmfalhfpfhjvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

**Note:** In Next.js, variables must start with `NEXT_PUBLIC_` to be accessible in the browser.

---

## 🛠️ Usage Examples

### 1. **Fetch Data from Supabase**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'active');

      if (data) setUsers(data);
    }

    fetchUsers();
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.first_name}</div>
      ))}
    </div>
  );
}
```

---

### 2. **Insert Data**

```typescript
const { data, error } = await supabase
  .from('applications')
  .insert({
    user_id: userId,
    type: 'leave',
    status: 'pending',
    start_date: '2026-02-01',
    end_date: '2026-02-05',
  });

if (error) console.error('Error:', error);
```

---

### 3. **Update Data**

```typescript
const { data, error } = await supabase
  .from('users')
  .update({ status: 'inactive' })
  .eq('id', userId);
```

---

### 4. **Delete Data**

```typescript
const { error } = await supabase
  .from('applications')
  .delete()
  .eq('id', applicationId);
```

---

### 5. **Real-time Subscriptions** 🔥

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LiveLoans() {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetchLoans();

    // Subscribe to changes
    const channel = supabase
      .channel('loans-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'loans',
        },
        (payload) => {
          console.log('Loan changed:', payload);
          fetchLoans(); // Refresh data
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLoans() {
    const { data } = await supabase.from('loans').select('*');
    if (data) setLoans(data);
  }

  return <div>{/* Render loans */}</div>;
}
```

---

### 6. **Authentication with Supabase Auth** (Optional)

If you want to use Supabase's built-in auth instead of your custom JWT:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

---

## 🎯 Recommended Approach for UHI Portal

### **Hybrid Strategy:**

1. **Use Backend API for:**
   - Complex business logic
   - Multi-table transactions
   - Sensitive operations
   - PDF generation
   - Email sending

2. **Use Supabase Client for:**
   - Simple CRUD operations
   - Real-time updates
   - File uploads (Supabase Storage)
   - Quick prototyping

### **Example: Loan Application**

```typescript
// Option 1: Use your backend API (recommended for complex logic)
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/finance/loans/apply`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(loanData),
});

// Option 2: Use Supabase directly (for simple reads)
const { data: loans } = await supabase
  .from('loans')
  .select('*')
  .eq('user_id', userId);
```

---

## 🔒 Row Level Security (RLS)

**Important:** Enable RLS in Supabase to secure your data!

### Example Policy (in Supabase Dashboard)

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);
```

**Without RLS, anyone with the Anon Key can access ALL data!**

---

## 🎨 Using with React Query (Recommended)

For better data management, use React Query:

```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
}

// Usage
function UsersPage() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render users */}</div>;
}
```

---

## 📁 File Structure

```
staff_portal/
├── .env.local                 # Environment variables
├── lib/
│   └── supabase.ts           # Supabase client
├── hooks/
│   ├── useUsers.ts           # Custom hook for users
│   ├── useLoans.ts           # Custom hook for loans
│   └── useApplications.ts    # Custom hook for applications
├── components/
│   ├── UsersList.tsx
│   └── LoanForm.tsx
└── app/
    ├── users/
    │   └── page.tsx
    └── loans/
        └── page.tsx
```

---

## 🐛 Common Issues

### 1. "Missing environment variables"

**Solution:** Make sure variables start with `NEXT_PUBLIC_`

### 2. "Row Level Security" errors

**Solution:** Either:

- Disable RLS (not recommended for production)
- Create proper RLS policies
- Use Service Role Key (backend only!)

### 3. "CORS errors"

**Solution:** Supabase handles CORS automatically. If you see CORS errors, check:

- Are you using the correct URL?
- Is your project paused?

---

## 🔄 Backend + Frontend Together

### Example: Create Loan Application

**Frontend (Next.js):**

```typescript
async function createLoan(loanData) {
  // Call your backend API
  const response = await fetch('/api/v1/finance/loans/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(loanData),
  });

  return response.json();
}
```

**Backend (Express + Prisma):**

```typescript
// Your backend handles the complex logic
app.post('/api/v1/finance/loans/apply', async (req, res) => {
  // Validate
  // Calculate interest
  // Create loan with Prisma
  // Send email
  // Return response
});
```

**Frontend subscribes to changes:**

```typescript
// Real-time updates when backend creates/updates loans
supabase
  .channel('loans')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, 
    (payload) => {
      // Update UI in real-time
    }
  )
  .subscribe();
```

---

## ✅ Checklist

- [ ] Install `@supabase/supabase-js`
- [ ] Create `.env.local` with Supabase credentials
- [ ] Create `lib/supabase.ts` client
- [ ] Test connection with simple query
- [ ] Enable RLS policies in Supabase dashboard
- [ ] Decide: Use backend API or Supabase client?
- [ ] Implement real-time features (optional)
- [ ] Add error handling and loading states

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Created:** 2026-02-01
**Status:** Ready to use ✅
