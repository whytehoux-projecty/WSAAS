# Phase 1, Task 1.2 - Frontend API Requirements Analysis

**Date:** 2026-01-17  
**Project:** AURUM VAULT Banking Integration  
**Task:** Frontend API Requirements Extraction

---

## Executive Summary

This document catalogs all API endpoints called by the **Corporate Website** and **E-Banking Portal** frontends. Both are Next.js applications using Axios for HTTP requests with centralized API client modules.

**Key Findings:**

- Corporate Website: 6 API endpoints (mostly public/auth)
- E-Banking Portal: 30+ API endpoints (authenticated user operations)
- Both expect JWT-based authentication
- E-Banking Portal implements automatic token refresh
- Several endpoints expected by frontends **DO NOT EXIST** in backend

---

## 1. Corporate Website API Requirements

**Technology Stack:**

- Framework: Next.js 14.2.35
- HTTP Client: Axios
- Port: 3002
- API Client: `/lib/api-client.ts`

**Base URL Configuration:**

```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
```

---

### 1.1 Portal Health & Status

| Method | Endpoint | Purpose | Auth | Request Body | Expected Response |
|--------|----------|---------|------|--------------|-------------------|
| GET | `/api/portal/health` | Check portal availability | ❌ No | - | `{ status, timestamp, message?, nextScheduledMaintenance? }` |

**File:** `/corporate-website/lib/api-client.ts` (line 67)  
**Usage:** Portal status indicator component  
**Priority:** 🔴 Critical

---

### 1.2 User Registration

| Method | Endpoint | Purpose | Auth | Request Body | Expected Response |
|--------|----------|---------|------|--------------|-------------------|
| POST | `/api/auth/register` | Register new user | ❌ No | `{ email, password, firstName, lastName, phone }` | `{ success, data: { user, tokens } }` |

**File:** `/corporate-website/lib/api-client.ts` (line 79)  
**Request Structure:**

```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}
```

**Expected Response:**

```typescript
{
  success: true,
  data: {
    user: { id, email, firstName, lastName },
    tokens: { accessToken, refreshToken, expiresIn }
  }
}
```

**Priority:** 🔴 Critical

---

### 1.3 User Login

| Method | Endpoint | Purpose | Auth | Request Body | Expected Response |
|--------|----------|---------|------|--------------|-------------------|
| POST | `/api/auth/login` | Authenticate user | ❌ No | `{ email, password }` | `{ accessToken, refreshToken, user }` |

**File:** `/corporate-website/app/login/page.tsx` (line 65)  
**Request Structure:**

```typescript
{
  email: string;        // Currently using accountNumber field
  password: string;
}
```

**Expected Response:**

```typescript
{
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }
}
```

**Post-Login Flow:**

1. Store tokens in localStorage
2. Redirect to E-Banking Portal: `http://localhost:4000/dashboard?token={accessToken}`

**Priority:** 🔴 Critical

**⚠️ Issue:** Frontend sends `accountNumber` but backend expects `email`

---

### 1.4 Contact Form Submission

| Method | Endpoint | Purpose | Auth | Request Body | Expected Response |
|--------|----------|---------|------|--------------|-------------------|
| POST | `/api/contact` | Submit contact form | ❌ No | `{ name, email, subject, message }` | `{ success, message }` |

**File:** `/corporate-website/lib/api-client.ts` (line 99)  
**Request Structure:**

```typescript
{
  name: string;
  email: string;
  subject: string;
  message: string;
}
```

**Priority:** 🟡 Medium

**❌ Status:** **MISSING** - Endpoint does not exist in backend

---

### 1.5 Account Opening Application

| Method | Endpoint | Purpose | Auth | Request Body | Expected Response |
|--------|----------|---------|------|--------------|-------------------|
| POST | `/api/account-applications` | Submit account opening request | ❌ No | Application data object | `{ success, applicationId }` |

**File:** `/corporate-website/lib/api-client.ts` (line 105)  
**Priority:** 🟡 Medium

**❌ Status:** **MISSING** - Endpoint does not exist in backend

---

## 2. E-Banking Portal API Requirements

**Technology Stack:**

