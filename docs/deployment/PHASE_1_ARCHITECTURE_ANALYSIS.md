# Phase 1: Deployment Architecture Analysis

**Date**: January 17, 2026  
**Project**: AURUM VAULT Banking Platform  
**Deployment Strategy**: Hybrid (Cloud + Local with ngrok)

---

## Executive Summary

This document provides a comprehensive analysis of the AURUM VAULT codebase architecture to support the hybrid deployment strategy:

- **Corporate Website** → Netlify (Cloud)
- **Backend, Admin UI, E-Banking Portal** → Docker (Local) + ngrok tunnels

---

## 1. Corporate Website Analysis

### 1.1 Technology Stack

- **Framework**: Next.js 14.2.35 (React 18)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **Build Tool**: Next.js built-in (Webpack/Turbopack)
- **UI Libraries**:
  - Radix UI components (Accordion, Dialog, Dropdown, etc.)
  - Framer Motion for animations
  - Lucide React for icons
  - Recharts for data visualization

### 1.2 Runtime Requirements

- **Node Version**: ≥18.0.0 (confirmed by `.nvmrc`: 18.19.0)
- **NPM Version**: ≥9.0.0
- **Build Command**: `npm run build`
- **Start Command**: `npm start -p 3002`
- **Dev Command**: `npm dev -p 3002`

### 1.3 Port Configuration

- **Development**: 3002
- **Production**: 3002 (configurable)

### 1.4 Environment Variables Required

Based on `.env.example` and docker-compose configuration:

```bash
NEXT_PUBLIC_API_URL=<ngrok_backend_url>
NEXT_PUBLIC_PORTAL_URL=<ngrok_portal_url>
NEXT_PUBLIC_PORTAL_HEALTH_URL=<ngrok_backend_url>/api/portal/health
```

### 1.5 Build Process

- **Type**: Static Site Generation (SSG) + Server-Side Rendering (SSR)
- **Output**: Optimized production build in `.next` directory
- **Build Time Dependencies**: None on backend services
- **Deployment Compatibility**: ✅ **Netlify Compatible**
  - Next.js is fully supported on Netlify
  - Automatic detection of Next.js framework
  - Supports both static and server-rendered pages

### 1.6 Current State

- **Dockerfile**: ❌ Not present (not needed for Netlify)
- **Next.js Config**: ✅ Present (`next.config.mjs`) - minimal configuration
- **Dependencies**: ✅ All installed via npm
- **Build Status**: Ready for Netlify deployment

### 1.7 Backend Dependencies

- Calls Backend API via `NEXT_PUBLIC_API_URL`
- Checks Portal health via `NEXT_PUBLIC_PORTAL_HEALTH_URL`
- Links to E-Banking Portal via `NEXT_PUBLIC_PORTAL_URL`

---

## 2. Backend Core API Analysis

### 2.1 Technology Stack

- **Framework**: Fastify 4.24.3
- **Language**: TypeScript 5.3.3
- **Runtime**: Node.js 18+
- **Database ORM**: Prisma 5.7.1
- **Database**: PostgreSQL 15
- **Cache**: Redis 4.6.11
- **Authentication**: JWT (@fastify/jwt 7.2.4)
- **Password Hashing**: bcrypt, argon2
- **API Documentation**: Swagger/OpenAPI

### 2.2 Runtime Requirements

- **Node Version**: ≥18.0.0
- **NPM Version**: ≥8.0.0
- **Build Command**: `npm run build` (TypeScript compilation)
- **Start Command**: `node dist/server.js`
- **Dev Command**: `tsx watch src/server.ts`

### 2.3 Port Configuration

- **Application Port**: 3001
- **Exposed via Docker**: 3101 → 3001 (dev), 3001 → 3001 (prod)
- **Health Endpoint**: `/health`
- **API Prefix**: `/api`

### 2.4 Database Requirements

**PostgreSQL Database**:

```
Host: postgres (Docker service name)
Port: 5432
Database: aurumvault
User: postgres
Password: password (dev) / ${DB_PASSWORD} (prod)
```

