# Phase 1, Task 1.1 - Backend API Inventory

**Date:** 2026-01-17  
**Project:** AURUM VAULT Banking Integration  
**Task:** Backend API Comprehensive Inventory

---

## Executive Summary

The AURUM VAULT backend consists of:

- **Core API** (Port: 3001) - Main banking operations API
- **Admin Interface** (Port: 3002) - Administrative panel with proxy API
- **Shared Library** - Common validation schemas, constants, and utilities
- **Database:** SQLite with Prisma ORM
- **Authentication:** JWT-based with session management

---

## 1. API Endpoints Inventory

### 1.1 Core API - Base URL: `http://localhost:3001/api`

#### **System & Health Endpoints** (Public)

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/health` | Service health check with DB/Redis status | ❌ No |
| GET | `/info` | API version and endpoint documentation | ❌ No |
| GET | `/statistics` | Platform statistics (users, accounts, transactions) | ❌ No |

**File:** `/backend/core-api/src/routes/system.ts`

---

#### **Authentication Endpoints**

| Method | Endpoint | Purpose | Auth Required | Request Body |
|--------|----------|---------|---------------|--------------|
| POST | `/auth/register` | Register new user account | ❌ No | email, password, firstName, lastName, phone, dateOfBirth, address (optional) |
| POST | `/auth/login` | User login | ❌ No | email, password |
| POST | `/auth/logout` | User logout | ❌ No | (uses session from body) |
| GET | `/auth/verify-token` | Verify JWT token validity | ❌ No | token in query/headers |
| GET | `/auth/profile` | Get current user profile | ✅ Yes | - |
| PUT | `/auth/profile` | Update user profile | ✅ Yes | firstName, lastName, phone |
| POST | `/auth/change-password` | Change user password | ✅ Yes | currentPassword, newPassword |

**File:** `/backend/core-api/src/routes/auth.ts`

**Response Format (Success):**

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "firstName": "...", "lastName": "..." },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here",
      "expiresIn": 86400
    }
  }
}
```

---

#### **User Management Endpoints** (Protected)

| Method | Endpoint | Purpose | Auth Required | Query Params |
|--------|----------|---------|---------------|--------------|
| GET | `/users` | Get all users with pagination | ✅ Yes | page, limit, search, kycStatus, tier |
| GET | `/users/:userId` | Get specific user details | ✅ Yes | - |
| POST | `/users` | Create new user | ✅ Yes | email, password, firstName, lastName |
| PUT | `/users/:userId` | Update user information | ✅ Yes | firstName, lastName, phone, tier |
| POST | `/users/:userId/suspend` | Suspend user account | ✅ Yes | reason |
| POST | `/users/:userId/activate` | Activate suspended user | ✅ Yes | - |
| GET | `/users/statistics` | Get user statistics | ✅ Yes | - |

**File:** `/backend/core-api/src/routes/users.ts`

---

#### **Account Management Endpoints** (Protected)

| Method | Endpoint | Purpose | Auth Required | Request/Query Params |
|--------|----------|---------|---------------|----------------------|
| GET | `/accounts` | Get user accounts list | ✅ Yes | page, limit, status |
| GET | `/accounts/:accountId` | Get specific account details | ✅ Yes | - |
| POST | `/accounts` | Create new account | ✅ Yes | accountType, currency, nickname, initialDeposit |
| PUT | `/accounts/:accountId` | Update account settings | ✅ Yes | status, dailyLimit, monthlyLimit |
| GET | `/accounts/:accountId/balance` | Get account balance | ✅ Yes | - |
| GET | `/accounts/:accountId/transactions` | Get account transaction history | ✅ Yes | page, limit, startDate, endDate |

**File:** `/backend/core-api/src/routes/accounts.ts`

**Account Types:**

- `CHECKING` - Standard checking account
- `SAVINGS` - Savings account with interest
- `INVESTMENT` - Investment account
- `CREDIT` - Credit account