- Framework: Next.js 15.1.6
- HTTP Client: Axios
- Port: 4000
- API Client: `/lib/api-client.ts`

**Base URL Configuration:**

```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
```

**Authentication:** All endpoints require `Authorization: Bearer {token}` header

---

### 2.1 Authentication Endpoints

#### 2.1.1 User Login

| Method | Endpoint | Purpose | Auth | Request Body |
|--------|----------|---------|------|--------------|
| POST | `/api/auth/login` | User authentication | ❌ No | `{ accountNumber, password }` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 191)  
**Expected Response:**

```typescript
{
  data: {
    accessToken: string;
    refreshToken: string;
    user: { id, email, firstName, lastName }
  }
}
```

**Token Storage:** localStorage (`accessToken`, `refreshToken`)

---

#### 2.1.2 User Logout

| Method | Endpoint | Purpose | Auth | Request Body |
|--------|----------|---------|------|--------------|
| POST | `/api/auth/logout` | Invalidate session | ✅ Yes | - |

**File:** `/e-banking-portal/lib/api-client.ts` (line 200)  
**Post-Logout:** Clear tokens and redirect to corporate login

---

#### 2.1.3 Token Refresh

| Method | Endpoint | Purpose | Auth | Request Body |
|--------|----------|---------|------|--------------|
| POST | `/api/auth/refresh` | Refresh access token | ❌ No | `{ refreshToken }` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 211)  
**Expected Response:**

```typescript
{
  data: {
    accessToken: string;
    refreshToken?: string;  // Optional new refresh token
  }
}
```

**Auto-Refresh:** Implemented in Axios interceptor (line 124)

**❌ Status:** **MISSING** - Endpoint not implemented in backend

---

#### 2.1.4 Get User Profile

| Method | Endpoint | Purpose | Auth | Request Body |
|--------|----------|---------|------|--------------|
| GET | `/api/auth/me` | Get current user profile | ✅ Yes | - |

**File:** `/e-banking-portal/app/dashboard/page.tsx` (line 74)  
**Expected Response:**

```typescript
{
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }
}
```

**❌ Status:** **MISSING** - Backend has `/auth/profile` not `/auth/me`

---

### 2.2 Account Management Endpoints

#### 2.2.1 Get All Accounts

| Method | Endpoint | Purpose | Auth | Query Params |
|--------|----------|---------|------|--------------|
| GET | `/api/accounts` | List user accounts | ✅ Yes | - |

**File:** `/e-banking-portal/lib/api-client.ts` (line 221)  
**Expected Response:**

```typescript
{
  data: {
    accounts: [
      {
        id: string;
        accountNumber: string;
        accountType: string;
        balance: number;
        currency: string;
        status: string;
      }
    ]
  }
}
```

**✅ Status:** **EXISTS** in backend

---

#### 2.2.2 Get Account by ID

| Method | Endpoint | Purpose | Auth | Path Params |
|--------|----------|---------|------|-------------|
| GET | `/api/accounts/:id` | Get specific account | ✅ Yes | `id` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 226)  
**✅ Status:** **EXISTS** in backend (as `/accounts/:accountId`)

---

#### 2.2.3 Get Account Balance

| Method | Endpoint | Purpose | Auth | Path Params |
|--------|----------|---------|------|-------------|
| GET | `/api/accounts/:id/balance` | Get account balance | ✅ Yes | `id` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 231)  
**✅ Status:** **EXISTS** in backend (as `/accounts/:accountId/balance`)

---

### 2.3 Transaction Endpoints

#### 2.3.1 Get All Transactions

| Method | Endpoint | Purpose | Auth | Query Params |
|--------|----------|---------|------|--------------|
| GET | `/api/transactions` | List user transactions | ✅ Yes | `page, limit, accountId, type, status, startDate, endDate` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 239)  
**Expected Response:**

```typescript
{
  data: {
    transactions: [
      {
        id: string;
        type: 'credit' | 'debit';
        description: string;
        amount: number;
        date: string;
        category: string;
      }
    ],
    pagination: { page, limit, total, pages }
  }
}
```

**✅ Status:** **EXISTS** in backend

---

#### 2.3.2 Get Transaction by ID