**Redis Cache**:

```
Host: redis (Docker service name)
Port: 6379
Password: none (dev) / ${REDIS_PASSWORD} (prod)
```

### 2.5 Environment Variables Required

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:password@postgres:5432/aurumvault
REDIS_URL=redis://redis:6379
JWT_SECRET=<min-32-chars>
JWT_REFRESH_SECRET=<min-32-chars>
ADMIN_JWT_SECRET=<min-32-chars>
CORS_ORIGINS=<netlify_url>,<ngrok_urls>
```

### 2.6 Containerization Status

- **Dockerfile**: ✅ Present (`Dockerfile.prod`)
- **Type**: Multi-stage build (builder + production)
- **Base Image**: node:18-alpine
- **Optimizations**:
  - Production-only dependencies
  - Non-root user (nodejs:1001)
  - dumb-init for signal handling
  - Health check built-in
- **Volumes Required**:
  - `/app/uploads` - File uploads
  - `/app/logs` - Application logs
  - Prisma client generation included

### 2.7 Dependencies

- **Database**: PostgreSQL (required)
- **Cache**: Redis (required)
- **External Services**: None critical
- **Startup Order**: Database → Redis → Backend

### 2.8 API Endpoints

```
/ - Root info
/health - Health check
/docs - Swagger documentation
/api/auth - Authentication
/api/users - User management
/api/accounts - Account operations
/api/transactions - Transaction processing
/api/kyc - KYC document management
/api/wire-transfers - Wire transfer operations
/api/system - System operations
/api/portal - Portal status management
```

### 2.9 CORS Configuration

Located in `src/middleware/security.ts`:

- Currently configured for localhost origins
- **Needs Update**: Must include Netlify domain and ngrok URLs

---

## 3. Admin Interface Analysis

### 3.1 Technology Stack

- **Framework**: Fastify 4.24.3
- **Language**: TypeScript 5.3.3
- **Template Engine**: EJS 3.1.10
- **Database ORM**: Prisma 5.7.1 (shared schema with Backend)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Styling**: Server-rendered HTML/CSS

### 3.2 Runtime Requirements

- **Node Version**: ≥18.0.0
- **NPM Version**: ≥8.0.0
- **Build Command**: `npm run build`
- **Start Command**: `node dist/server.js`
- **Dev Command**: `tsx watch src/server.ts`

### 3.3 Port Configuration

- **Application Port**: 3003
- **Exposed via Docker**: 3103 → 3003 (dev), 3003 → 3003 (prod)
- **Health Endpoint**: `/api/health`

### 3.4 Database Requirements

**Shares Prisma schema with Backend**:

- Same PostgreSQL database
- Separate Prisma client instance
- Tables: `admin_users`, `admin_sessions`, `audit_logs`, `portal_status`, etc.

### 3.5 Environment Variables Required

```bash
NODE_ENV=production
API_URL=http://backend:3001
PORT=3003
SESSION_SECRET=<min-32-chars>
CORPORATE_URL=<netlify_url>
PORTAL_URL=<ngrok_portal_url>
```

### 3.6 Containerization Status

- **Dockerfile**: ✅ Present (`Dockerfile.prod`)
- **Type**: Multi-stage build
- **Base Image**: node:18-alpine
- **Special Requirements**:
  - Copies `views` directory (EJS templates)
  - Copies `public` directory (static assets)
  - Non-root user (nodejs:1001)
- **Dependencies**: Backend API (for some operations)

### 3.7 Architecture Type

- **Server-Rendered Application**: Not a SPA
- **View Engine**: EJS templates
- **Static Assets**: Served from `/public`
- **API Communication**: Calls Backend API via `API_URL`

### 3.8 Key Features

- Admin user authentication
- User management (view, suspend, activate)
- Account management
- KYC document verification
- Transaction monitoring
- Portal status control
- Audit log viewing
- Card management
- Bill payee management

---

## 4. E-Banking Portal Analysis

### 4.1 Technology Stack

- **Framework**: Next.js 15.1.6 (Latest)
- **Language**: TypeScript 5
- **React Version**: 19.0.0
- **Styling**: Tailwind CSS 4.0.0
- **UI Libraries**: Same as Corporate Website (Radix UI, Framer Motion, etc.)

### 4.2 Runtime Requirements

- **Node Version**: ≥18.0.0
- **NPM Version**: ≥9.0.0
- **Build Command**: `npm run build`
- **Start Command**: `npm start -p 4000`
- **Dev Command**: `npm dev -p 4000`

### 4.3 Port Configuration

- **Development**: 4000
- **Production**: 4000
- **Exposed via Docker**: 4100 → 4000 (dev), 4000 → 4000 (prod)

### 4.4 Environment Variables Required

```bash
NEXT_PUBLIC_API_URL=<ngrok_backend_url>
NEXT_PUBLIC_CORPORATE_URL=<netlify_corporate_url>
PORT=4000
```

### 4.5 Containerization Status

- **Dockerfile**: ✅ Present (`Dockerfile.prod`)
- **Type**: Multi-stage build (deps → builder → runner)
- **Base Image**: node:18-alpine
- **Next.js Output**: Standalone mode
- **Special Configuration**:
  - Requires `output: 'standalone'` in `next.config.ts`
  - Copies `.next/standalone` and `.next/static`
  - Non-root user (nextjs:1001)

### 4.6 Backend Dependencies

- Calls Backend API for all data operations
- Receives authentication tokens from Corporate Website
- Displays user dashboard, accounts, transactions, etc.

### 4.7 Build Process

- **Type**: Hybrid SSR/SSG
- **Build Time**: Requires `NEXT_PUBLIC_*` env vars at build time
- **Runtime**: Requires same env vars at runtime

---

## 5. Database Schema Analysis

### 5.1 Database Provider

- **Current**: PostgreSQL
- **Prisma Schema**: `/backend/core-api/prisma/schema.prisma`

### 5.2 Key Models

```
AdminUser (admin authentication)
AdminSession (admin sessions)
User (customer accounts)
UserSession (customer sessions)
Account (bank accounts)
Transaction (all transactions)
WireTransfer (international transfers)
KycDocument (identity verification)
Card (debit/credit cards)
BillPayee (bill payment recipients)
Beneficiary (transfer recipients)
PortalStatus (system status)
AuditLog (audit trail)
ContactSubmission (contact form)
AccountApplication (new account requests)
```

### 5.3 Shared vs Separate

- **Backend Core API**: Full access to all tables
- **Admin Interface**: Shares same database, has own Prisma client
- **E-Banking Portal**: No direct database access (API only)
- **Corporate Website**: No direct database access (API only)

---

## 6. Service Dependency Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│   Corporate   │     │   ngrok      │     │   ngrok      │
│   Website     │     │   Tunnel     │     │   Tunnel     │
│   (Netlify)   │     │   (Backend)  │     │   (Portal)   │
└───────────────┘     └──────────────┘     └──────────────┘
        │                     │                     │
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   ngrok Tunnel   │
                    │   (Admin UI)     │
                    └──────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│   Backend     │     │   Admin UI   │     │  E-Banking   │
│   Core API    │     │  Interface   │     │   Portal     │
│   (Docker)    │     │   (Docker)   │     │   (Docker)   │
│   Port: 3001  │     │  Port: 3003  │     │  Port: 4000  │
└───────────────┘     └──────────────┘     └──────────────┘
        │                     │                     
        │                     │                     
        └─────────────────────┘                     
                    │                               
        ┌───────────┴───────────┐                  
        │                       │                  
        ▼                       ▼                  
┌───────────────┐       ┌──────────────┐          
│  PostgreSQL   │       │    Redis     │          
│   Database    │       │    Cache     │          
│   (Docker)    │       │   (Docker)   │          
│   Port: 5432  │       │  Port: 6379  │          
└───────────────┘       └──────────────┘          
```

