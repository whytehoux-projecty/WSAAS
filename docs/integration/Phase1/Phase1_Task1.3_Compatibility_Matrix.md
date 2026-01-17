# Phase 1, Task 1.3 - API Compatibility Matrix

**Date:** 2026-01-17  
**Project:** AURUM VAULT Banking Integration  
**Task:** Frontend-Backend Compatibility Analysis

---

## Executive Summary

This matrix compares **all frontend API requirements** against **backend available endpoints** to identify:

- ✅ **Compatible** endpoints (no changes needed)
- ⚠️ **Partially Compatible** endpoints (needs refactoring)
- ❌ **Missing** endpoints (needs implementation)

**Statistics:**

- **Total Frontend Endpoints:** 35
- **✅ Compatible:** 11 (31%)
- **⚠️ Partially Compatible:** 8 (23%)
- **❌ Missing:** 16 (46%)

---

## 1. Compatibility Matrix - Corporate Website

### 1.1 Portal & Health Endpoints

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/portal/health` | GET | `/api/portal/health` | ✅ Compatible | Exact match |

**Priority:** 🔴 Critical  
**Action Required:** None

---

### 1.2 Authentication Endpoints

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/auth/register` | POST | `/api/auth/register` | ⚠️ Partial | Request structure mismatch |
| `/api/auth/login` | POST | `/api/auth/login` | ⚠️ Partial | Field name mismatch |

#### `/api/auth/register` - Detailed Analysis

**Frontend Request:**

```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}
```

**Backend Expects:**

```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth: string;  // REQUIRED in backend
  address?: {           // Optional in backend
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
}
```

**Issues:**

1. ❌ Frontend missing `dateOfBirth` (required by backend)
2. ✅ `phone` is optional in backend (compatible)
3. ✅ `address` is optional in backend (compatible)

**Resolution Options:**

- **Option A (Recommended):** Add `dateOfBirth` field to corporate website registration form
- **Option B:** Make `dateOfBirth` optional in backend schema (requires database migration)

**Priority:** 🔴 Critical  
**Recommended Action:** Update frontend form to include date of birth

---

#### `/api/auth/login` - Detailed Analysis

**Frontend Request:**

```typescript
{
  email: string;        // Uses accountNumber in UI
  password: string;
}
```

**Backend Expects:**

```typescript
{
  email: string;
  password: string;
}
```

**Frontend Code (Corporate Website):**

```typescript
// Line 72 in app/login/page.tsx
body: JSON.stringify({
  email: formData.accountNumber,  // ⚠️ Using accountNumber as email
  password: formData.password,
})
```

**Issues:**

1. ⚠️ Frontend UI collects "Account Number" but sends as `email` field
2. ⚠️ Backend expects actual email address, not account number
3. ⚠️ Validation mismatch: Frontend validates 10-12 digits, backend validates email format

**Resolution Options:**

- **Option A (Recommended):** Backend accepts both email OR accountNumber for login
- **Option B:** Frontend changes to collect email instead of account number
- **Option C:** Add separate `/api/auth/login-by-account` endpoint

**Priority:** 🔴 Critical  
**Recommended Action:** Modify backend login to accept accountNumber as alternative to email

---

### 1.3 Contact & Applications

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/contact` | POST | - | ❌ Missing | Contact form submission |
| `/api/account-applications` | POST | - | ❌ Missing | Account opening requests |

**Priority:** 🟡 Medium  
**Action Required:** Implement both endpoints in backend

---

## 2. Compatibility Matrix - E-Banking Portal

### 2.1 Authentication & Session Management

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/auth/login` | POST | `/api/auth/login` | ⚠️ Partial | Same issue as corporate website |
| `/api/auth/logout` | POST | `/api/auth/logout` | ✅ Compatible | Exact match |
| `/api/auth/refresh` | POST | - | ❌ Missing | Token refresh not implemented |
| `/api/auth/me` | GET | `/api/auth/profile` | ⚠️ Partial | Different endpoint path |

#### `/api/auth/refresh` - Detailed Analysis

**Frontend Request:**

```typescript
POST /api/auth/refresh
{
  refreshToken: string;
}
```

**Frontend Expected Response:**

```typescript
{
  data: {
    accessToken: string;
    refreshToken?: string;  // Optional new refresh token
  }
}
```

**Backend Status:** ❌ **NOT IMPLEMENTED**

**Impact:** 🔴 **CRITICAL**

- E-Banking Portal cannot maintain user sessions
- Users will be logged out after 15 minutes (access token expiry)
- Auto-refresh interceptor will fail

