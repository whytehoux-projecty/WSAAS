# Phase 2, Task 2.2 - Mismatched Endpoints Documentation

**Date:** 2026-01-17  
**Project:** AURUM VAULT Banking Integration  
**Task:** Detailed analysis and refactoring guidance for endpoint mismatches

---

## Executive Summary

This document provides **detailed refactoring guidance** for the 8 endpoints that exist in the backend but don't match frontend expectations. For each mismatch, we provide:

- Current backend implementation
- Frontend expectation
- Root cause analysis
- Multiple refactoring approaches
- Recommended solution with code
- Effort estimation

---

## Mismatch Categories

| Category | Count | Type |
|----------|-------|------|
| Path Mismatch | 4 | Different URL paths |
| Field Mismatch | 2 | Different field names |
| Data Structure | 2 | Different response formats |

---

## 1. Login Endpoint - Field Name Mismatch

**Frontend Endpoint:** `POST /api/auth/login`  
**Backend Endpoint:** `POST /api/auth/login`  
**Status:** ⚠️ Partial Match  
**Priority:** 🔴 Critical

### Current Backend Implementation

**File:** `/backend/core-api/src/routes/auth.ts`

**Expects:**

```typescript
{
  email: string;        // Email address
  password: string;
}
```

**Validation:**

```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

**Query:**

```typescript
const user = await prisma.user.findUnique({
  where: { email: credentials.email }
});
```

### Frontend Expectation

**Corporate Website** (`/app/login/page.tsx` line 72):

```typescript
// UI collects "Account Number" but sends as email field
body: JSON.stringify({
  email: formData.accountNumber,  // ⚠️ Account number, not email!
  password: formData.password,
})
```

**E-Banking Portal** (`/lib/api-client.ts` line 191):

```typescript
login: async (credentials: { accountNumber: string; password: string }) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  // Sends: { accountNumber: "...", password: "..." }
}
```

### Root Cause Analysis

1. **UI/UX Decision:** Frontend uses "Account Number" for better user experience
2. **Backend Design:** Backend was designed for email-based authentication
3. **Workaround:** Corporate website sends account number as `email` field
4. **Type Mismatch:** E-Banking portal sends `accountNumber` field (not `email`)

### Impact

- 🔴 **Corporate Website:** Works with workaround but confusing
- 🔴 **E-Banking Portal:** Login fails - backend doesn't recognize `accountNumber` field
- 🔴 **Validation:** Email validation fails for account numbers (numeric)

### Refactoring Options

#### Option A: Backend Accepts Both (Recommended)

**Pros:**

- ✅ Backward compatible with email login
- ✅ Supports account number login
- ✅ Minimal frontend changes
- ✅ Flexible authentication

**Cons:**

- ⚠️ Slightly more complex validation
- ⚠️ Need to query by email OR account number

**Implementation:**

```typescript
// Update validation schema
const loginSchema = z.object({
  email: z.string().optional(),
  accountNumber: z.string().optional(),
  password: z.string().min(1),
}).refine(
  data => data.email || data.accountNumber,
  { message: 'Either email or account number is required' }
);

// Update login handler
export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const credentials = loginSchema.parse(request.body);

    // Query by email OR account number
    let user;
    if (credentials.email) {
      user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });
    } else if (credentials.accountNumber) {
      // Find user by account number
      const account = await prisma.account.findUnique({
        where: { accountNumber: credentials.accountNumber },
        include: { user: true }
      });
      user = account?.user;
    }

    if (!user) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_CREDENTIALS,
          message: 'Invalid credentials'
        }
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isValidPassword) {
      // Update login attempts...
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.INVALID_CREDENTIALS,
          message: 'Invalid credentials'
        }
      });
    }

    // Generate tokens...
    // Rest of login logic...
  } catch (error) {
    // Error handling...
  }
};
```

**Effort:** 2-3 hours

---

#### Option B: Frontend Uses Email Only

**Pros:**

- ✅ No backend changes
- ✅ Simpler validation

**Cons:**

- ❌ Poor UX (users expect account number)
- ❌ Requires frontend changes in multiple places
- ❌ Need to educate users

**Implementation:**

```typescript
// Corporate Website - Change UI to collect email
<input
  type="email"
  placeholder="Enter your email address"
  // ...