### 6.1 Communication Flow

**Corporate Website (Netlify)**:

- → Backend API (via ngrok) for authentication, portal status
- → E-Banking Portal (via ngrok) for redirects after login

**E-Banking Portal (Docker + ngrok)**:

- → Backend API (via Docker network internally, or ngrok externally)
- ← Corporate Website (receives auth tokens)

**Admin Interface (Docker + ngrok)**:

- → Backend API (via Docker network) for data operations
- → Corporate Website (for links/redirects)
- → E-Banking Portal (for links/redirects)

**Backend Core API (Docker + ngrok)**:

- → PostgreSQL (via Docker network)
- → Redis (via Docker network)
- ← All services (receives API requests)

---

## 7. Network Architecture Planning

### 7.1 ngrok Tunnel Strategy

**Recommended Approach: Option B - Multiple Tunnels**

**Rationale**:

1. Each service needs independent public access
2. Simplifies CORS configuration (specific origins)
3. Better security (granular access control)
4. Easier debugging (isolated tunnel logs)
5. Allows independent service restarts

**Required Tunnels**:

```
1. backend-tunnel  → localhost:3001 (Backend Core API)
2. admin-tunnel    → localhost:3003 (Admin Interface)
3. portal-tunnel   → localhost:4000 (E-Banking Portal)
```