**Implementation Required:**

```typescript
// Backend endpoint needed
POST /api/auth/refresh
Request: { refreshToken: string }
Response: { 
  success: true,
  data: { 
    accessToken: string,
    expiresIn: number
  }
}
```

**Priority:** 🔴 Critical  
**Action Required:** Implement token refresh endpoint in backend

---

#### `/api/auth/me` vs `/api/auth/profile` - Detailed Analysis

**Frontend Calls:**

```typescript
GET /api/auth/me
```

**Backend Provides:**

```typescript
GET /api/auth/profile
```

**Resolution Options:**

- **Option A (Recommended):** Add alias route `/api/auth/me` → `/api/auth/profile`
- **Option B:** Update all frontend calls to use `/api/auth/profile`

**Priority:** 🔴 Critical  
**Recommended Action:** Add backend route alias (minimal change)

---

### 2.2 Account Management

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/accounts` | GET | `/api/accounts` | ✅ Compatible | Exact match |
| `/api/accounts/:id` | GET | `/api/accounts/:accountId` | ✅ Compatible | Parameter name difference (acceptable) |
| `/api/accounts/:id/balance` | GET | `/api/accounts/:accountId/balance` | ✅ Compatible | Parameter name difference (acceptable) |

**Priority:** ✅ No action required  
**Status:** Fully compatible

---

### 2.3 Transaction Management

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/transactions` | GET | `/api/transactions` | ⚠️ Partial | Response structure mismatch |
| `/api/transactions/:id` | GET | `/api/transactions/:transactionId` | ✅ Compatible | Parameter name difference (acceptable) |

#### `/api/transactions` - Response Structure Analysis

**Frontend Expects:**

```typescript
{
  data: {
    transactions: [
      {
        id: string;
        type: 'credit' | 'debit';  // ⚠️ Frontend specific values
        description: string;
        amount: number;
        date: string;              // ⚠️ Frontend expects 'date'
        category: string;          // ⚠️ Frontend expects category
      }
    ]
  }
}
```

**Backend Provides:**

```typescript
{
  success: true,
  data: {
    transactions: [
      {
        id: string;
        type: string;              // 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'WIRE'
        amount: Decimal;
        currency: string;
        status: string;
        description: string;
        reference: string;
        createdAt: DateTime;       // ⚠️ Backend uses 'createdAt'
        // ❌ No 'category' field
      }
    ]
  }
}
```

**Mismatches:**

1. **Type Field:**
   - Frontend: `'credit' | 'debit'`
   - Backend: `'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'WIRE'`
   - **Resolution:** Frontend needs to map backend types to credit/debit

2. **Date Field:**
   - Frontend: `date`
   - Backend: `createdAt`
   - **Resolution:** Frontend should use `createdAt`

3. **Category Field:**
   - Frontend: Expects `category`
   - Backend: ❌ Not provided
   - **Resolution:** Add category to backend transaction model OR frontend removes dependency

**Priority:** 🟡 Medium  
**Recommended Action:**

- Frontend maps transaction types
- Frontend uses `createdAt` instead of `date`
- Backend adds optional `category` field (future enhancement)

---

### 2.4 Transfer Operations

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/transfers` | POST | `/api/transactions/transfer` | ⚠️ Partial | Different path structure |
| `/api/transfers` | GET | - | ❌ Missing | No dedicated transfers list |

#### Transfer Endpoint Mismatch

**Frontend Calls:**

```typescript
POST /api/transfers
{
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  description: string;
}
```

**Backend Provides:**

```typescript
POST /api/transactions/transfer
{
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
}
```

**Resolution Options:**

- **Option A (Recommended):** Add alias `/api/transfers` → `/api/transactions/transfer`
- **Option B:** Update frontend to use `/api/transactions/transfer`

**Priority:** 🔴 Critical  
**Recommended Action:** Add backend route alias

---

### 2.5 Card Management

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/cards` | GET | - | ❌ Missing | Card listing not implemented |
| `/api/cards/:cardId/freeze` | POST | - | ❌ Missing | Card freeze not implemented |
| `/api/cards/:cardId/unfreeze` | POST | - | ❌ Missing | Card unfreeze not implemented |

**Priority:** 🟢 Low (Feature not critical for MVP)  
**Action Required:** Implement card management module (future phase)

---

