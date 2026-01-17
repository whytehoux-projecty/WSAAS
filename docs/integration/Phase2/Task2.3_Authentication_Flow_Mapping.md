# Phase 2, Task 2.3 - Authentication Flow Mapping

**Date:** 2026-01-17  
**Project:** AURUM VAULT Banking Integration  
**Task:** Unified authentication strategy and flow documentation

---

## Executive Summary

This document provides a **comprehensive authentication architecture** for the AURUM VAULT system, mapping the complete user journey from login through session management to logout. It includes:

- Unified authentication strategy
- Token lifecycle management
- Cross-application authentication flow
- Session management approach
- Security best practices
- Implementation guidelines

---

## System Architecture Overview

### Applications

| Application | Port | Role | Authentication Type |
|-------------|------|------|---------------------|
| **Corporate Website** | 3002 | Public site + Login portal | Public + Login form |
| **E-Banking Portal** | 4000 | User dashboard | Protected (JWT required) |
| **Admin Interface** | 3002* | Admin panel | Admin-only (JWT + role) |
| **Backend Core API** | 3001 | API server | JWT validation |

*Port conflict with Corporate Website - needs resolution

---

## Authentication Mechanisms

### 1. JWT-Based Authentication

**Technology:** JSON Web Tokens (jsonwebtoken library)

**Token Types:**

- **Access Token:** Short-lived (15 minutes), used for API requests
- **Refresh Token:** Long-lived (7 days), used to obtain new access tokens

**Token Structure:**

```typescript
// Access Token Payload
{
  userId: string;
  email: string;
  iat: number;        // Issued at
  exp: number;        // Expires at (15 min)
}

// Refresh Token Payload
{
  userId: string;
  sessionId: string;
  iat: number;
  exp: number;        // Expires at (7 days)
}
```

**Signing:**