/>
```

**Effort:** 4-6 hours (UI changes + testing)

---

#### Option C: Separate Endpoint for Account Number Login

**Pros:**

- ✅ Clear separation of concerns
- ✅ Backward compatible

**Cons:**

- ❌ Duplicate code
- ❌ More endpoints to maintain
- ❌ Frontend needs to know which endpoint to use

**Implementation:**

```typescript
// Add new endpoint
fastify.post('/auth/login-by-account', async (request, reply) => {
  // Similar to login but expects accountNumber
});
```

**Effort:** 3-4 hours

---

### Recommended Solution

**Option A: Backend Accepts Both**

**Rationale:**

- Best user experience
- Flexible authentication
- Minimal changes required
- Future-proof design

**Implementation Steps:**

1. **Update validation schema** in `/backend/core-api/src/routes/auth.ts`
2. **Modify login handler** to query by email OR account number
3. **Update E-Banking Portal** to send `accountNumber` field
4. **Test both authentication methods**

**Files to Modify:**

- `/backend/core-api/src/routes/auth.ts` (login handler)
- `/e-banking-portal/lib/api-client.ts` (already correct)
- `/corporate-website/app/login/page.tsx` (send accountNumber instead of email)

---

## 2. User Profile Endpoints - Path Mismatch

**Frontend Endpoints:**

- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/profile/change-password`

**Backend Endpoints:**

- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/change-password`

**Status:** ⚠️ Path Mismatch  
**Priority:** 🟡 Medium

### Current Backend Implementation

**File:** `/backend/core-api/src/routes/index.ts`

```typescript
// Protected routes
fastify.get('/auth/profile', authRoutes.getProfile);
fastify.put('/auth/profile', authRoutes.updateProfile);
fastify.post('/auth/change-password', authRoutes.changePassword);
```

### Frontend Expectation

**E-Banking Portal** (`/lib/api-client.ts`):

```typescript
profile: {
  get: async () => {
    const response = await apiClient.get('/api/profile');
    return response.data;
  },
  
  update: async (profileData: any) => {
    const response = await apiClient.put('/api/profile', profileData);
    return response.data;
  },
  
  changePassword: async (passwordData: any) => {
    const response = await apiClient.post('/api/profile/change-password', passwordData);
    return response.data;
  },
}
```

### Root Cause Analysis

1. **RESTful Design:** Frontend follows RESTful convention (`/profile` resource)
2. **Backend Grouping:** Backend groups under `/auth` namespace
3. **Inconsistency:** Password change path differs (`/auth/change-password` vs `/profile/change-password`)

### Refactoring Options

#### Option A: Add Route Aliases (Recommended)

**Pros:**

- ✅ No breaking changes
- ✅ Supports both paths
- ✅ Minimal code changes
- ✅ Quick implementation

**Cons:**

- ⚠️ Multiple paths for same resource
- ⚠️ Documentation needs to reflect both

**Implementation:**

```typescript
// In /backend/core-api/src/routes/index.ts

// Existing routes (keep for backward compatibility)
fastify.get('/auth/profile', authRoutes.getProfile);
fastify.put('/auth/profile', authRoutes.updateProfile);
fastify.post('/auth/change-password', authRoutes.changePassword);

// Add aliases for frontend compatibility
fastify.get('/profile', authRoutes.getProfile);
fastify.put('/profile', authRoutes.updateProfile);
fastify.post('/profile/change-password', authRoutes.changePassword);
```

**Effort:** 15 minutes

---

#### Option B: Update Frontend Paths

**Pros:**

- ✅ Single source of truth
- ✅ Consistent with backend design

**Cons:**

- ❌ Frontend changes required
- ❌ Need to update all references
- ❌ Testing required

**Implementation:**

```typescript
// Update E-Banking Portal API client
profile: {
  get: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },
  // ... update other methods
}
```

**Effort:** 1-2 hours

---

### Recommended Solution

**Option A: Add Route Aliases**

**Rationale:**

- Fastest implementation
- No frontend changes
- Backward compatible
- Low risk

**Implementation:**

```typescript
// File: /backend/core-api/src/routes/index.ts