---

#### **Transaction Endpoints** (Protected)

| Method | Endpoint | Purpose | Auth Required | Request Body |
|--------|----------|---------|---------------|--------------|
| GET | `/transactions` | Get user transactions | ✅ Yes | page, limit, accountId, type, status, startDate, endDate |
| GET | `/transactions/:transactionId` | Get specific transaction | ✅ Yes | - |
| POST | `/transactions/deposit` | Create deposit transaction | ✅ Yes | accountId, amount, currency, description |
| POST | `/transactions/withdrawal` | Create withdrawal transaction | ✅ Yes | accountId, amount, currency, description |
| POST | `/transactions/transfer` | Create transfer between accounts | ✅ Yes | fromAccountId, toAccountId, amount, currency, description |
| GET | `/transactions/statistics` | Get transaction statistics | ✅ Yes | startDate, endDate |

**File:** `/backend/core-api/src/routes/transactions.ts`

**Transaction Types:**

- `DEPOSIT` - Deposit to account
- `WITHDRAWAL` - Withdrawal from account
- `TRANSFER` - Transfer between accounts
- `WIRE` - Wire transfer

**Transaction Status:**

- `PENDING` - Awaiting processing
- `COMPLETED` - Successfully processed
- `FAILED` - Processing failed
- `CANCELLED` - Cancelled by user/system

---

#### **Wire Transfer Endpoints** (Protected + KYC Required)

| Method | Endpoint | Purpose | Auth Required | Request Body |
|--------|----------|---------|---------------|--------------|
| GET | `/wire-transfers` | Get user wire transfers | ✅ Yes + KYC | page, limit, status |
| GET | `/wire-transfers/:wireTransferId` | Get specific wire transfer | ✅ Yes + KYC | - |
| POST | `/wire-transfers` | Create new wire transfer | ✅ Yes + KYC | fromAccountId, amount, currency, recipientName, recipientBank, recipientAccount, swiftCode (optional), purpose |
| PATCH | `/wire-transfers/:wireTransferId/cancel` | Cancel pending wire transfer | ✅ Yes + KYC | - |
| GET | `/wire-transfers/fees` | Calculate wire transfer fees | ❌ No | amount, currency |
| GET | `/wire-transfers/reference/generate` | Generate wire reference number | ❌ No | - |

**File:** `/backend/core-api/src/routes/wire-transfers.ts`

**Compliance Status:**

- `PENDING` - Awaiting compliance review
- `APPROVED` - Compliance approved
- `REJECTED` - Compliance rejected
- `UNDER_REVIEW` - Manual review required

---

#### **KYC Document Endpoints** (Protected)

| Method | Endpoint | Purpose | Auth Required | Request Body |
|--------|----------|---------|---------------|--------------|
| GET | `/kyc/documents` | Get user KYC documents | ✅ Yes | - |
| POST | `/kyc/documents` | Upload KYC document | ✅ Yes | type, fileName, filePath, fileSize, mimeType |
| GET | `/kyc/documents/:documentId` | Get specific KYC document | ✅ Yes | - |
| DELETE | `/kyc/documents/:documentId` | Delete KYC document | ✅ Yes | - |
| GET | `/kyc/status` | Get user KYC status | ✅ Yes | - |

**File:** `/backend/core-api/src/routes/kyc.ts`

**KYC Status Values:**

- `PENDING` - Documents not submitted or under review
- `VERIFIED` - KYC verification complete
- `REJECTED` - KYC documents rejected
- `EXPIRED` - KYC verification expired

**Document Types:**

- `PASSPORT` - Passport document
- `DRIVERS_LICENSE` - Driver's license
- `NATIONAL_ID` - National ID card
- `UTILITY_BILL` - Proof of address
- `BANK_STATEMENT` - Proof of address

---

#### **Portal Status Endpoints** (Protected - Admin Only)