| Method | Endpoint | Purpose | Auth | Path Params |
|--------|----------|---------|------|-------------|
| GET | `/api/transactions/:id` | Get specific transaction | ✅ Yes | `id` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 244)  
**✅ Status:** **EXISTS** in backend (as `/transactions/:transactionId`)

---

### 2.4 Transfer Endpoints

#### 2.4.1 Create Transfer

| Method | Endpoint | Purpose | Auth | Request Body |
|--------|----------|---------|------|--------------|
| POST | `/api/transfers` | Create new transfer | ✅ Yes | Transfer data |

**File:** `/e-banking-portal/lib/api-client.ts` (line 252)  
**Request Structure:**

```typescript
{
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  description: string;
}
```

**❌ Status:** **MISSING** - Backend has `/transactions/transfer` not `/transfers`

---

#### 2.4.2 Get Transfer History

| Method | Endpoint | Purpose | Auth | Query Params |
|--------|----------|---------|------|--------------|
| GET | `/api/transfers` | Get transfer history | ✅ Yes | `page, limit` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 257)  
**❌ Status:** **MISSING** - Backend has no dedicated transfers endpoint

---

### 2.5 Card Management Endpoints

#### 2.5.1 Get All Cards

| Method | Endpoint | Purpose | Auth | Query Params |
|--------|----------|---------|------|--------------|
| GET | `/api/cards` | List user cards | ✅ Yes | - |

**File:** `/e-banking-portal/lib/api-client.ts` (line 265)  
**❌ Status:** **MISSING** - Card management not implemented in backend

---

#### 2.5.2 Freeze Card

| Method | Endpoint | Purpose | Auth | Path Params |
|--------|----------|---------|------|-------------|
| POST | `/api/cards/:cardId/freeze` | Freeze a card | ✅ Yes | `cardId` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 270)  
**❌ Status:** **MISSING** - Card management not implemented in backend

---

#### 2.5.3 Unfreeze Card

| Method | Endpoint | Purpose | Auth | Path Params |
|--------|----------|---------|------|-------------|
| POST | `/api/cards/:cardId/unfreeze` | Unfreeze a card | ✅ Yes | `cardId` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 275)  
**❌ Status:** **MISSING** - Card management not implemented in backend

---

### 2.6 Bill Payment Endpoints

#### 2.6.1 Get All Bills

| Method | Endpoint | Purpose | Auth | Query Params |
|--------|----------|---------|------|--------------|
| GET | `/api/bills` | List pending bills | ✅ Yes | - |

**File:** `/e-banking-portal/lib/api-client.ts` (line 283)  
**❌ Status:** **MISSING** - Bill payment not implemented in backend

---

#### 2.6.2 Pay Bill

| Method | Endpoint | Purpose | Auth | Request Body |
|--------|----------|---------|------|--------------|
| POST | `/api/bills/pay` | Pay a bill | ✅ Yes | Bill payment data |

**File:** `/e-banking-portal/lib/api-client.ts` (line 288)  
**❌ Status:** **MISSING** - Bill payment not implemented in backend

---

### 2.7 Beneficiary Management Endpoints

#### 2.7.1 Get All Beneficiaries

| Method | Endpoint | Purpose | Auth | Query Params |
|--------|----------|---------|------|--------------|
| GET | `/api/beneficiaries` | List saved beneficiaries | ✅ Yes | - |

**File:** `/e-banking-portal/lib/api-client.ts` (line 296)  
**❌ Status:** **MISSING** - Beneficiary management not implemented in backend

---

#### 2.7.2 Create Beneficiary

| Method | Endpoint | Purpose | Auth | Request Body |
|--------|----------|---------|------|--------------|
| POST | `/api/beneficiaries` | Add new beneficiary | ✅ Yes | Beneficiary data |

**File:** `/e-banking-portal/lib/api-client.ts` (line 301)  
**❌ Status:** **MISSING** - Beneficiary management not implemented in backend

---

#### 2.7.3 Delete Beneficiary

| Method | Endpoint | Purpose | Auth | Path Params |
|--------|----------|---------|------|-------------|
| DELETE | `/api/beneficiaries/:id` | Remove beneficiary | ✅ Yes | `id` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 306)  
**❌ Status:** **MISSING** - Beneficiary management not implemented in backend

