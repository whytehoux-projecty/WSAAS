# Phase 2, Task 2.1 - Missing Endpoints Detailed Specifications

**Date:** 2026-01-17  
**Project:** AURUM VAULT Banking Integration  
**Task:** Detailed specifications for all missing backend endpoints

---

## Executive Summary

This document provides **implementation-ready specifications** for all 16 missing backend endpoints identified in Phase 1. Each specification includes:

- Complete request/response schemas
- Validation rules
- Business logic requirements
- Database operations
- Error handling
- Security considerations
- Code implementation templates

---

## Priority Classification

| Priority | Count | Endpoints |
|----------|-------|-----------|
| 🔴 Critical | 3 | Token refresh, Auth/me, Transfers |
| 🟡 Medium | 7 | Contact, Applications, Beneficiaries, Statements |
| 🟢 Low | 6 | Cards, Bills |

---

## 🔴 CRITICAL PRIORITY ENDPOINTS

### 1. Token Refresh Endpoint

**Endpoint:** `POST /api/auth/refresh`  
**Priority:** 🔴 Critical  
**Required By:** E-Banking Portal  
**Implementation File:** `/backend/core-api/src/routes/auth.ts`

#### Purpose

Refresh expired access tokens using a valid refresh token to maintain user sessions without requiring re-login.

#### Request Specification

**Headers:**

```typescript
{
  'Content-Type': 'application/json'
}
```

**Body:**

```typescript
{
  refreshToken: string;  // Required, JWT refresh token
}
```

**Validation Schema (Zod):**

```typescript
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});
```

#### Response Specification

**Success Response (200 OK):**

```typescript
{
  success: true;
  data: {
    accessToken: string;      // New JWT access token
    refreshToken?: string;    // Optional: New refresh token (rotation)
    expiresIn: number;        // Token expiry in seconds (900 = 15min)
  };
}
```

**Example:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

#### Error Responses