| Method | Endpoint | Purpose | Auth Required | Request Body |
|--------|----------|---------|---------------|--------------|
| GET | `/portal/status` | Get current portal status | ✅ Admin | - |
| POST | `/portal/status` | Update portal status | ✅ Admin | status, message, nextScheduledMaintenance, reason |
| GET | `/portal/status/history` | Get portal status change history | ✅ Admin | - |
| GET | `/portal/health` | Get portal health (public) | ❌ No | - |

**File:** `/backend/core-api/src/routes/portal.ts`

**Portal Status Values:**

- `online` - Portal fully operational
- `offline` - Portal down for maintenance
- `maintenance` - Scheduled maintenance
- `scheduled_downtime` - Planned downtime

---

### 1.2 Admin Interface API - Base URL: `http://localhost:3002`

#### **Admin Authentication Endpoints**

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| POST | `/auth/form-login` | Admin login (form-based) | email, password |
| POST | `/auth/form-logout` | Admin logout (form-based) | - |
| POST | `/auth/login` | Admin login (API) | email, password |
| POST | `/auth/logout` | Admin logout (API) | - |
| GET | `/auth/profile` | Get admin profile | - |
| PUT | `/auth/profile` | Update admin profile | firstName, lastName |
| PUT | `/auth/change-password` | Change admin password | currentPassword, newPassword |
| GET | `/auth/verify` | Verify admin token | - |

**File:** `/admin-interface/src/routes/auth.ts`

---

#### **Admin Management Endpoints** (All Protected - Admin Role Required)

| Method | Endpoint | Purpose | Query Params |
|--------|----------|---------|--------------|
| GET | `/admin/dashboard/stats` | Get dashboard statistics | - |
| GET | `/admin/users` | Get all users | page, limit, search, kycStatus |
| GET | `/admin/users/:userId` | Get user by ID | - |
| PUT | `/admin/users/:userId/status` | Update user status | status, reason |
| PUT | `/admin/users/:userId/kyc-status` | Update KYC status | kycStatus, notes |
| GET | `/admin/transactions` | Get all transactions | page, limit, status, userId |
| GET | `/admin/wire-transfers` | Get all wire transfers | page, limit, status |
| PUT | `/admin/wire-transfers/:transferId/status` | Update wire transfer status | status, notes |
| GET | `/admin/audit-logs` | Get audit logs | page, limit, userId, action |

**File:** `/admin-interface/src/routes/admin.ts`

---

#### **Admin Portal Status Proxy Endpoints**

These endpoints proxy requests to the Core API:

| Method | Endpoint | Purpose | Proxies To |
|--------|----------|---------|------------|
| GET | `/api/portal/status` | Get portal status | Core API `/portal/status` |
| POST | `/api/portal/status` | Update portal status | Core API `/portal/status` |
| GET | `/api/portal/status/history` | Get status history | Core API `/portal/status/history` |
| GET | `/api/portal/health` | Get portal health | Core API `/portal/health` |

**File:** `/admin-interface/src/routes/portal-status.ts`

---

## 2. Authentication & Authorization

### 2.1 Authentication Mechanism

**Technology:** JSON Web Tokens (JWT)

**Token Storage:**

- Core API: Database sessions table (`user_sessions`)
- Admin Interface: Cookie-based (`admin_token`)

**Token Lifetime:**

- Access Token: 15 minutes
- Refresh Token: 7 days
- Session Timeout: 24 hours

**Implementation Files:**

- Core API Middleware: `/backend/core-api/src/middleware/auth.ts`
- Admin Middleware: `/admin-interface/src/middleware/auth.ts`

---

### 2.2 Middleware Chain

#### Core API Middleware

1. `authenticateToken` - Validates JWT and session
2. `requireKYCVerified` - Ensures KYC status is VERIFIED
3. `requireActiveAccount` - Ensures account status is ACTIVE
4. `requireAdminRole` - Ensures user has admin privileges
5. `requireAccountOwnership` - Validates account belongs to user
6. `requireTransactionOwnership` - Validates transaction belongs to user

