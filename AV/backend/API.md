# NovaBank Backend - API Reference

Complete API documentation for NovaBank backend services.

## 🌐 Base URLs

- **Core API**: `http://localhost:3000/api`
- **Admin API**: `http://localhost:3001/api`

## 🔐 Authentication

### JWT Token Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Admin Authentication

Admin endpoints require admin role and valid JWT token.

## 📋 Core API Endpoints

### Health Check

#### GET /health

Check service health status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "NovaBank Core API",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected"
}
```

### Authentication

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "kycStatus": "PENDING"
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here",
      "expiresIn": 86400
    }
  }
}
```

#### POST /auth/login

Authenticate user and get tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here",
      "expiresIn": 86400
    }
  }
}
```

#### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token_here",
    "expiresIn": 86400
  }
}
```

#### POST /auth/logout

Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Profile

#### GET /users/profile

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "kycStatus": "APPROVED",
    "tier": "STANDARD",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /users/profile

Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

### Accounts

#### GET /accounts

Get user accounts.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Account status filter

**Response:**

```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "acc_123",
        "accountNumber": "NB12345678901234",
        "accountType": "CHECKING",
        "currency": "USD",
        "balance": "1500.00",
        "availableBalance": "1450.00",
        "status": "ACTIVE",
        "nickname": "Main Checking"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### POST /accounts

Create new account.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "accountType": "SAVINGS",
  "currency": "USD",
  "nickname": "Emergency Fund"
}
```

#### GET /accounts/:id

Get specific account details.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "acc_123",
    "accountNumber": "NB12345678901234",
    "accountType": "CHECKING",
    "currency": "USD",
    "balance": "1500.00",
    "availableBalance": "1450.00",
    "status": "ACTIVE",
    "interestRate": "0.0150",
    "openedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Transactions

#### GET /transactions

Get user transactions.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `accountId` (optional): Filter by account
- `type` (optional): Transaction type
- `status` (optional): Transaction status
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_123",
        "transactionType": "TRANSFER",
        "amount": "100.00",
        "currency": "USD",
        "status": "COMPLETED",
        "referenceNumber": "REF123456",
        "description": "Transfer to savings",
        "fromAccount": {
          "id": "acc_123",
          "accountNumber": "NB12345678901234"
        },
        "toAccount": {
          "id": "acc_456",
          "accountNumber": "NB56789012345678"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### POST /transactions

Create new transaction.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "fromAccountId": "acc_123",
  "toAccountId": "acc_456",
  "amount": "100.00",
  "currency": "USD",
  "description": "Transfer to savings"
}
```

#### GET /transactions/:id

Get specific transaction details.

**Headers:** `Authorization: Bearer <token>`

### Wire Transfers

#### GET /wire-transfers

Get user wire transfers.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "wireTransfers": [
      {
        "id": "wire_123",
        "transaction": {
          "amount": "5000.00",
          "currency": "USD",
          "status": "PENDING"
        },
        "recipientName": "Jane Smith",
        "recipientBankName": "International Bank",
        "recipientAccountNumber": "1234567890",
        "complianceStatus": "APPROVED",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

#### POST /wire-transfers

Create wire transfer.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "senderAccountId": "acc_123",
  "amount": "5000.00",
  "currency": "USD",
  "recipientName": "Jane Smith",
  "recipientBankName": "International Bank",
  "recipientBankSwift": "INTLUS33",
  "recipientAccountNumber": "1234567890",
  "recipientAddress": "123 Main St, City, Country",
  "purposeCode": "PERSONAL",
  "description": "Personal transfer"
}
```

### Foreign Exchange

#### GET /fx-rates

Get current exchange rates.

**Query Parameters:**

- `base` (optional): Base currency (default: USD)
- `target` (optional): Target currency

**Response:**

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "baseCurrency": "USD",
        "targetCurrency": "EUR",
        "rate": "0.850000",
        "spread": "0.0025",
        "effectiveFrom": "2024-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

### KYC Documents

#### GET /kyc/documents

Get user KYC documents.

**Headers:** `Authorization: Bearer <token>`

#### POST /kyc/documents

Upload KYC document.

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Form Data:**

- `documentType`: Document type (ID, PASSPORT, etc.)
- `file`: Document file

## 🔧 Admin API Endpoints

### Admin Authentication

#### POST /admin/login

Admin login.

**Request Body:**

```json
{
  "email": "admin@novabank.com",
  "password": "adminPassword123"
}
```

### User Management

#### GET /admin/users

Get all users (admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**

- `page`, `limit`: Pagination
- `search`: Search by name or email
- `kycStatus`: Filter by KYC status
- `tier`: Filter by user tier

#### GET /admin/users/:id

Get specific user details.

#### PUT /admin/users/:id

Update user information.

#### PUT /admin/users/:id/kyc-status

Update user KYC status.

**Request Body:**

```json
{
  "kycStatus": "APPROVED",
  "notes": "All documents verified"
}
```

### Account Management

#### GET /admin/accounts

Get all accounts.

#### PUT /admin/accounts/:id/status

Update account status.

### Transaction Management

#### GET /admin/transactions

Get all transactions.

#### GET /admin/wire-transfers

Get all wire transfers.

#### PUT /admin/wire-transfers/:id/approve

Approve wire transfer.

### Statistics

#### GET /admin/statistics

Get platform statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active": 1100,
      "kycPending": 45
    },
    "accounts": {
      "total": 2100,
      "active": 2050
    },
    "transactions": {
      "today": 156,
      "thisMonth": 4500,
      "totalVolume": "12500000.00"
    },
    "wireTransfers": {
      "pending": 12,
      "approved": 145,
      "rejected": 3
    }
  }
}
```

### Audit Logs

#### GET /admin/audit-logs

Get audit trail.

**Query Parameters:**

- `userId`: Filter by user
- `action`: Filter by action
- `resourceType`: Filter by resource type
- `startDate`, `endDate`: Date range

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Pagination

```json
{
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

## 🚫 Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Authentication required |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

## 🔒 Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP
- **Admin**: 200 requests per 15 minutes per IP

## 📝 Request/Response Examples

### cURL Examples

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Get accounts
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create transaction
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "acc_123",
    "toAccountId": "acc_456",
    "amount": "100.00",
    "description": "Transfer"
  }'
```

### JavaScript Examples

```javascript
// Using fetch API
const response = await fetch('http://localhost:3000/api/accounts', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

## 🧪 Testing

### Postman Collection

Import the Postman collection for easy API testing:

- Collection includes all endpoints
- Environment variables for tokens
- Pre-request scripts for authentication

### Test Data

Use the following test accounts:

- **User**: <test@novabank.com> / password123
- **Admin**: <admin@novabank.com> / admin123

---

**NovaBank API** - Comprehensive banking platform API built with Fastify and TypeScript.