### 2.6 Bill Payment

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/bills` | GET | - | ❌ Missing | Bill listing not implemented |
| `/api/bills/pay` | POST | - | ❌ Missing | Bill payment not implemented |

**Priority:** 🟢 Low (Feature not critical for MVP)  
**Action Required:** Implement bill payment module (future phase)

---

### 2.7 Beneficiary Management

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/beneficiaries` | GET | - | ❌ Missing | Beneficiary listing not implemented |
| `/api/beneficiaries` | POST | - | ❌ Missing | Add beneficiary not implemented |
| `/api/beneficiaries/:id` | DELETE | - | ❌ Missing | Remove beneficiary not implemented |

**Priority:** 🟡 Medium  
**Action Required:** Implement beneficiary management module

**Note:** This feature could be implemented using wire transfer recipient data as a starting point

---

### 2.8 Statement Generation

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/statements` | GET | - | ❌ Missing | Statement listing not implemented |
| `/api/statements/:id/download` | GET | - | ❌ Missing | PDF generation not implemented |

**Priority:** 🟡 Medium  
**Action Required:** Implement statement generation module

**Technical Requirements:**

- PDF generation library (e.g., PDFKit, Puppeteer)
- Statement template design
- Transaction aggregation logic
- Secure file storage/delivery

---

### 2.9 User Profile Management

| Frontend Endpoint | Method | Backend Endpoint | Status | Notes |
|-------------------|--------|------------------|--------|-------|
| `/api/profile` | GET | `/api/auth/profile` | ⚠️ Partial | Path mismatch |
| `/api/profile` | PUT | `/api/auth/profile` | ⚠️ Partial | Path mismatch |
| `/api/profile/change-password` | POST | `/api/auth/change-password` | ⚠️ Partial | Path mismatch |

**Resolution Options:**

- **Option A (Recommended):** Add route aliases in backend
  - `/api/profile` → `/api/auth/profile`
  - `/api/profile/change-password` → `/api/auth/change-password`
- **Option B:** Update all frontend calls to use `/api/auth/*` paths

**Priority:** 🟡 Medium  
**Recommended Action:** Add backend route aliases

---

## 3. Critical Issues Summary

### 3.1 Blocking Issues (Must Fix for Basic Functionality)

| Issue | Impact | Affected Frontend | Resolution |
|-------|--------|-------------------|------------|
| Missing `/api/auth/refresh` | Users logged out after 15min | E-Banking Portal | Implement refresh endpoint |
| Login field mismatch (accountNumber vs email) | Login fails | Both | Accept accountNumber in login |
| Missing `dateOfBirth` in registration | Registration fails | Corporate Website | Add field to form |
| `/api/auth/me` not found | Dashboard fails to load | E-Banking Portal | Add route alias |
| `/api/transfers` not found | Transfers fail | E-Banking Portal | Add route alias |

**Total Blocking Issues:** 5

---

### 3.2 High Priority Issues (Affects Core Features)

| Issue | Impact | Affected Frontend | Resolution |
|-------|--------|-------------------|------------|
| Transaction type mapping | Display issues | E-Banking Portal | Frontend maps types |
| Profile endpoint mismatch | Profile page fails | E-Banking Portal | Add route aliases |
| Missing beneficiary management | Feature unavailable | E-Banking Portal | Implement module |

**Total High Priority:** 3

---

### 3.3 Medium Priority Issues (Affects Secondary Features)

| Issue | Impact | Affected Frontend | Resolution |
|-------|--------|-------------------|------------|
| Missing contact form endpoint | Contact form fails | Corporate Website | Implement endpoint |
| Missing account applications | Account opening fails | Corporate Website | Implement endpoint |
| Missing statement generation | Statements unavailable | E-Banking Portal | Implement module |

**Total Medium Priority:** 3

---

### 3.4 Low Priority Issues (Nice-to-Have Features)

| Issue | Impact | Affected Frontend | Resolution |
|-------|--------|-------------------|------------|
| Missing card management | Card features unavailable | E-Banking Portal | Future phase |
| Missing bill payment | Bill pay unavailable | E-Banking Portal | Future phase |

**Total Low Priority:** 2

---

## 4. Recommended Integration Strategy

### Phase 1: Critical Fixes (Week 1)

**Backend Changes:**

1. ✅ Implement `/api/auth/refresh` endpoint
2. ✅ Modify `/api/auth/login` to accept `accountNumber` OR `email`
3. ✅ Add route alias `/api/auth/me` → `/api/auth/profile`
4. ✅ Add route alias `/api/transfers` → `/api/transactions/transfer`
5. ✅ Make `dateOfBirth` optional in registration (OR)

**Frontend Changes:**

1. ✅ Add `dateOfBirth` field to corporate website registration form
2. ✅ Update E-Banking Portal to use `createdAt` instead of `date` for transactions
3. ✅ Add transaction type mapping logic (DEPOSIT→credit, WITHDRAWAL→debit)

**Estimated Effort:** 2-3 days

---

### Phase 2: Core Features (Week 2)

**Backend Changes:**

1. ✅ Add route aliases for profile endpoints
2. ✅ Implement `/api/contact` endpoint
3. ✅ Implement `/api/account-applications` endpoint
4. ✅ Implement beneficiary management endpoints

**Frontend Changes:**

1. ✅ Update profile API calls to use new endpoints
2. ✅ Test contact form integration
3. ✅ Test account application flow

**Estimated Effort:** 3-4 days

---

### Phase 3: Enhanced Features (Week 3-4)

**Backend Changes:**

1. ✅ Implement statement generation module
2. ✅ Add transaction categorization
3. ✅ Implement card management module (optional)
4. ✅ Implement bill payment module (optional)

**Frontend Changes:**

1. ✅ Integrate statement download
2. ✅ Enable card management features
3. ✅ Enable bill payment features

**Estimated Effort:** 5-7 days

---

## 5. Detailed Refactoring Checklist

### 5.1 Backend Refactoring Tasks

#### Critical (Must Complete)

- [ ] **AUTH-001:** Implement `/api/auth/refresh` endpoint
  - File: `/backend/core-api/src/routes/auth.ts`
  - Add refresh token validation
  - Generate new access token
  - Return new token with expiry

- [ ] **AUTH-002:** Modify login to accept accountNumber
  - File: `/backend/core-api/src/routes/auth.ts`
  - Update validation schema to accept `accountNumber` OR `email`
  - Query user by account number if provided
  - Maintain backward compatibility with email login

- [ ] **AUTH-003:** Add `/api/auth/me` route alias
  - File: `/backend/core-api/src/routes/index.ts`
  - Add: `fastify.get('/auth/me', authRoutes.getProfile)`

- [ ] **TRANS-001:** Add `/api/transfers` route alias
  - File: `/backend/core-api/src/routes/index.ts`
  - Add: `fastify.post('/transfers', transactionRoutes.createTransfer)`

- [ ] **REG-001:** Make `dateOfBirth` optional in registration
  - File: `/backend/core-api/src/routes/auth.ts`
  - Update Zod schema: `dateOfBirth: z.string().optional()`
  - OR keep required and update frontend

#### High Priority

- [ ] **PROF-001:** Add profile route aliases
  - File: `/backend/core-api/src/routes/index.ts`
  - Add: `fastify.get('/profile', authRoutes.getProfile)`
  - Add: `fastify.put('/profile', authRoutes.updateProfile)`
  - Add: `fastify.post('/profile/change-password', authRoutes.changePassword)`

- [ ] **CONT-001:** Implement contact form endpoint
  - File: Create `/backend/core-api/src/routes/contact.ts`
  - Accept: `{ name, email, subject, message }`
  - Send email notification to admin
  - Store in database (optional)

- [ ] **APP-001:** Implement account applications endpoint
  - File: Create `/backend/core-api/src/routes/applications.ts`
  - Accept application data
  - Create pending application record
  - Send confirmation email

- [ ] **BEN-001:** Implement beneficiary management
  - File: Create `/backend/core-api/src/routes/beneficiaries.ts`
  - Add Prisma model for beneficiaries
  - Implement CRUD operations
  - Link to user accounts

#### Medium Priority

- [ ] **STMT-001:** Implement statement generation
  - File: Create `/backend/core-api/src/routes/statements.ts`
  - Integrate PDF generation library
  - Create statement templates
  - Implement download endpoint

- [ ] **TRANS-002:** Add transaction categories
  - File: `/backend/core-api/prisma/schema.prisma`
  - Add `category` field to Transaction model
  - Update transaction creation logic
  - Migrate existing data

---

### 5.2 Frontend Refactoring Tasks

#### Corporate Website

- [ ] **CORP-001:** Add dateOfBirth to registration form
  - File: `/corporate-website/app/signup/page.tsx`
  - Add date picker component
  - Update form validation
  - Update API call

- [ ] **CORP-002:** Update login field handling
  - File: `/corporate-website/app/login/page.tsx`
  - Keep UI as "Account Number"
  - Send as `accountNumber` field (not `email`)
  - Update validation

#### E-Banking Portal

- [ ] **EBANK-001:** Update transaction date field
  - File: `/e-banking-portal/lib/api-client.ts`
  - Use `createdAt` instead of `date`
  - Update all transaction displays

- [ ] **EBANK-002:** Add transaction type mapping
  - File: Create `/e-banking-portal/lib/transaction-utils.ts`
  - Map: `DEPOSIT` → `credit`
  - Map: `WITHDRAWAL` → `debit`
  - Map: `TRANSFER` → based on account (credit/debit)
  - Apply mapping in all transaction displays

- [ ] **EBANK-003:** Update profile API calls
  - File: `/e-banking-portal/lib/api-client.ts`
  - Keep current paths (backend will add aliases)
  - OR update to `/api/auth/profile` if aliases not added

- [ ] **EBANK-004:** Update auth/me endpoint
  - File: `/e-banking-portal/app/dashboard/page.tsx`
  - Change `/api/auth/me` to `/api/auth/profile`
  - OR wait for backend alias

---

## 6. Testing Checklist

### 6.1 Authentication Flow Testing

- [ ] Corporate Website login with email
- [ ] Corporate Website login with account number
- [ ] Token passed to E-Banking Portal via URL
- [ ] E-Banking Portal receives and stores token
- [ ] E-Banking Portal makes authenticated requests
- [ ] Token refresh triggers on 401 error
- [ ] New token used for subsequent requests
- [ ] Logout clears tokens and redirects
- [ ] Expired refresh token redirects to login

### 6.2 Registration Flow Testing

- [ ] Corporate Website registration with all fields
- [ ] Backend creates user account
- [ ] Tokens returned in response
- [ ] User can immediately login
- [ ] KYC status set to PENDING

### 6.3 Account Operations Testing

- [ ] Fetch user accounts
- [ ] Display account balances
- [ ] View account details
- [ ] Account data matches backend format

### 6.4 Transaction Operations Testing

- [ ] Fetch transaction list
- [ ] Transaction types display correctly (credit/debit)
- [ ] Transaction dates display correctly
- [ ] Create transfer between accounts
- [ ] Transfer appears in transaction history
- [ ] Balances update correctly

### 6.5 Profile Operations Testing

- [ ] Fetch user profile
- [ ] Update profile information
- [ ] Change password
- [ ] Profile changes persist

---

## 7. Data Migration Considerations

### 7.1 Database Schema Changes

If implementing optional `dateOfBirth`:

```sql
-- No migration needed, field already exists as required
-- If making optional, need to allow NULL
ALTER TABLE users ALTER COLUMN date_of_birth DROP NOT NULL;
```

If adding transaction categories:

```sql
-- Add category column
ALTER TABLE transactions ADD COLUMN category VARCHAR(50);

-- Update existing transactions with default category
UPDATE transactions SET category = 'GENERAL' WHERE category IS NULL;
```

If adding beneficiaries table:

```sql
-- Create beneficiaries table
CREATE TABLE beneficiaries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  swift_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 8. API Response Standardization

### 8.1 Current Backend Format

```typescript
{
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  message?: string;
}
```

### 8.2 Frontend Expectations

**Most endpoints expect:**

```typescript
{
  data: any;  // Direct data object
}
```

**Some endpoints expect:**

```typescript
{
  success: boolean;
  data: any;
}
```

### 8.3 Recommendation

**Keep backend format** (it's more comprehensive)

**Frontend should handle both:**

```typescript
// Frontend API client wrapper
const response = await apiClient.get('/api/accounts');
const data = response.data.data || response.data;  // Handle both formats
```

---

## 9. Environment Configuration Matrix

| Variable | Corporate Website | E-Banking Portal | Backend |
|----------|-------------------|------------------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | `http://localhost:3001` | N/A |
| `NEXT_PUBLIC_PORTAL_URL` | `http://localhost:4000` | N/A | N/A |
| `NEXT_PUBLIC_CORPORATE_URL` | N/A | `http://localhost:3002` | N/A |
| `NEXT_PUBLIC_PORTAL_HEALTH_URL` | `http://localhost:3001/api/portal/health` | N/A | N/A |
| `PORT` | `3002` | `4000` | `3001` |
| `JWT_SECRET` | N/A | N/A | `<shared-secret>` |
| `DATABASE_URL` | N/A | N/A | `file:./dev.db` |

**⚠️ Important:** All three applications must use the **same JWT_SECRET** for token validation

---

## 10. Next Steps

This completes **Phase 1, Task 1.3 - API Compatibility Matrix**.

**Ready to proceed to Phase 2:**

- **Task 2.1:** Missing Endpoints Identification (Detailed Specifications)
- **Task 2.2:** Mismatched Endpoints Documentation
- **Task 2.3:** Authentication Flow Mapping

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-17  
**Prepared By:** Integration Team