**File:** `/backend/core-api/src/middleware/auth.ts`

---

### 2.3 Authorization Levels

| Level | Description | Endpoints Accessible |
|-------|-------------|---------------------|
| Public | No authentication | `/health`, `/info`, `/auth/login`, `/auth/register` |
| Authenticated | Valid JWT token | All `/accounts`, `/transactions`, `/users`, `/kyc` |
| KYC Verified | KYC status = VERIFIED | All wire transfer endpoints |
| Admin | Admin role in AdminUser table | All `/admin/*` endpoints |

---

## 3. Database Schema

**Database Type:** SQLite  
**ORM:** Prisma  
**Schema File:** `/backend/core-api/prisma/schema.prisma`

### 3.1 Core Models

#### User Management

- `User` - End-user accounts
- `AdminUser` - Administrative users
- `UserSession` - User session tracking
- `AdminSession` - Admin session tracking
- `Address` - User addresses

#### Financial

- `Account` - Bank accounts
- `Transaction` - All transactions
- `WireTransfer` - Wire transfer details
- `FxRate` - Foreign exchange rates

#### Compliance

- `KycDocument` - KYC verification documents
- `AuditLog` - Audit trail for all actions

#### Portal Management

- `PortalStatus` - Current portal status
- `PortalStatusAudit` - Portal status change history

---

### 3.2 Key Relationships

```
User (1) ──< (Many) Account
Account (1) ──< (Many) Transaction
Transaction (1) ──< (1) WireTransfer
User (1) ──< (Many) KycDocument
User (1) ──< (1) Address
User (1) ──< (Many) UserSession
AdminUser (1) ──< (Many) AdminSession
```

---

## 4. Validation Schemas

**Library:** Zod  
**Location:** `/backend/shared/validation/index.ts`

### 4.1 Available Validation Schemas

- `registerSchema` - User registration
- `loginSchema` - User login
- `createAccountSchema` - Account creation
- `updateAccountSchema` - Account updates
- `transferSchema` - Transfer operations
- `createWireTransfer` - Wire transfer creation
- `wireTransferQuery` - Wire transfer queries
- `createKYCDocument` - KYC document upload

---

## 5. Error Handling

### 5.1 Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error"
      }
    ]
  }
}
```

### 5.2 Error Codes (Partial List)

**File:** `/backend/shared/constants/index.ts`

| Category | Code | Description |
|----------|------|-------------|
| Auth | `AUTH_001` | Invalid credentials |
| Auth | `AUTH_002` | Token expired |
| Auth | `AUTH_003` | Token invalid |
| Auth | `AUTH_004` | Account locked |
| Auth | `AUTH_005` | Account suspended |
| Validation | `VAL_001` | Validation failed |
| Business | `BIZ_001` | Insufficient funds |
| Business | `BIZ_002` | Daily limit exceeded |
| Business | `BIZ_003` | Monthly limit exceeded |
| System | `SYS_001` | Database error |
| System | `SYS_003` | Internal server error |
| KYC | `USER_004` | KYC required |

---

## 6. Response Formats

### 6.1 Success Response

```json
{
  "success": true,
  "data": { /* response payload */ },
  "message": "Optional success message"
}
```

### 6.2 Paginated Response

```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 7. Rate Limiting

**Configuration:** `/backend/shared/constants/index.ts`

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Login Attempts:** 5 per 15 minutes
- **Lockout Duration:** 15 minutes after max failed attempts

**Implementation:** `@fastify/rate-limit` plugin

---

## 8. CORS Configuration

**Allowed Origins:**

```javascript
[
  "http://localhost:3000",  // Corporate Website
  "http://localhost:3002",  // Admin Interface
  "https://aurumvault.com",
  "https://admin.aurumvault.com"
]
```