**Invalid Refresh Token (401):**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_002",
    "message": "Invalid or expired refresh token"
  }
}
```

**Missing Refresh Token (400):**

```json
{
  "success": false,
  "error": {
    "code": "VAL_002",
    "message": "Refresh token is required"
  }
}
```

#### Business Logic

1. **Validate refresh token format**
2. **Verify JWT signature** using JWT_SECRET
3. **Check token expiration** (7 days max)
4. **Query database** for active session with matching refresh token
5. **Verify user status** is ACTIVE (not SUSPENDED)
6. **Generate new access token** with 15-minute expiry
7. **Optional: Rotate refresh token** for enhanced security
8. **Update session** last activity timestamp
9. **Return new tokens**

#### Database Operations

**Query:**

```typescript
const session = await prisma.userSession.findFirst({
  where: {
    sessionId: refreshToken,
    isActive: true,
    expiresAt: { gt: new Date() }
  },
  include: {
    user: {
      select: {
        id: true,
        email: true,
        status: true,
        kycStatus: true
      }
    }
  }
});
```

**Update:**

```typescript
await prisma.userSession.update({
  where: { id: session.id },
  data: { lastActivityAt: new Date() }
});
```

#### Security Considerations

- ✅ Verify JWT signature
- ✅ Check token expiration
- ✅ Validate session is active
- ✅ Check user account status
- ✅ Rate limit: 10 requests per 15 minutes per IP
- ✅ Log refresh attempts for audit
- ⚠️ Consider refresh token rotation (optional)

#### Implementation Template

```typescript
export const refreshToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(request.body);

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.TOKEN_EXPIRED,
          message: 'Invalid or expired refresh token'
        }
      });
    }

    // Check session
    const session = await prisma.userSession.findFirst({
      where: {
        sessionId: refreshToken,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!session || session.user.status === 'SUSPENDED') {
      return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
        success: false,
        error: {
          code: ERROR_CODES.TOKEN_INVALID,
          message: 'Session invalid or user suspended'
        }
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: session.user.id, email: session.user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    // Update session
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() }
    });

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: 900
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: 'Invalid request data',
          details: error.errors
        }
      });
    }

    request.log.error('Token refresh error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Failed to refresh token'
      }
    });
  }
};
```

#### Route Registration

```typescript
// In /backend/core-api/src/routes/index.ts
fastify.post('/auth/refresh', authRoutes.refreshToken);
```

#### Testing Checklist

- [ ] Valid refresh token returns new access token
- [ ] Expired refresh token returns 401
- [ ] Invalid refresh token returns 401
- [ ] Suspended user returns 401
- [ ] Missing refresh token returns 400
- [ ] Session last activity updates
- [ ] Rate limiting works correctly
- [ ] Audit log created

---

### 2. Get Current User Profile (Auth/Me)

**Endpoint:** `GET /api/auth/me`  
**Priority:** 🔴 Critical  
**Required By:** E-Banking Portal  
**Implementation:** Route alias to existing `/api/auth/profile`

#### Purpose

Provide an alias endpoint for retrieving current authenticated user's profile information.

#### Implementation Strategy

**Option A: Route Alias (Recommended)**

```typescript
// In /backend/core-api/src/routes/index.ts
fastify.get('/auth/me', authRoutes.getProfile);
```

**Option B: Dedicated Handler**

```typescript
export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  return getProfile(request, reply);
};
```

#### Request Specification

**Headers:**

```typescript
{
  'Authorization': 'Bearer {accessToken}'
}
```

#### Response Specification

**Success Response (200 OK):**

```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    kycStatus: string;
    tier: string;
    status: string;
    createdAt: string;
  };
}
```

#### Implementation

Since `/api/auth/profile` already exists, simply add alias:

```typescript
// In /backend/core-api/src/routes/index.ts
// Inside protected routes section
fastify.get('/auth/me', authRoutes.getProfile);
```

#### Testing Checklist

- [ ] `/auth/me` returns same data as `/auth/profile`
- [ ] Requires valid authentication token
- [ ] Returns 401 for invalid token
- [ ] Returns user data for valid token

---

### 3. Transfer Endpoint

**Endpoint:** `POST /api/transfers`  
**Priority:** 🔴 Critical  
**Required By:** E-Banking Portal  
**Implementation:** Route alias to existing `/api/transactions/transfer`

#### Purpose

Provide a RESTful endpoint for creating transfers between accounts.

#### Implementation Strategy

**Route Alias (Recommended):**

```typescript
// In /backend/core-api/src/routes/index.ts
fastify.post('/transfers', transactionRoutes.createTransfer);
```

#### Request Specification

**Headers:**

```typescript
{
  'Authorization': 'Bearer {accessToken}',
  'Content-Type': 'application/json'
}
```

**Body:**

```typescript
{
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency?: string;      // Default: 'USD'
  description: string;
  reference?: string;     // Optional
}
```

#### Response Specification

**Success Response (201 Created):**

```typescript
{
  success: true;
  data: {
    transaction: {
      id: string;
      type: 'TRANSFER';
      amount: number;
      currency: string;
      status: 'PENDING' | 'COMPLETED';
      description: string;
      reference: string;
      fromAccount: {
        id: string;
        accountNumber: string;
      };
      toAccount: {
        id: string;
        accountNumber: string;
      };
      createdAt: string;
    };
  };
  message: 'Transfer initiated successfully';
}
```

#### Implementation

```typescript
// In /backend/core-api/src/routes/index.ts
// Inside protected routes section
fastify.post('/transfers', transactionRoutes.createTransfer);
```

#### Testing Checklist

- [ ] `/transfers` works same as `/transactions/transfer`
- [ ] Validates account ownership
- [ ] Checks sufficient balance
- [ ] Creates transaction record
- [ ] Updates account balances
- [ ] Returns transaction details

---

## 🟡 MEDIUM PRIORITY ENDPOINTS

### 4. Contact Form Submission

**Endpoint:** `POST /api/contact`  
**Priority:** 🟡 Medium  
**Required By:** Corporate Website  
**Implementation File:** Create `/backend/core-api/src/routes/contact.ts`

#### Purpose

Handle contact form submissions from the corporate website.

#### Request Specification

**Headers:**

```typescript
{
  'Content-Type': 'application/json'
}
```

**Body:**

```typescript
{
  name: string;           // Required, 2-100 chars
  email: string;          // Required, valid email
  subject: string;        // Required, 5-200 chars
  message: string;        // Required, 10-2000 chars
  phone?: string;         // Optional
}
```

**Validation Schema:**

```typescript
const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
  phone: z.string().optional()
});
```

#### Response Specification

**Success Response (200 OK):**

```typescript
{
  success: true;
  data: {
    id: string;              // Contact submission ID
    submittedAt: string;
  };
  message: 'Thank you for contacting us. We will respond within 24 hours.';
}
```

#### Database Schema

**Add to Prisma schema:**

```prisma
model ContactSubmission {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String?
  subject     String
  message     String
  status      String   @default("NEW")  // NEW, IN_PROGRESS, RESOLVED
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now()) @map("created_at")
  respondedAt DateTime? @map("responded_at")
  respondedBy String?  @map("responded_by")
  
  @@map("contact_submissions")
}
```

#### Business Logic

1. **Validate input data**
2. **Check rate limiting** (5 submissions per hour per IP)
3. **Store in database**
4. **Send email notification** to admin
5. **Send confirmation email** to user
6. **Return success response**

#### Implementation Template

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { HTTP_STATUS, ERROR_CODES } from '@shared/index';

const prisma = new PrismaClient();

const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
  phone: z.string().optional()
});

export const submitContactForm = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const formData = contactFormSchema.parse(request.body);

    // Create contact submission
    const submission = await prisma.contactSubmission.create({
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      }
    });

    // TODO: Send email notifications
    // await sendAdminNotification(submission);
    // await sendUserConfirmation(formData.email);

    return reply.status(HTTP_STATUS.OK).send({
      success: true,
      data: {
        id: submission.id,
        submittedAt: submission.createdAt.toISOString()
      },
      message: 'Thank you for contacting us. We will respond within 24 hours.'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: 'Invalid form data',
          details: error.errors
        }
      });
    }

    request.log.error('Contact form error:', error);
    return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Failed to submit contact form'
      }
    });
  }
};

export default async function contactRoutes(fastify: FastifyInstance) {
  fastify.post('/contact', submitContactForm);
}
```