### 7.2 Port Allocation

**Local Development Ports**:

```
3001 - Backend Core API
3002 - Corporate Website (local dev only)
3003 - Admin Interface
4000 - E-Banking Portal
5432 - PostgreSQL
6379 - Redis
```

**Docker Exposed Ports** (for ngrok access):

```
3001 - Backend (mapped to container port 3001)
3003 - Admin UI (mapped to container port 3003)
4000 - E-Banking Portal (mapped to container port 4000)
5432 - PostgreSQL (for external tools, optional)
6379 - Redis (for external tools, optional)
```

**ngrok Tunnel Mappings**:

```
https://<random>.ngrok.io → localhost:3001 (Backend)
https://<random>.ngrok.io → localhost:3003 (Admin)
https://<random>.ngrok.io → localhost:4000 (Portal)
```

### 7.3 CORS Configuration

**Backend Core API** must allow:

```javascript
const allowedOrigins = [
  process.env.CORPORATE_URL,           // https://aurumvault.netlify.app
  process.env.NGROK_BACKEND_URL,       // https://xyz.ngrok.io
  process.env.NGROK_ADMIN_URL,         // https://abc.ngrok.io
  process.env.NGROK_PORTAL_URL,        // https://def.ngrok.io
  'http://localhost:3002',             // Local dev
  'http://localhost:4000',             // Local dev
  'http://localhost:3003',             // Local dev
];
```

**Admin Interface** must allow:

```javascript
const allowedOrigins = [
  process.env.CORPORATE_URL,           // Netlify
  process.env.NGROK_PORTAL_URL,        // Portal tunnel
  'http://localhost:3002',             // Local dev
];
```

**E-Banking Portal** (Next.js handles CORS differently):

- API calls to Backend via `NEXT_PUBLIC_API_URL`
- No CORS issues (server-side rendering)

---

## 8. Docker Compose Analysis

### 8.1 Current Configuration

**Services Defined**:

1. ✅ PostgreSQL (postgres:15-alpine)
2. ✅ Redis (redis:7-alpine)
3. ✅ Backend Core API
4. ✅ Corporate Website (optional, commented for Netlify)
5. ✅ E-Banking Portal
6. ✅ Admin Interface

**Network**:

- Name: `aurumvault-network`
- Driver: bridge
- All services connected

**Volumes**:

- `postgres_data` - Database persistence
- `redis_data` - Cache persistence
- `./backend/core-api/uploads` - File uploads
- `./backend/core-api/logs` - Application logs

### 8.2 Modifications Needed

**For Hybrid Deployment**:

1. **Remove Corporate Website service** (deploying to Netlify)
2. **Update Backend CORS** to include Netlify URL
3. **Update environment variables** for ngrok URLs
4. **Add health checks** for all services
5. **Configure host binding** for ngrok access:

   ```yaml
   backend:
     ports:
       - "3001:3001"  # Bind to all interfaces for ngrok
   ```