**File:** `/backend/shared/constants/index.ts`

---

## 9. File Upload Configuration

**Max File Size:** 5MB  
**Allowed MIME Types:**

- `image/jpeg`, `image/png`, `image/gif`
- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Upload Path:** `./uploads`  
**Temp Path:** `./temp`

---

## 10. Business Rules & Limits

### Transaction Limits (Default)

- **Daily Limit:** $10,000
- **Monthly Limit:** $100,000
- **Min Transaction:** $0.01
- **Max Transaction:** $1,000,000

### Wire Transfer Limits

- **Min Amount:** $100
- **Max Amount:** $500,000
- **Daily Limit:** $100,000
- **Base Fee:** $15
- **Domestic Fee:** $25
- **International Fee:** $45

### Account Minimums

- **Checking:** $0
- **Savings:** $100
- **Investment:** $1,000

**File:** `/backend/shared/constants/index.ts`

---

## 11. Security Features

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Session Security

- Secure cookies enabled
- HTTP-only cookies
- Same-site: strict
- Session timeout: 24 hours

### Account Protection

- Max login attempts: 5
- Lockout duration: 15 minutes
- Password history: Last 5 passwords

---

## 12. Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | ≥18.0.0 |
| Framework | Fastify | ^4.24.3 |
| Database | SQLite | - |
| ORM | Prisma | ^5.7.1 |
| Validation | Zod | ^3.22.4 |
| Authentication | JWT (jsonwebtoken) | ^9.0.2 |
| Password Hashing | bcrypt / bcryptjs | ^5.1.1 / ^2.4.3 |
| Logging | Winston | ^3.11.0 |
| Language | TypeScript | ^5.3.3 |

---

## 13. Key Files Reference

### Core API

- **Main Server:** `/backend/core-api/src/server.ts`
- **Route Index:** `/backend/core-api/src/routes/index.ts`
- **Auth Routes:** `/backend/core-api/src/routes/auth.ts`
- **Account Routes:** `/backend/core-api/src/routes/accounts.ts`
- **Transaction Routes:** `/backend/core-api/src/routes/transactions.ts`
- **Wire Transfer Routes:** `/backend/core-api/src/routes/wire-transfers.ts`
- **KYC Routes:** `/backend/core-api/src/routes/kyc.ts`
- **User Routes:** `/backend/core-api/src/routes/users.ts`
- **Portal Routes:** `/backend/core-api/src/routes/portal.ts`
- **System Routes:** `/backend/core-api/src/routes/system.ts`
- **Auth Middleware:** `/backend/core-api/src/middleware/auth.ts`
- **Prisma Schema:** `/backend/core-api/prisma/schema.prisma`

### Admin Interface

- **Main Server:** `/admin-interface/src/server.ts`
- **Route Index:** `/admin-interface/src/routes/index.ts`
- **Auth Routes:** `/admin-interface/src/routes/auth.ts`
- **Admin Routes:** `/admin-interface/src/routes/admin.ts`
- **Portal Status Routes:** `/admin-interface/src/routes/portal-status.ts`

### Shared

- **Constants:** `/backend/shared/constants/index.ts`
- **Validation Schemas:** `/backend/shared/validation/index.ts`

---

## 14. Environment Variables Required

### Core API (.env)

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV="development"
REDIS_URL="redis://localhost:6379" (optional)
```

### Admin Interface (.env)

```
DATABASE_URL="file:../core-api/dev.db"
JWT_SECRET="your-secret-key"
API_URL="http://localhost:3001"
PORT=3002
NODE_ENV="development"
```

---

## 15. Next Steps

This completes **Phase 1, Task 1.1 - Backend API Inventory**.

**Proceed to:**

- **Task 1.2:** Frontend API Requirements Analysis
- **Task 1.3:** Compatibility Matrix Creation

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-17  
**Prepared By:** Integration Team