// Inside protected routes section
fastify.register(async function (fastify) {
  fastify.addHook('preHandler', authenticateToken);

  // Auth routes (existing)
  fastify.get('/auth/profile', authRoutes.getProfile);
  fastify.put('/auth/profile', authRoutes.updateProfile);
  fastify.post('/auth/change-password', authRoutes.changePassword);

  // Profile aliases (new)
  fastify.get('/profile', authRoutes.getProfile);
  fastify.put('/profile', authRoutes.updateProfile);
  fastify.post('/profile/change-password', authRoutes.changePassword);
});
```

---

## 3. Transaction Response - Data Structure Mismatch

**Frontend Endpoint:** `GET /api/transactions`  
**Backend Endpoint:** `GET /api/transactions`  
**Status:** ⚠️ Data Structure Mismatch  
**Priority:** 🟡 Medium

### Current Backend Response

```typescript
{
  success: true,
  data: {
    transactions: [
      {
        id: string;
        type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'WIRE';
        amount: Decimal;
        currency: string;
        status: string;
        description: string;
        reference: string;
        createdAt: DateTime;
        // No 'category' field
        // No 'date' field (uses createdAt)
      }
    ],
    pagination: { ... }
  }
}
```

### Frontend Expectation

```typescript
{
  data: {
    transactions: [
      {
        id: string;
        type: 'credit' | 'debit';  // ⚠️ Different values
        description: string;
        amount: number;
        date: string;              // ⚠️ Expects 'date' not 'createdAt'
        category: string;          // ⚠️ Missing in backend
      }
    ]
  }
}
```

### Root Cause Analysis

1. **Type Mapping:** Backend uses transaction types (DEPOSIT, WITHDRAWAL), frontend expects credit/debit
2. **Field Naming:** Backend uses `createdAt`, frontend expects `date`
3. **Missing Field:** Backend doesn't have `category` field
4. **Display Logic:** Frontend needs to determine if transaction is credit or debit

### Refactoring Options

#### Option A: Frontend Maps Backend Data (Recommended)

**Pros:**

- ✅ No backend changes
- ✅ Frontend controls display logic
- ✅ Flexible presentation

**Cons:**

- ⚠️ Mapping logic in frontend
- ⚠️ Need to handle all transaction types

**Implementation:**

```typescript
// File: /e-banking-portal/lib/transaction-utils.ts

export type TransactionType = 'credit' | 'debit';

export function mapTransactionType(
  backendType: string,
  accountId: string,
  transaction: any
): TransactionType {
  switch (backendType) {
    case 'DEPOSIT':
      return 'credit';
    case 'WITHDRAWAL':
      return 'debit';
    case 'TRANSFER':
      // Determine if credit or debit based on account
      return transaction.toAccountId === accountId ? 'credit' : 'debit';
    case 'WIRE':
      return 'debit';  // Wire transfers are always outgoing
    default:
      return 'debit';
  }
}

export function mapTransaction(backendTransaction: any, userAccountId: string) {
  return {
    id: backendTransaction.id,
    type: mapTransactionType(
      backendTransaction.type,
      userAccountId,
      backendTransaction
    ),
    description: backendTransaction.description,
    amount: Number(backendTransaction.amount),
    date: backendTransaction.createdAt,  // Use createdAt as date
    category: backendTransaction.category || 'GENERAL',  // Default category
    // Include original data for reference
    originalType: backendTransaction.type,
    status: backendTransaction.status,
    currency: backendTransaction.currency,
  };
}

// Usage in API client
transactions: {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/api/transactions', { params });
    const userAccountId = localStorage.getItem('primaryAccountId');
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        transactions: response.data.data.transactions.map(tx =>
          mapTransaction(tx, userAccountId)
        )
      }
    };
  },
}
```

**Effort:** 2-3 hours

---

#### Option B: Backend Adds Computed Fields

**Pros:**

- ✅ Frontend gets exactly what it needs
- ✅ Centralized logic

**Cons:**

- ❌ Backend needs to know display logic
- ❌ Requires account context
- ❌ More complex backend code

**Implementation:**

```typescript
// Backend adds computed fields
export const getTransactions = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const transactions = await prisma.transaction.findMany({
    where: { account: { userId: user.userId } },
    include: { account: true }
  });

  const mapped = transactions.map(tx => ({
    ...tx,
    type: tx.type === 'DEPOSIT' ? 'credit' : 'debit',  // Simplified
    date: tx.createdAt,
    category: tx.category || 'GENERAL'
  }));

  return reply.send({ success: true, data: { transactions: mapped } });
};
```

**Effort:** 3-4 hours

---

#### Option C: Add Category Field to Backend

**Pros:**

- ✅ Proper data modeling
- ✅ Better transaction categorization
- ✅ Useful for reporting

**Cons:**

- ❌ Database migration required
- ❌ Need to categorize existing transactions
- ❌ Longer implementation time

**Implementation:**

```prisma
// Update Prisma schema
model Transaction {
  // ... existing fields
  category String? @default("GENERAL")  // NEW FIELD
}
```

```sql
-- Migration
ALTER TABLE transactions ADD COLUMN category VARCHAR(50) DEFAULT 'GENERAL';
```

**Effort:** 4-6 hours (including migration)

---

### Recommended Solution

**Hybrid Approach:**

1. **Short-term (Week 1):** Frontend maps data (Option A)
2. **Long-term (Week 3-4):** Add category field to backend (Option C)

**Rationale:**

- Unblocks frontend immediately
- Proper data modeling for future
- Gradual improvement

---

## 4. Registration Endpoint - Missing Required Field

**Frontend Endpoint:** `POST /api/auth/register`  
**Backend Endpoint:** `POST /api/auth/register`  
**Status:** ⚠️ Missing Required Field  
**Priority:** 🔴 Critical

### Current Backend Schema

```typescript
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime(),  // ⚠️ REQUIRED
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
});
```

### Frontend Request

**Corporate Website:**

```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  // ❌ Missing dateOfBirth
}
```

### Root Cause Analysis

1. **Compliance:** Backend requires date of birth for age verification (18+)
2. **Frontend Oversight:** Registration form doesn't collect date of birth
3. **Validation:** Backend rejects requests without dateOfBirth

### Refactoring Options

#### Option A: Add Date of Birth to Frontend Form (Recommended)

**Pros:**

- ✅ Proper data collection
- ✅ Compliance with banking regulations
- ✅ Complete user profile

**Cons:**

- ⚠️ Longer registration form
- ⚠️ Need date picker component

**Implementation:**

```typescript
// File: /corporate-website/app/signup/page.tsx