#### Route Registration

```typescript
// In /backend/core-api/src/routes/index.ts
import contactRoutes from './contact';

// Public routes section
await fastify.register(contactRoutes);
```

#### Testing Checklist

- [ ] Valid submission creates database record
- [ ] Invalid email returns validation error
- [ ] Missing required fields returns error
- [ ] Rate limiting prevents spam
- [ ] IP address and user agent captured
- [ ] Success message returned

---

### 5. Account Opening Application

**Endpoint:** `POST /api/account-applications`  
**Priority:** 🟡 Medium  
**Required By:** Corporate Website  
**Implementation File:** Create `/backend/core-api/src/routes/applications.ts`

#### Purpose

Handle account opening applications from prospective customers.

#### Request Specification

**Body:**

```typescript
{
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;        // ISO date
  
  // Address
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Account Preferences
  accountType: 'CHECKING' | 'SAVINGS' | 'INVESTMENT';
  initialDeposit?: number;
  
  // Employment (optional)
  employment?: {
    status: string;
    employer?: string;
    occupation?: string;
    annualIncome?: number;
  };
  
  // Consent
  termsAccepted: boolean;
  privacyAccepted: boolean;
}
```

**Validation Schema:**

```typescript
const applicationSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
  dateOfBirth: z.string().datetime(),
  address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string(),
    country: z.string().length(2)
  }),
  accountType: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT']),
  initialDeposit: z.number().min(0).optional(),
  employment: z.object({
    status: z.string(),
    employer: z.string().optional(),
    occupation: z.string().optional(),
    annualIncome: z.number().optional()
  }).optional(),
  termsAccepted: z.boolean().refine(val => val === true),
  privacyAccepted: z.boolean().refine(val => val === true)
});
```

#### Response Specification

**Success Response (201 Created):**

```typescript
{
  success: true;
  data: {
    applicationId: string;
    status: 'PENDING';
    submittedAt: string;
    estimatedReviewTime: string;  // e.g., "2-3 business days"
  };
  message: 'Application submitted successfully. You will receive an email confirmation shortly.';
}
```

#### Database Schema