---

## 9. Build Process Summary

### 9.1 Backend Core API

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build TypeScript
npm run build

# Start
npm start
```

### 9.2 Admin Interface

```bash
# Install dependencies
npm install

# Generate Prisma client (uses Backend schema)
npx prisma generate

# Build TypeScript
npm run build

# Start
npm start
```

### 9.3 E-Banking Portal

```bash
# Install dependencies
npm install

# Build Next.js (requires env vars)
npm run build

# Start
npm start
```

### 9.4 Corporate Website

```bash
# Install dependencies
npm install

# Build Next.js (requires env vars)
npm run build

# Deploy to Netlify (handled by Netlify)
```

---

## 10. Critical Findings & Recommendations

### 10.1 Immediate Actions Required

1. **Corporate Website**:
   - ✅ Ready for Netlify deployment
   - ⚠️ Needs `netlify.toml` configuration
   - ⚠️ Needs environment variable setup in Netlify

2. **Backend Core API**:
   - ✅ Dockerfile ready
   - ⚠️ CORS configuration needs update
   - ⚠️ Server binding needs change from `localhost` to `0.0.0.0` for ngrok

3. **Admin Interface**:
   - ✅ Dockerfile ready
   - ⚠️ Server binding needs change to `0.0.0.0` for ngrok
   - ✅ Already configured in code (line 191 of server.ts)

4. **E-Banking Portal**:
   - ✅ Dockerfile ready
   - ⚠️ Needs `output: 'standalone'` in `next.config.ts`
   - ⚠️ Dockerfile references `.next/standalone` which requires config

### 10.2 Security Considerations

1. **ngrok Authentication**: Consider using ngrok basic auth or IP whitelisting
2. **JWT Secrets**: Generate strong secrets for production
3. **Database Credentials**: Use strong passwords in production
4. **Rate Limiting**: Already configured in Backend and Admin
5. **HTTPS**: ngrok provides HTTPS by default ✅

### 10.3 Performance Considerations

1. **ngrok Latency**: Expect 50-200ms additional latency
2. **Docker Resource Limits**: Set appropriate memory/CPU limits
3. **Database Connection Pooling**: Prisma handles this ✅
4. **Redis Caching**: Already implemented ✅

### 10.4 Cost Implications

**ngrok Free Tier**:

- ✅ 1 online ngrok process
- ❌ Need 3 tunnels simultaneously
- **Recommendation**: Upgrade to ngrok paid plan ($8/month) for:
  - Multiple tunnels
  - Custom subdomains
  - Reserved domains
  - Higher connection limits

**Netlify Free Tier**:

- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Suitable for testing/demo

---

## 11. Next Steps (Phase 2)

1. **Create/Update Dockerfiles** for all services
2. **Update docker-compose.yml** for hybrid deployment
3. **Configure ngrok** with multiple tunnels
4. **Update CORS settings** in Backend
5. **Create netlify.toml** for Corporate Website
6. **Set up environment variable management**

---

## Appendix A: File Paths Reference

```
/Volumes/Project Disk/PROJECTS/CODING/AURUMVAULT/
├── backend/
│   ├── core-api/
│   │   ├── Dockerfile.prod ✅
│   │   ├── package.json ✅
│   │   ├── prisma/schema.prisma ✅
│   │   └── src/server.ts ⚠️ (needs host update)
│   └── package.json ✅
├── admin-interface/
│   ├── Dockerfile.prod ✅
│   ├── package.json ✅
│   └── src/server.ts ✅
├── e-banking-portal/
│   ├── Dockerfile.prod ✅
│   ├── package.json ✅
│   └── next.config.ts ⚠️ (needs standalone output)
├── corporate-website/
│   ├── package.json ✅
│   ├── next.config.mjs ✅
│   └── netlify.toml ❌ (to be created)
├── docker-compose.yml ⚠️ (needs updates)
├── docker-compose.prod.yml ⚠️ (needs updates)
└── .env.example ✅
```

---

**Document Status**: ✅ Complete  
**Ready for Phase 2**: Docker Configuration
