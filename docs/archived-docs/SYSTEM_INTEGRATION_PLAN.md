# AURUM VAULT System Integration Plan

## Overview

This document outlines the complete integration strategy for connecting all four components of the AURUM VAULT banking system.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AURUM VAULT ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │  Corporate Site  │    │  E-Banking Portal│                  │
│  │  Port: 3002      │    │  Port: 4000      │                  │
│  │  (Public)        │    │  (Authenticated) │                  │
│  └────────┬─────────┘    └────────┬─────────┘                  │
│           │                       │                             │
│           │                       │                             │
│           └───────────┬───────────┘                             │
│                       │                                         │
│                       ▼                                         │
│           ┌───────────────────────┐                             │
│           │   Core API Backend    │                             │
│           │   Port: 3001          │                             │
│           │   (REST API)          │                             │
│           └───────────┬───────────┘                             │
│                       │                                         │
│                       │                                         │
│           ┌───────────┴───────────┐                             │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌────────────────┐      ┌────────────────┐                    │
│  │ Admin Interface│      │   PostgreSQL   │                    │
│  │ Port: 3003     │      │   Database     │                    │
│  │ (Admin Only)   │      │   Port: 5432   │                    │
│  └────────────────┘      └────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Port Allocation

| Component           | Port | Protocol | Access Level |
|---------------------|------|----------|--------------|
| Core API Backend    | 3001 | HTTP     | Internal     |
| Corporate Website   | 3002 | HTTP     | Public       |
| Admin Interface     | 3003 | HTTP     | Admin Only   |
| E-Banking Portal    | 4000 | HTTP     | Authenticated|
| PostgreSQL Database | 5432 | TCP      | Internal     |
| Redis Cache         | 6379 | TCP      | Internal     |

## Integration Points

### 1. Corporate Website → Core API

**Purpose**: User registration, login, portal health checks

**Endpoints Used**:

- `POST /api/auth/register` - New customer registration
- `GET /api/portal/health` - Check e-banking portal status
- `POST /api/auth/login` - Initial authentication (redirects to portal)

**Environment Variables**:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PORTAL_URL=http://localhost:4000
NEXT_PUBLIC_PORTAL_HEALTH_URL=http://localhost:3001/api/portal/health
```

### 2. E-Banking Portal → Core API

**Purpose**: All banking operations, account management, transactions

**Endpoints Used**:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh
- `GET /api/accounts` - Fetch user accounts
- `POST /api/transactions` - Create transactions
- `GET /api/transactions` - Fetch transaction history
- `POST /api/transfers` - Internal transfers
- `GET /api/cards` - Card management
- `POST /api/bills` - Bill payments
- `GET /api/beneficiaries` - Manage beneficiaries
- `GET /api/statements` - Account statements

**Environment Variables**:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CORPORATE_URL=http://localhost:3002
```

### 3. Admin Interface → Core API

**Purpose**: Administrative operations, user management, portal control

**Endpoints Used**:

- `POST /api/admin/auth/login` - Admin authentication
- `GET /api/admin/users` - User management
- `POST /api/admin/users/:id/status` - Update user status
- `GET /api/admin/transactions` - Monitor all transactions
- `POST /api/portal/status` - Update portal status
- `GET /api/portal/status/history` - Portal status audit log
- `GET /api/admin/analytics` - System analytics

**Environment Variables**:

```env
API_URL=http://localhost:3001
CORPORATE_URL=http://localhost:3002
PORTAL_URL=http://localhost:4000
```

### 4. Core API → Database

**Purpose**: Data persistence, transaction management