```prisma
model AccountApplication {
  id                String   @id @default(cuid())
  applicationNumber String   @unique @map("application_number")
  
  // Personal Info
  firstName         String   @map("first_name")
  lastName          String   @map("last_name")
  email             String
  phone             String
  dateOfBirth       DateTime @map("date_of_birth")
  
  // Address
  street            String
  city              String
  state             String
  zipCode           String   @map("zip_code")
  country           String
  
  // Account Details
  accountType       String   @map("account_type")
  initialDeposit    Decimal? @map("initial_deposit")
  
  // Employment
  employmentStatus  String?  @map("employment_status")
  employer          String?
  occupation        String?
  annualIncome      Decimal? @map("annual_income")
  
  // Status
  status            String   @default("PENDING")  // PENDING, APPROVED, REJECTED, WITHDRAWN
  reviewedBy        String?  @map("reviewed_by")
  reviewedAt        DateTime? @map("reviewed_at")
  rejectionReason   String?  @map("rejection_reason")
  
  // Metadata
  ipAddress         String?  @map("ip_address")
  userAgent         String?  @map("user_agent")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  @@map("account_applications")
}
```

#### Business Logic

1. **Validate application data**
2. **Check age requirement** (18+ years)
3. **Generate unique application number** (e.g., APP-2024-001234)
4. **Store application in database**
5. **Send confirmation email** to applicant
6. **Notify admin team** for review
7. **Return application ID and status**

#### Implementation Template

```typescript
export const submitApplication = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const appData = applicationSchema.parse(request.body);

    // Check age requirement
    const age = calculateAge(new Date(appData.dateOfBirth));
    if (age < 18) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_FAILED,
          message: 'Applicant must be at least 18 years old'
        }
      });
    }

    // Generate application number
    const applicationNumber = await generateApplicationNumber();

    // Create application
    const application = await prisma.accountApplication.create({
      data: {
        applicationNumber,
        firstName: appData.firstName,
        lastName: appData.lastName,
        email: appData.email,
        phone: appData.phone,
        dateOfBirth: new Date(appData.dateOfBirth),
        street: appData.address.street,
        city: appData.address.city,
        state: appData.address.state,
        zipCode: appData.address.zipCode,
        country: appData.address.country,
        accountType: appData.accountType,
        initialDeposit: appData.initialDeposit,
        employmentStatus: appData.employment?.status,
        employer: appData.employment?.employer,
        occupation: appData.employment?.occupation,
        annualIncome: appData.employment?.annualIncome,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      }
    });

    // TODO: Send emails
    // await sendApplicantConfirmation(application);
    // await notifyAdminTeam(application);

    return reply.status(HTTP_STATUS.CREATED).send({
      success: true,
      data: {
        applicationId: application.id,
        applicationNumber: application.applicationNumber,
        status: 'PENDING',
        submittedAt: application.createdAt.toISOString(),
        estimatedReviewTime: '2-3 business days'
      },
      message: 'Application submitted successfully. You will receive an email confirmation shortly.'
    });
  } catch (error) {
    // Error handling...
  }
};
```

---

### 6-8. Beneficiary Management Endpoints

**Endpoints:**

- `GET /api/beneficiaries` - List beneficiaries
- `POST /api/beneficiaries` - Add beneficiary
- `DELETE /api/beneficiaries/:id` - Remove beneficiary

**Priority:** 🟡 Medium  
**Required By:** E-Banking Portal

#### Database Schema

```prisma
model Beneficiary {
  id                String   @id @default(cuid())
  userId            String   @map("user_id")
  name              String
  accountNumber     String   @map("account_number")
  bankName          String   @map("bank_name")
  swiftCode         String?  @map("swift_code")
  routingNumber     String?  @map("routing_number")
  beneficiaryType   String   @default("DOMESTIC")  // DOMESTIC, INTERNATIONAL
  nickname          String?
  isVerified        Boolean  @default(false) @map("is_verified")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  // Relations
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("beneficiaries")
}
```

#### GET /api/beneficiaries

**Response:**

```typescript
{
  success: true;
  data: {
    beneficiaries: [
      {
        id: string;
        name: string;
        accountNumber: string;
        bankName: string;
        swiftCode?: string;
        nickname?: string;
        beneficiaryType: 'DOMESTIC' | 'INTERNATIONAL';
        isVerified: boolean;
        createdAt: string;
      }
    ];
  };
}
```