import { DatePicker } from '@/components/ui/date-picker';

const [formData, setFormData] = useState({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',  // NEW FIELD
});

// In form JSX
<div>
  <label htmlFor="dateOfBirth">Date of Birth</label>
  <DatePicker
    id="dateOfBirth"
    value={formData.dateOfBirth}
    onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
    maxDate={new Date()}  // Can't be future date
    required
  />
</div>

// Validation
if (!formData.dateOfBirth) {
  errors.dateOfBirth = 'Date of birth is required';
}

const age = calculateAge(new Date(formData.dateOfBirth));
if (age < 18) {
  errors.dateOfBirth = 'You must be at least 18 years old';
}

// API call
const response = await api.register({
  email: formData.email,
  password: formData.password,
  firstName: formData.firstName,
  lastName: formData.lastName,
  phone: formData.phone,
  dateOfBirth: formData.dateOfBirth,  // Include in request
});
```

**Effort:** 3-4 hours

---

#### Option B: Make Date of Birth Optional in Backend

**Pros:**

- ✅ No frontend changes
- ✅ Faster registration

**Cons:**

- ❌ Incomplete user data
- ❌ Compliance issues
- ❌ Need to collect later
- ❌ Age verification not possible

**Implementation:**

```typescript
// Update schema
const registerSchema = z.object({
  // ... other fields
  dateOfBirth: z.string().datetime().optional(),  // Make optional
});

// Update handler
export const register = async (request: FastifyRequest, reply: FastifyReply) => {
  const userData = registerSchema.parse(request.body);
  
  // Skip age verification if dateOfBirth not provided
  if (userData.dateOfBirth) {
    const age = calculateAge(new Date(userData.dateOfBirth));
    if (age < 18) {
      return reply.status(400).send({
        success: false,
        error: { message: 'Must be 18 or older' }
      });
    }
  }
  
  // Create user...
};
```

**Effort:** 1 hour

---

### Recommended Solution

**Option A: Add Date of Birth to Frontend**

**Rationale:**

- Banking compliance requirement
- Better user data quality
- One-time collection
- Professional registration flow

**Implementation Steps:**

1. Add date picker component to corporate website
2. Update registration form validation
3. Include dateOfBirth in API request
4. Add age verification (18+)
5. Test registration flow

---

## Summary of Recommended Actions

| Mismatch | Recommended Solution | Effort | Priority |
|----------|---------------------|--------|----------|
| Login field (email vs accountNumber) | Backend accepts both | 2-3 hours | 🔴 Critical |
| Profile path (/profile vs /auth/profile) | Add route aliases | 15 min | 🟡 Medium |
| Transaction data structure | Frontend maps data | 2-3 hours | 🟡 Medium |
| Missing dateOfBirth | Add to frontend form | 3-4 hours | 🔴 Critical |

**Total Estimated Effort:** 8-11 hours

---

## Implementation Order

### Week 1 (Critical)

1. ✅ Login field mismatch - Backend accepts both
2. ✅ Add dateOfBirth to registration form
3. ✅ Profile route aliases

### Week 2 (Medium)

4. ✅ Transaction data mapping in frontend
2. ✅ Test all refactored endpoints

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-17  
**Next Task:** Task 2.3 - Authentication Flow Mapping