---

### 2.8 Statement Endpoints

#### 2.8.1 Get All Statements

| Method | Endpoint | Purpose | Auth | Query Params |
|--------|----------|---------|------|--------------|
| GET | `/api/statements` | List account statements | ✅ Yes | `accountId, startDate, endDate` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 314)  
**❌ Status:** **MISSING** - Statement generation not implemented in backend

---

#### 2.8.2 Download Statement

| Method | Endpoint | Purpose | Auth | Path Params |
|--------|----------|---------|------|-------------|
| GET | `/api/statements/:id/download` | Download statement PDF | ✅ Yes | `id` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 319)  
**Response Type:** `blob` (PDF file)  
**❌ Status:** **MISSING** - Statement generation not implemented in backend

---

### 2.9 User Profile Endpoints

#### 2.9.1 Get Profile

| Method | Endpoint | Purpose | Auth | Query Params |
|--------|----------|---------|------|--------------|
| GET | `/api/profile` | Get user profile | ✅ Yes | - |

**File:** `/e-banking-portal/lib/api-client.ts` (line 329)  
**⚠️ Status:** **MISMATCH** - Backend has `/auth/profile` not `/profile`

---

#### 2.9.2 Update Profile

| Method | Endpoint | Purpose | Auth | Request Body |
|--------|----------|---------|------|--------------|
| PUT | `/api/profile` | Update user profile | ✅ Yes | Profile data |

**File:** `/e-banking-portal/lib/api-client.ts` (line 334)  
**⚠️ Status:** **MISMATCH** - Backend has `/auth/profile` not `/profile`

---

#### 2.9.3 Change Password

| Method | Endpoint | Purpose | Auth | Request Body |
|--------|----------|---------|------|--------------|
| POST | `/api/profile/change-password` | Change user password | ✅ Yes | `{ currentPassword, newPassword }` |

**File:** `/e-banking-portal/lib/api-client.ts` (line 339)  
**⚠️ Status:** **MISMATCH** - Backend has `/auth/change-password` not `/profile/change-password`

---

## 3. Frontend Authentication Flow

### 3.1 Corporate Website Login Flow

```
1. User enters credentials on /login page
2. POST /api/auth/login { email, password }
3. Receive { accessToken, refreshToken, user }
4. Store tokens in localStorage
5. Redirect to E-Banking Portal: 
   http://localhost:4000/dashboard?token={accessToken}
```

**Files:**

- `/corporate-website/app/login/page.tsx` (line 65-97)

---

### 3.2 E-Banking Portal Token Handling

```
1. Dashboard receives token from URL query param
2. Store token in localStorage
3. Clean URL (remove token from query)
4. Use token for all authenticated requests
5. Axios interceptor adds: Authorization: Bearer {token}
6. On 401 error → Attempt token refresh
7. If refresh fails → Redirect to corporate login
```

**Files:**

- `/e-banking-portal/app/dashboard/page.tsx` (line 47-66)
- `/e-banking-portal/lib/api-client.ts` (line 54-184)

---

### 3.3 Automatic Token Refresh

**Implementation:** Axios response interceptor

**Flow:**

```
1. API request returns 401 Unauthorized
2. Check if refresh is already in progress
3. If yes → Queue request
4. If no → Start refresh process
5. POST /api/auth/refresh { refreshToken }
6. Receive new accessToken
7. Update localStorage
8. Retry original request with new token
9. Process queued requests
10. If refresh fails → Clear tokens, redirect to login
```

**File:** `/e-banking-portal/lib/api-client.ts` (line 83-184)

---

## 4. Frontend Configuration

### 4.1 Environment Variables

#### Corporate Website (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PORTAL_URL=http://localhost:4000
NEXT_PUBLIC_PORTAL_HEALTH_URL=http://localhost:3001/api/portal/health
```

#### E-Banking Portal (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CORPORATE_URL=http://localhost:3002
```

---

### 4.2 Port Configuration