```typescript
const accessToken = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

const refreshToken = jwt.sign(
  { userId: user.id, sessionId: session.id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

---

### 2. Session Management

**Database:** SQLite with Prisma ORM

**Session Table:**

```prisma
model UserSession {
  id             String   @id @default(cuid())
  userId         String   @map("user_id")
  sessionId      String   @unique @map("session_id")  // JWT refresh token
  ipAddress      String   @map("ip_address")
  userAgent      String   @map("user_agent")
  isActive       Boolean  @default(true) @map("is_active")
  expiresAt      DateTime @map("expires_at")
  lastActivityAt DateTime @default(now()) @map("last_activity_at")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  
  user           User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Session Lifecycle:**

1. Created on successful login
2. Updated on each API request (lastActivityAt)
3. Validated on token refresh
4. Invalidated on logout
5. Auto-expired after 7 days

---

## Complete Authentication Flow

### Flow 1: User Registration

```
┌─────────────────┐
│ Corporate       │
│ Website         │
│ /signup         │
└────────┬────────┘
         │
         │ 1. Fill registration form
         │    (email, password, firstName, lastName, phone, dateOfBirth)
         │
         ▼
┌─────────────────┐
│ POST            │
│ /api/auth/      │
│ register        │
└────────┬────────┘
         │
         │ 2. Validate data
         │ 3. Check age >= 18
         │ 4. Hash password (bcrypt)
         │ 5. Create user record
         │ 6. Set kycStatus = PENDING
         │ 7. Generate tokens
         │ 8. Create session
         │
         ▼
┌─────────────────┐
│ Response:       │
│ {               │
│   accessToken,  │
│   refreshToken, │
│   user: {...}   │
│ }               │
└────────┬────────┘
         │
         │ 9. Store tokens in localStorage
         │ 10. Redirect to E-Banking Portal
         │
         ▼
┌─────────────────┐
│ E-Banking       │
│ Portal          │
│ /dashboard      │
└─────────────────┘
```

**Key Points:**

- Password hashed with bcrypt (12 rounds)
- Age verification (18+ required)
- KYC status set to PENDING
- Immediate login after registration
- Seamless redirect to dashboard

---

### Flow 2: User Login (Corporate Website → E-Banking Portal)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CORPORATE WEBSITE (Port 3002)                │
└─────────────────────────────────────────────────────────────────┘

Step 1: User visits login page
┌─────────────────┐
│ /login          │
│                 │
│ [Account Number]│ ← User enters account number or email
│ [Password]      │ ← User enters password
│ [Remember Me]   │
│                 │
│ [Sign In]       │
└────────┬────────┘
         │
         │ 2. Check portal status
         │    GET /api/portal/health
         │
         ▼
┌─────────────────┐
│ Portal Status   │
│ Check           │
└────────┬────────┘
         │
         │ If offline → Show error
         │ If online → Continue
         │
         ▼
┌─────────────────┐
│ POST            │
│ /api/auth/login │
│                 │
│ Body: {         │
│   accountNumber │ ← OR email
│   password      │
│ }               │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND CORE API (Port 3001)                 │
└─────────────────────────────────────────────────────────────────┘

Step 3: Backend authentication
┌─────────────────┐
│ Validate input  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query user by:  │
│ - accountNumber │
│   OR            │
│ - email         │
└────────┬────────┘
         │
         │ User not found → 401 Unauthorized
         │
         ▼
┌─────────────────┐
│ Check account   │
│ status          │
└────────┬────────┘
         │
         │ SUSPENDED → 403 Forbidden
         │ LOCKED → 401 Account Locked
         │
         ▼
┌─────────────────┐
│ Verify password │
│ (bcrypt.compare)│
└────────┬────────┘
         │
         │ Invalid → Increment login attempts
         │         → Lock if attempts >= 5
         │         → 401 Unauthorized
         │
         ▼
┌─────────────────┐
│ Reset login     │
│ attempts to 0   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate tokens │
│ - Access (15min)│
│ - Refresh (7d)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create session  │
│ record in DB    │
│ - sessionId     │
│ - ipAddress     │
│ - userAgent     │
│ - expiresAt     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update user     │
│ lastLoginAt     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create audit log│
│ - action: LOGIN │
│ - userId        │
│ - ipAddress     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Response:       │
│ {               │
│   accessToken,  │
│   refreshToken, │
│   user: {       │
│     id,         │
│     email,      │
│     firstName,  │
│     lastName,   │
│     kycStatus   │
│   }             │
│ }               │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CORPORATE WEBSITE (Port 3002)                │
└─────────────────────────────────────────────────────────────────┘

Step 4: Handle login response
┌─────────────────┐
│ Store tokens in │
│ localStorage:   │
│ - accessToken   │
│ - refreshToken  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│ E-Banking Portal│
│                 │
│ URL:            │
│ http://         │
│ localhost:4000/ │
│ dashboard?token=│
│ {accessToken}   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  E-BANKING PORTAL (Port 4000)                   │
└─────────────────────────────────────────────────────────────────┘

Step 5: Dashboard initialization
┌─────────────────┐
│ /dashboard      │
│ ?token=xxx      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract token   │
│ from URL query  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store in        │
│ localStorage    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Clean URL       │
│ (remove token)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fetch user data │
│ GET /api/auth/me│
│ Header:         │
│ Authorization:  │
│ Bearer {token}  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Load dashboard  │
│ - Accounts      │
│ - Transactions  │
│ - Balance       │
└─────────────────┘
```

**Security Measures:**

- ✅ Portal status check before login
- ✅ Account lockout after 5 failed attempts
- ✅ Password hashing with bcrypt
- ✅ Session tracking with IP and user agent
- ✅ Audit logging for all login attempts
- ✅ Token passed via URL (one-time use)
- ✅ URL cleaned after token extraction

---

### Flow 3: Authenticated API Requests

```
┌─────────────────────────────────────────────────────────────────┐
│                  E-BANKING PORTAL (Port 4000)                   │
└─────────────────────────────────────────────────────────────────┘

User action (e.g., view accounts)
┌─────────────────┐
│ GET /api/       │
│ accounts        │
└────────┬────────┘
         │
         │ Axios Request Interceptor
         │
         ▼
┌─────────────────┐
│ Add header:     │
│ Authorization:  │
│ Bearer {token}  │
│                 │
│ Token from:     │
│ localStorage    │
│ .getItem(       │
│ 'accessToken')  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND CORE API (Port 3001)                 │
└─────────────────────────────────────────────────────────────────┘

Authentication Middleware
┌─────────────────┐
│ Extract token   │
│ from header     │
└────────┬────────┘
         │
         │ No token → 401 Unauthorized
         │
         ▼
┌─────────────────┐
│ Verify JWT      │
│ signature       │
└────────┬────────┘
         │
         │ Invalid → 401 Token Invalid
         │ Expired → 401 Token Expired
         │
         ▼
┌─────────────────┐
│ Query session   │
│ from database   │
│ WHERE:          │
│ - sessionId     │
│ - isActive=true │
│ - expiresAt>now │
└────────┬────────┘
         │
         │ No session → 401 Session Invalid
         │
         ▼
┌─────────────────┐
│ Check user      │
│ status          │
└────────┬────────┘
         │
         │ SUSPENDED → 403 Account Suspended
         │
         ▼
┌─────────────────┐
│ Attach user to  │
│ request object  │
│ request.user = {│
│   userId,       │
│   email,        │
│   kycStatus     │
│ }               │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update session  │
│ lastActivityAt  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Continue to     │
│ route handler   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Process request │
│ & return data   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  E-BANKING PORTAL (Port 4000)                   │
└─────────────────────────────────────────────────────────────────┘

Response handling
┌─────────────────┐
│ Success (200)   │
│ → Display data  │
└─────────────────┘
```

**Key Points:**

- Every request includes Authorization header
- Token validated on every request
- Session activity tracked
- User context available in all handlers

---

### Flow 4: Token Refresh (Automatic)

```
┌─────────────────────────────────────────────────────────────────┐
│                  E-BANKING PORTAL (Port 4000)                   │
└─────────────────────────────────────────────────────────────────┘

API request with expired access token
┌─────────────────┐
│ GET /api/       │
│ accounts        │
│                 │
│ Authorization:  │
│ Bearer {expired}│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND CORE API (Port 3001)                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Token expired   │
│ 401 Unauthorized│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  E-BANKING PORTAL (Port 4000)                   │
└─────────────────────────────────────────────────────────────────┘

Axios Response Interceptor
┌─────────────────┐
│ Detect 401      │
│ error           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check if        │
│ refresh already │
│ in progress     │
└────────┬────────┘
         │
         │ Yes → Queue request
         │ No → Start refresh
         │
         ▼
┌─────────────────┐
│ Get refreshToken│
│ from localStorage│
└────────┬────────┘
         │
         │ No token → Redirect to login
         │
         ▼
┌─────────────────┐
│ POST /api/auth/ │
│ refresh         │
│                 │
│ Body: {         │
│   refreshToken  │
│ }               │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND CORE API (Port 3001)                 │
└─────────────────────────────────────────────────────────────────┘

Token refresh handler
┌─────────────────┐
│ Verify refresh  │
│ token JWT       │
└────────┬────────┘
         │
         │ Invalid → 401
         │
         ▼
┌─────────────────┐
│ Query session   │
│ from database   │
└────────┬────────┘
         │
         │ Not found → 401
         │ Expired → 401
         │ User suspended → 401
         │
         ▼
┌─────────────────┐
│ Generate new    │
│ access token    │
│ (15 min)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update session  │
│ lastActivityAt  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Response:       │
│ {               │
│   accessToken,  │
│   expiresIn:900 │
│ }               │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  E-BANKING PORTAL (Port 4000)                   │
└─────────────────────────────────────────────────────────────────┘

Handle refresh response
┌─────────────────┐
│ Store new       │
│ accessToken in  │
│ localStorage    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update original │
│ request header  │
│ with new token  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Retry original  │
│ request         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Process queued  │
│ requests        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Success!        │
│ User unaware of │
│ token refresh   │
└─────────────────┘
```

**Key Points:**

- Automatic and transparent to user
- Prevents multiple simultaneous refresh requests
- Queues requests during refresh
- Falls back to login if refresh fails
- Maintains user session seamlessly

---

### Flow 5: User Logout

```
┌─────────────────────────────────────────────────────────────────┐
│                  E-BANKING PORTAL (Port 4000)                   │
└─────────────────────────────────────────────────────────────────┘

User clicks logout
┌─────────────────┐
│ Logout button   │
│ clicked         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /api/auth/ │
│ logout          │
│                 │
│ Authorization:  │
│ Bearer {token}  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND CORE API (Port 3001)                 │
└─────────────────────────────────────────────────────────────────┘

Logout handler
┌─────────────────┐
│ Get user from   │
│ request.user    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Invalidate      │
│ session:        │
│ UPDATE sessions │
│ SET isActive=   │
│ false           │
│ WHERE userId    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create audit log│
│ - action: LOGOUT│
│ - userId        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Response:       │
│ {               │
│   success: true,│
│   message:      │
│   "Logged out"  │
│ }               │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  E-BANKING PORTAL (Port 4000)                   │
└─────────────────────────────────────────────────────────────────┘

Cleanup
┌─────────────────┐
│ Clear           │
│ localStorage:   │
│ - accessToken   │
│ - refreshToken  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Redirect to     │
│ Corporate       │
│ Website login   │
│                 │
│ http://         │
│ localhost:3002/ │
│ login           │
└─────────────────┘
```

**Key Points:**

- Server-side session invalidation
- Client-side token cleanup
- Audit trail created
- Redirect to login page

---

## Security Best Practices

### 1. Token Security

**Access Token:**

- ✅ Short-lived (15 minutes)
- ✅ Stored in localStorage (XSS risk mitigated by CSP)
- ✅ Transmitted via Authorization header
- ✅ Never logged or exposed in URLs (except one-time redirect)

**Refresh Token:**

- ✅ Long-lived (7 days)
- ✅ Stored in localStorage
- ✅ Used only for token refresh
- ✅ Invalidated on logout
- ✅ One refresh token per session

**Recommendations:**

- ⚠️ Consider httpOnly cookies for refresh tokens (more secure)
- ⚠️ Implement refresh token rotation
- ⚠️ Add device fingerprinting

---

### 2. Password Security

**Hashing:**

```typescript
import bcrypt from 'bcryptjs';

// Registration
const hashedPassword = await bcrypt.hash(password, 12);  // 12 rounds

// Login
const isValid = await bcrypt.compare(password, user.password);
```

**Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Validation Regex:**

```typescript
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
```

---

### 3. Account Protection

**Login Attempts:**

- Track failed login attempts
- Lock account after 5 failures
- Lockout duration: 15 minutes
- Reset attempts on successful login

**Implementation:**

```typescript
// Increment on failure
await prisma.user.update({
  where: { id: user.id },
  data: {
    loginAttempts: { increment: 1 },
    lockedUntil: user.loginAttempts >= 4 
      ? new Date(Date.now() + 15 * 60 * 1000)
      : undefined
  }
});

// Reset on success
await prisma.user.update({
  where: { id: user.id },
  data: {
    loginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date()
  }
});
```

---

### 4. Session Management

**Session Limits:**

- Maximum 5 concurrent sessions per user
- Oldest session auto-invalidated when limit reached
- Session timeout: 7 days of inactivity

**Activity Tracking:**

```typescript
// Update on every authenticated request
await prisma.userSession.update({
  where: { id: session.id },
  data: { lastActivityAt: new Date() }
});
```

---

### 5. Audit Logging

**Log Events:**

- LOGIN (successful)
- LOGIN_FAILED (failed attempt)
- LOGOUT
- TOKEN_REFRESH
- PASSWORD_CHANGE
- ACCOUNT_LOCKED
- ACCOUNT_UNLOCKED

**Log Structure:**

```typescript
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'LOGIN',
    entityType: 'USER',
    entityId: user.id,
    ipAddress: request.ip,
    userAgent: request.headers['user-agent'],
    sessionId: session.id,
    severity: 'INFO',
    category: 'AUTHENTICATION'
  }
});
```

---

## Environment Configuration

### Shared JWT Secret

**Critical:** All applications must use the **same JWT_SECRET**

**Backend (.env):**

```
JWT_SECRET=your-super-secret-key-change-in-production
```

**Verification:**

```bash
# Ensure all .env files have identical JWT_SECRET
grep JWT_SECRET backend/core-api/.env
grep JWT_SECRET admin-interface/.env
```

---

### CORS Configuration

**Backend must allow frontend origins:**

```typescript
// backend/core-api/src/server.ts
await fastify.register(cors, {
  origin: [
    'http://localhost:3002',  // Corporate Website
    'http://localhost:4000',  // E-Banking Portal
    process.env.CORPORATE_URL,
    process.env.PORTAL_URL
  ],
  credentials: true
});
```

---

## Implementation Checklist

### Backend Tasks

- [ ] **AUTH-001:** Implement `/api/auth/refresh` endpoint
- [ ] **AUTH-002:** Modify login to accept accountNumber OR email
- [ ] **AUTH-003:** Add session cleanup on logout
- [ ] **AUTH-004:** Implement session limit (max 5 per user)
- [ ] **AUTH-005:** Add audit logging for all auth events
- [ ] **AUTH-006:** Implement account lockout mechanism
- [ ] **AUTH-007:** Add password strength validation

### Frontend Tasks

- [ ] **FRONT-001:** Implement automatic token refresh in E-Banking Portal
- [ ] **FRONT-002:** Add token cleanup on logout
- [ ] **FRONT-003:** Handle 401 errors gracefully
- [ ] **FRONT-004:** Implement session timeout warning
- [ ] **FRONT-005:** Add "Remember Me" functionality
- [ ] **FRONT-006:** Implement logout confirmation dialog

### Testing Tasks

- [ ] **TEST-001:** Test complete login flow
- [ ] **TEST-002:** Test token refresh mechanism
- [ ] **TEST-003:** Test logout flow
- [ ] **TEST-004:** Test account lockout
- [ ] **TEST-005:** Test concurrent sessions
- [ ] **TEST-006:** Test session expiration
- [ ] **TEST-007:** Test cross-origin requests

---

## Troubleshooting Guide

### Issue: "Token Invalid" Error

**Possible Causes:**

1. JWT_SECRET mismatch between applications
2. Token expired
3. Session invalidated
4. User account suspended

**Solution:**

```bash
# Verify JWT_SECRET is identical
echo $JWT_SECRET

# Check token expiration
jwt.verify(token, secret)

# Query session status
SELECT * FROM user_sessions WHERE session_id = ?
```

---

### Issue: Token Refresh Fails

**Possible Causes:**

1. Refresh token expired (>7 days)
2. Session not found in database
3. User account suspended
4. Network error

**Solution:**

- Clear localStorage and re-login
- Check session in database
- Verify user account status

---

### Issue: CORS Error

**Possible Causes:**

1. Origin not in allowed list
2. Credentials not enabled
3. Preflight request failing

**Solution:**

```typescript
// Add origin to CORS config
origin: ['http://localhost:4000']

// Enable credentials
credentials: true
```

---

## Next Steps

**Phase 2 Complete!**

Ready to proceed to:

- **Phase 3:** Implementation
  - Week 1: Critical fixes
  - Week 2: Core features
  - Week 3-4: Enhanced features

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-17  
**Phase 2 Status:** ✅ COMPLETE