**Connection**:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/aurumvault"
```

## Authentication Flow

### Customer Authentication (Corporate → Portal)

```
1. User visits Corporate Website (3002)
2. Clicks "Login to E-Banking"
3. Corporate site checks portal health via API
4. User enters credentials on Corporate login page
5. Corporate site validates via API (3001)
6. API returns JWT token
7. Corporate redirects to Portal (4000) with token
8. Portal validates token with API
9. Portal grants access to dashboard
```

### Admin Authentication (Admin Interface)

```
1. Admin visits Admin Interface (3003)
2. Enters admin credentials
3. Admin Interface validates via API (3001) /api/admin/auth/login
4. API returns admin JWT token
5. Admin Interface stores token
6. All subsequent requests include admin token
```

## Session Management

### JWT Token Strategy

- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- **Storage**:
  - Corporate: Session storage (temporary)
  - Portal: HTTP-only cookies + localStorage
  - Admin: HTTP-only cookies

### Token Refresh Flow

```
1. Access token expires
2. Frontend detects 401 response
3. Sends refresh token to /api/auth/refresh
4. API validates refresh token
5. Returns new access token
6. Frontend retries original request
```

## CORS Configuration

### Backend (Core API)

```typescript
// src/server.ts
fastify.register(cors, {
  origin: [
    'http://localhost:3002', // Corporate Website
    'http://localhost:4000', // E-Banking Portal
    'http://localhost:3003', // Admin Interface
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
```

## Environment Configuration

### Root `.env` (Development)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/aurumvault"
REDIS_URL="redis://localhost:6379"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
ADMIN_JWT_SECRET="your-super-secret-admin-jwt-key-change-in-production"

# Service URLs
CORPORATE_URL="http://localhost:3002"
PORTAL_URL="http://localhost:4000"
ADMIN_URL="http://localhost:3003"
API_URL="http://localhost:3001"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Node Environment
NODE_ENV="development"
```

### Corporate Website `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PORTAL_URL=http://localhost:4000
NEXT_PUBLIC_PORTAL_HEALTH_URL=http://localhost:3001/api/portal/health
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

### E-Banking Portal `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CORPORATE_URL=http://localhost:3002
NEXT_PUBLIC_SITE_URL=http://localhost:4000
```

### Admin Interface `.env`

```env
API_URL=http://localhost:3001
CORPORATE_URL=http://localhost:3002
PORTAL_URL=http://localhost:4000
PORT=3003
SESSION_SECRET="your-admin-session-secret"
```

### Backend `.env`

```env
# Server
PORT=3001
NODE_ENV=development
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/aurumvault"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Admin JWT
ADMIN_JWT_SECRET="your-super-secret-admin-jwt-key-change-in-production"
ADMIN_JWT_EXPIRES_IN="1h"

# CORS Origins
CORS_ORIGINS="http://localhost:3002,http://localhost:4000,http://localhost:3003"

# Frontend URLs
CORPORATE_URL="http://localhost:3002"
PORTAL_URL="http://localhost:4000"
ADMIN_URL="http://localhost:3003"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@aurumvault.com"
```

## Database Setup

### 1. Initialize Database

```bash
cd backend/core-api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 2. Shared Prisma Schema

The backend uses a centralized Prisma schema that all components reference.

## API Client Setup

### Corporate Website API Client

```typescript
// corporate-website/lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default apiClient;
```

### E-Banking Portal API Client

```typescript
// e-banking-portal/lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          { refreshToken }
        );
        
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = process.env.NEXT_PUBLIC_CORPORATE_URL + '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Admin Interface API Client

```typescript
// admin-interface/src/utils/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAdminToken(); // From session/cookie
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

## Development Workflow

### Starting All Services

Create a root-level script: `scripts/dev-all.sh`

```bash
#!/bin/bash

# Start all services in development mode

echo "🚀 Starting AURUM VAULT Development Environment..."

# Start PostgreSQL (if using Docker)
echo "📦 Starting PostgreSQL..."
docker-compose up -d postgres redis

# Wait for database
echo "⏳ Waiting for database..."
sleep 5

# Start Backend API
echo "🔧 Starting Core API (Port 3001)..."
cd backend/core-api
npm run dev &
BACKEND_PID=$!

# Start Corporate Website
echo "🌐 Starting Corporate Website (Port 3002)..."
cd ../../corporate-website
npm run dev &
CORPORATE_PID=$!

# Start E-Banking Portal
echo "💼 Starting E-Banking Portal (Port 4000)..."
cd ../e-banking-portal
npm run dev &
PORTAL_PID=$!

# Start Admin Interface
echo "👨‍💼 Starting Admin Interface (Port 3003)..."
cd ../admin-interface
npm run dev &
ADMIN_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Service URLs:"
echo "   - Core API:          http://localhost:3001"
echo "   - Corporate Website: http://localhost:3002"
echo "   - Admin Interface:   http://localhost:3003"
echo "   - E-Banking Portal:  http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $CORPORATE_PID $PORTAL_PID $ADMIN_PID; exit" INT
wait
```

### Docker Compose Setup

Create `docker-compose.yml` at root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: aurumvault-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: aurumvault
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - aurumvault-network

  redis:
    image: redis:7-alpine
    container_name: aurumvault-redis
    ports:
      - "6379:6379"
    networks:
      - aurumvault-network

  backend:
    build: ./backend/core-api
    container_name: aurumvault-api
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/aurumvault
      - REDIS_URL=redis://redis:6379
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    networks:
      - aurumvault-network
    volumes:
      - ./backend/core-api:/app
      - /app/node_modules

  corporate:
    build: ./corporate-website
    container_name: aurumvault-corporate
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
      - NEXT_PUBLIC_PORTAL_URL=http://localhost:4000
    ports:
      - "3002:3002"
    networks:
      - aurumvault-network
    volumes:
      - ./corporate-website:/app
      - /app/node_modules

  portal:
    build: ./e-banking-portal
    container_name: aurumvault-portal
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
      - NEXT_PUBLIC_CORPORATE_URL=http://localhost:3002
    ports:
      - "4000:4000"
    networks:
      - aurumvault-network
    volumes:
      - ./e-banking-portal:/app
      - /app/node_modules

  admin:
    build: ./admin-interface
    container_name: aurumvault-admin
    environment:
      - API_URL=http://backend:3001
      - PORT=3003
    ports:
      - "3003:3003"
    depends_on:
      - backend
    networks:
      - aurumvault-network
    volumes:
      - ./admin-interface:/app
      - /app/node_modules

volumes:
  postgres_data:

networks:
  aurumvault-network:
    driver: bridge
```

## Security Considerations

### 1. HTTPS in Production

- Use SSL/TLS certificates for all services
- Redirect HTTP to HTTPS
- Use secure cookies

### 2. API Rate Limiting

```typescript
// Backend rate limiting
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes'
});
```

### 3. Input Validation

- Use Zod schemas for all API inputs
- Sanitize user inputs
- Validate file uploads

### 4. CSRF Protection

- Implement CSRF tokens for state-changing operations
- Use SameSite cookies

### 5. SQL Injection Prevention

- Use Prisma ORM (parameterized queries)
- Never concatenate SQL strings

## Testing Integration

### End-to-End Test Flow

```typescript
// tests/e2e/user-journey.test.ts
describe('Complete User Journey', () => {
  it('should register, login, and perform transaction', async () => {
    // 1. Register on Corporate Website
    // 2. Login and redirect to Portal
    // 3. View accounts
    // 4. Make a transfer
    // 5. Check transaction history
  });
});
```

## Monitoring & Logging

### Centralized Logging

- Use Winston for backend logging
- Log all API requests/responses
- Track authentication attempts
- Monitor portal status changes

### Health Checks

```typescript
// Backend health endpoint
GET /health
Response: {
  status: 'healthy',
  database: 'connected',
  redis: 'connected',
  uptime: 12345
}
```

## Deployment Strategy

### Production Deployment

1. Build all services
2. Run database migrations
3. Deploy backend first
4. Deploy frontends
5. Update DNS/Load balancers
6. Monitor logs

### Environment-Specific Configs

- Development: Local services
- Staging: Cloud services with test data
- Production: Cloud services with encryption

## Next Steps

1. ✅ Fix all TypeScript errors
2. 🔄 Create environment files
3. 🔄 Set up API clients
4. 🔄 Implement authentication flow
5. 🔄 Test integration points
6. 🔄 Add error handling
7. 🔄 Set up monitoring
8. 🔄 Write integration tests
9. 🔄 Document API endpoints
10. 🔄 Deploy to staging

---

**Last Updated**: 2026-01-17
**Version**: 1.0.0