| Application | Port | Purpose |
|-------------|------|---------|
| Backend Core API | 3001 | Main API server |
| Corporate Website | 3002 | Public website + login |
| Admin Interface | 3002 | Admin panel (conflicts with corporate!) |
| E-Banking Portal | 4000 | User dashboard |

**⚠️ Port Conflict:** Admin Interface and Corporate Website both use port 3002

---

## 5. Data Structure Expectations

### 5.1 User Object

**Frontend Expects:**

```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  kycStatus?: string;
}
```

**Backend Provides:**

```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: DateTime;
  status: string;
  kycStatus: string;
  tier: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

**✅ Compatible** - Frontend subset of backend

---

### 5.2 Account Object

**Frontend Expects:**

```typescript
{
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
}
```

**Backend Provides:**

```typescript
{
  id: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  balance: Decimal;
  status: string;
  interestRate: Decimal;
  dailyLimit: Decimal;
  monthlyLimit: Decimal;
  createdAt: DateTime;
}
```

**✅ Compatible** - Frontend subset of backend

---

### 5.3 Transaction Object

**Frontend Expects:**

```typescript
{
  id: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
  category: string;
}
```

**Backend Provides:**

```typescript
{
  id: string;
  type: string;  // DEPOSIT, WITHDRAWAL, TRANSFER, WIRE
  amount: Decimal;
  currency: string;
  status: string;
  description: string;
  reference: string;
  createdAt: DateTime;
}
```

**⚠️ Mismatch:**

- Frontend expects `type: 'credit' | 'debit'`
- Backend provides `type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'WIRE'`
- Frontend expects `category` field (missing in backend)
- Frontend expects `date` field (backend has `createdAt`)

---

## 6. HTTP Client Configuration

### 6.1 Corporate Website Axios Config

```typescript
{
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000
}
```

**Interceptors:**

- Request: None
- Response: Error logging only

---

### 6.2 E-Banking Portal Axios Config

```typescript
{
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000
}
```

**Interceptors:**

- Request: Add `Authorization: Bearer {token}` header
- Response: Auto token refresh on 401, error handling

---

## 7. Summary of API Gaps

### 7.1 Missing Endpoints (Backend Implementation Required)

| Endpoint | Method | Frontend | Priority |
|----------|--------|----------|----------|
| `/api/auth/refresh` | POST | E-Banking | 🔴 Critical |
| `/api/auth/me` | GET | E-Banking | 🔴 Critical |
| `/api/contact` | POST | Corporate | 🟡 Medium |
| `/api/account-applications` | POST | Corporate | 🟡 Medium |
| `/api/transfers` | POST | E-Banking | 🔴 Critical |
| `/api/transfers` | GET | E-Banking | 🟡 Medium |
| `/api/cards` | GET | E-Banking | 🟢 Low |
| `/api/cards/:id/freeze` | POST | E-Banking | 🟢 Low |
| `/api/cards/:id/unfreeze` | POST | E-Banking | 🟢 Low |
| `/api/bills` | GET | E-Banking | 🟢 Low |
| `/api/bills/pay` | POST | E-Banking | 🟢 Low |
| `/api/beneficiaries` | GET | E-Banking | 🟡 Medium |
| `/api/beneficiaries` | POST | E-Banking | 🟡 Medium |
| `/api/beneficiaries/:id` | DELETE | E-Banking | 🟡 Medium |
| `/api/statements` | GET | E-Banking | 🟡 Medium |
| `/api/statements/:id/download` | GET | E-Banking | 🟡 Medium |

**Total Missing:** 16 endpoints

---

### 7.2 Endpoint Mismatches (Refactoring Required)

| Frontend Endpoint | Backend Endpoint | Issue |
|-------------------|------------------|-------|
| `/api/profile` | `/api/auth/profile` | Path mismatch |
| `/api/profile/change-password` | `/api/auth/change-password` | Path mismatch |
| `/api/auth/me` | `/api/auth/profile` | Different endpoint name |
| `/api/transfers` | `/api/transactions/transfer` | Different resource structure |

---

## 8. Next Steps

This completes **Phase 1, Task 1.2 - Frontend API Requirements Analysis**.

**Proceed to:**

- **Task 1.3:** Create Compatibility Matrix

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-17  
**Prepared By:** Integration Team