#### POST /api/beneficiaries

**Request:**

```typescript
{
  name: string;
  accountNumber: string;
  bankName: string;
  swiftCode?: string;
  routingNumber?: string;
  beneficiaryType: 'DOMESTIC' | 'INTERNATIONAL';
  nickname?: string;
}
```

#### DELETE /api/beneficiaries/:id

**Response:**

```typescript
{
  success: true;
  message: 'Beneficiary removed successfully';
}
```

---

### 9-10. Statement Endpoints

**Endpoints:**

- `GET /api/statements` - List statements
- `GET /api/statements/:id/download` - Download PDF

**Priority:** 🟡 Medium  
**Required By:** E-Banking Portal

#### Database Schema

```prisma
model Statement {
  id            String   @id @default(cuid())
  accountId     String   @map("account_id")
  statementType String   @map("statement_type")  // MONTHLY, QUARTERLY, ANNUAL
  periodStart   DateTime @map("period_start")
  periodEnd     DateTime @map("period_end")
  filePath      String   @map("file_path")
  fileSize      Int      @map("file_size")
  generatedAt   DateTime @default(now()) @map("generated_at")
  
  // Relations
  account       Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  @@map("statements")
}
```

#### GET /api/statements

**Query Params:**

```typescript
{
  accountId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    statements: [
      {
        id: string;
        accountId: string;
        statementType: string;
        periodStart: string;
        periodEnd: string;
        fileSize: number;
        generatedAt: string;
      }
    ];
    pagination: { ... };
  };
}
```

#### GET /api/statements/:id/download

**Response:** PDF file (binary)

**Headers:**

```typescript
{
  'Content-Type': 'application/pdf',
  'Content-Disposition': 'attachment; filename="statement-2024-01.pdf"'
}
```

---

## 🟢 LOW PRIORITY ENDPOINTS

### 11-13. Card Management Endpoints

**Endpoints:**

- `GET /api/cards` - List cards
- `POST /api/cards/:cardId/freeze` - Freeze card
- `POST /api/cards/:cardId/unfreeze` - Unfreeze card

**Priority:** 🟢 Low (Future Phase)  
**Required By:** E-Banking Portal

---

### 14-15. Bill Payment Endpoints

**Endpoints:**

- `GET /api/bills` - List bills
- `POST /api/bills/pay` - Pay bill

**Priority:** 🟢 Low (Future Phase)  
**Required By:** E-Banking Portal

---

## Implementation Priority Order

### Week 1 (Critical)

1. ✅ `/api/auth/refresh` - Token refresh
2. ✅ `/api/auth/me` - Route alias
3. ✅ `/api/transfers` - Route alias

### Week 2 (High Priority)

4. ✅ `/api/contact` - Contact form
2. ✅ `/api/account-applications` - Applications
3. ✅ `/api/beneficiaries` (GET/POST/DELETE) - Beneficiary management

### Week 3-4 (Medium Priority)

7. ✅ `/api/statements` (GET) - Statement listing
2. ✅ `/api/statements/:id/download` - PDF download

### Future Phases (Low Priority)

9. ⏳ Card management endpoints
2. ⏳ Bill payment endpoints

---

## Database Migration Script

```sql
-- Contact Submissions
CREATE TABLE contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'NEW',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  responded_by TEXT
);

-- Account Applications
CREATE TABLE account_applications (
  id TEXT PRIMARY KEY,
  application_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth TIMESTAMP NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  account_type TEXT NOT NULL,
  initial_deposit DECIMAL,
  employment_status TEXT,
  employer TEXT,
  occupation TEXT,
  annual_income DECIMAL,
  status TEXT DEFAULT 'PENDING',
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Beneficiaries
CREATE TABLE beneficiaries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  swift_code TEXT,
  routing_number TEXT,
  beneficiary_type TEXT DEFAULT 'DOMESTIC',
  nickname TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Statements
CREATE TABLE statements (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  statement_type TEXT NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-17  
**Next Task:** Task 2.2 - Mismatched Endpoints Documentation
