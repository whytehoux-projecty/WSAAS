# AURUM VAULT - Service Dependency Map

## Visual Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                           INTERNET / PUBLIC                            │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌──────────────────┐  ┌─────────┐  ┌─────────┐
        │  Corporate Site  │  │  ngrok  │  │  ngrok  │
        │    (Netlify)     │  │ Backend │  │ Portal  │
        │  Port: 443/80    │  │  Tunnel │  │ Tunnel  │
        └──────────────────┘  └─────────┘  └─────────┘
                    │               │               │
                    │               │               │
                    └───────────────┼───────────────┘
                                    │
                                    ▼
                            ┌─────────────┐
                            │   ngrok     │
                            │   Admin     │
                            │   Tunnel    │
                            └─────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌──────────────┐            ┌──────────────┐          ┌──────────────┐
│   Backend    │◄───────────│  Admin UI    │          │  E-Banking   │
│   Core API   │            │  Interface   │          │   Portal     │
│              │            │              │          │              │
│ Fastify+TS   │            │ Fastify+EJS  │          │  Next.js 15  │
│ Port: 3001   │            │ Port: 3003   │          │ Port: 4000   │
│              │            │              │          │              │
│ [Docker]     │            │  [Docker]    │          │  [Docker]    │
└──────────────┘            └──────────────┘          └──────────────┘
        │                           │                           │
        │                           │                           │
        └───────────────────────────┴───────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
            ┌──────────────┐                ┌──────────────┐
            │  PostgreSQL  │                │    Redis     │
            │   Database   │                │    Cache     │
            │              │                │              │
            │ Port: 5432   │                │ Port: 6379   │
            │              │                │              │
            │  [Docker]    │                │  [Docker]    │
            └──────────────┘                └──────────────┘
```

---

## Service Communication Matrix

| From Service | To Service | Protocol | Purpose | Network |
|--------------|------------|----------|---------|---------|
| Corporate Website | Backend API | HTTPS | Auth, Portal Status | ngrok tunnel |
| Corporate Website | E-Banking Portal | HTTPS | Redirect after login | ngrok tunnel |
| E-Banking Portal | Backend API | HTTP/HTTPS | All data operations | Docker network / ngrok |
| Admin UI | Backend API | HTTP | Data operations | Docker network |
| Admin UI | Corporate Website | HTTPS | Links/redirects | ngrok / Netlify |
| Backend API | PostgreSQL | TCP | Database queries | Docker network |
| Backend API | Redis | TCP | Caching | Docker network |
| Admin UI | PostgreSQL | TCP | Direct DB access (Prisma) | Docker network |

---

## Data Flow Diagrams

### 1. User Login Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Visit website
     ▼
┌──────────────────┐
│ Corporate Site   │
│   (Netlify)      │
└────┬─────────────┘
     │
     │ 2. Submit login form
     ▼
┌──────────────────┐
│   ngrok Tunnel   │
│   (Backend)      │
└────┬─────────────┘
     │
     │ 3. POST /api/auth/login
     ▼
┌──────────────────┐
│  Backend API     │
│  (Docker)        │
└────┬─────────────┘
     │
     │ 4. Verify credentials
     ▼
┌──────────────────┐
│  PostgreSQL      │
│  (Docker)        │
└────┬─────────────┘
     │
     │ 5. Return JWT token
     ▼
┌──────────────────┐
│ Corporate Site   │
│   (Netlify)      │
└────┬─────────────┘
     │
     │ 6. Redirect with token
     ▼
┌──────────────────┐
│   ngrok Tunnel   │
│   (Portal)       │
└────┬─────────────┘
     │
     │ 7. Access dashboard
     ▼
┌──────────────────┐
│ E-Banking Portal │
│   (Docker)       │
└──────────────────┘
```

### 2. Admin Management Flow

```
┌──────────┐
│  Admin   │
└────┬─────┘
     │
     │ 1. Visit admin URL
     ▼
┌──────────────────┐
│   ngrok Tunnel   │
│   (Admin)        │
└────┬─────────────┘
     │
     │ 2. Login
     ▼
┌──────────────────┐
│  Admin UI        │
│  (Docker)        │
└────┬─────────────┘
     │
     │ 3. Request user list
     ▼
┌──────────────────┐
│  Backend API     │
│  (Docker)        │
└────┬─────────────┘
     │
     │ 4. Query database
     ▼
┌──────────────────┐
│  PostgreSQL      │
│  (Docker)        │
└────┬─────────────┘
     │
     │ 5. Return data
     ▼
┌──────────────────┐
│  Admin UI        │
│  (EJS Render)    │
└──────────────────┘
```

### 3. Transaction Processing Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Initiate transfer
     ▼
┌──────────────────┐
│ E-Banking Portal │
│   (Docker)       │
└────┬─────────────┘
     │
     │ 2. POST /api/transactions
     ▼
┌──────────────────┐
│  Backend API     │
│  (Docker)        │
└────┬─────────────┘
     │
     ├─ 3a. Check balance
     │  ▼
     │  ┌──────────────────┐
     │  │  PostgreSQL      │
     │  └──────────────────┘
     │
     ├─ 3b. Check rate limit
     │  ▼
     │  ┌──────────────────┐
     │  │  Redis Cache     │
     │  └──────────────────┘
     │
     ├─ 4. Create transaction
     │  ▼
     │  ┌──────────────────┐
     │  │  PostgreSQL      │
     │  └──────────────────┘
     │
     └─ 5. Log audit trail
        ▼
        ┌──────────────────┐
        │  PostgreSQL      │
        │  (audit_logs)    │
        └──────────────────┘
```

---

## Service Dependencies

### Backend Core API

**Depends On**:

- PostgreSQL (critical)
- Redis (critical)

**Depended By**:

- Corporate Website
- E-Banking Portal
- Admin UI

**Can Start Without**: None (requires DB and Redis)

---

### Admin Interface

**Depends On**:

- Backend API (for some operations)
- PostgreSQL (direct access via Prisma)

**Depended By**:

- None (standalone admin tool)

**Can Start Without**: Backend API (has direct DB access)

---

### E-Banking Portal

**Depends On**:

- Backend API (critical - all data operations)

**Depended By**:

- Corporate Website (receives redirects)

**Can Start Without**: None (requires Backend API)

---

### Corporate Website

**Depends On**:

- Backend API (for auth and portal status)
- E-Banking Portal (for redirects)

**Depended By**:

- None (entry point)

**Can Start Without**: None (requires Backend API for functionality)

---

## Startup Order

### Recommended Sequence

```
1. PostgreSQL     (0s)
   └─ Wait for health check (10s)

2. Redis          (0s)
   └─ Wait for health check (10s)

3. Backend API    (after DB + Redis healthy)
   └─ Run Prisma migrations
   └─ Generate Prisma client
   └─ Start server
   └─ Wait for health check (40s)

4. Admin UI       (after Backend healthy)
   └─ Generate Prisma client
   └─ Start server
   └─ Wait for health check (30s)

5. E-Banking Portal (after Backend healthy)
   └─ Start server
   └─ Wait for health check (30s)

6. ngrok Tunnels  (after all services healthy)
   └─ Start backend tunnel
   └─ Start admin tunnel
   └─ Start portal tunnel
   └─ Capture URLs

7. Corporate Website (Netlify)
   └─ Update environment variables with ngrok URLs
   └─ Deploy/redeploy
```

**Total Startup Time**: ~90-120 seconds

---

## Network Ports Summary

### External Access (via ngrok)

```
https://<random>.ngrok.io → Backend API (3001)
https://<random>.ngrok.io → Admin UI (3003)
https://<random>.ngrok.io → E-Banking Portal (4000)
https://aurumvault.netlify.app → Corporate Website
```

### Internal Docker Network

```
backend:3001   → Backend API
postgres:5432  → PostgreSQL
redis:6379     → Redis
admin:3003     → Admin UI
portal:4000    → E-Banking Portal
```

### Host Machine Ports (for ngrok)

```
localhost:3001 → Backend API (Docker)
localhost:3003 → Admin UI (Docker)
localhost:4000 → E-Banking Portal (Docker)
localhost:5432 → PostgreSQL (Docker) - optional
localhost:6379 → Redis (Docker) - optional
```

---

## Environment Variable Dependencies

### Corporate Website (Netlify)

```bash
NEXT_PUBLIC_API_URL=<ngrok_backend_url>
NEXT_PUBLIC_PORTAL_URL=<ngrok_portal_url>
NEXT_PUBLIC_PORTAL_HEALTH_URL=<ngrok_backend_url>/api/portal/health
```

### E-Banking Portal (Docker)

```bash
NEXT_PUBLIC_API_URL=<ngrok_backend_url>
NEXT_PUBLIC_CORPORATE_URL=<netlify_url>
PORT=4000
```

### Admin UI (Docker)

```bash
API_URL=http://backend:3001  # Internal Docker network
PORT=3003
SESSION_SECRET=<secret>
CORPORATE_URL=<netlify_url>
PORTAL_URL=<ngrok_portal_url>
```

### Backend API (Docker)

```bash
PORT=3001
DATABASE_URL=postgresql://postgres:password@postgres:5432/aurumvault
REDIS_URL=redis://redis:6379
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
ADMIN_JWT_SECRET=<secret>
CORS_ORIGINS=<netlify_url>,<ngrok_backend_url>,<ngrok_admin_url>,<ngrok_portal_url>
```

---

## Critical Integration Points

### 1. Authentication Token Flow

```
Corporate Website → Backend API → JWT Token → E-Banking Portal
```

**Requirements**:

- Same JWT secret across services
- Token passed via URL parameter or cookie
- CORS configured for token exchange

### 2. Portal Status Check

```
Corporate Website → Backend API → Portal Status
```

**Requirements**:

- Backend `/api/portal/health` endpoint
- CORS allows Netlify origin
- Real-time status updates

### 3. Admin Portal Control

```
Admin UI → Backend API → Portal Status Update → Corporate Website
```

**Requirements**:

- Admin authentication
- Portal status table in database
- Audit logging

---

## Failure Scenarios

### Scenario 1: Backend API Down

**Impact**:

- ❌ Corporate Website login fails
- ❌ E-Banking Portal cannot load data
- ⚠️ Admin UI partially functional (direct DB access)

**Mitigation**:

- Health check monitoring
- Automatic restart (Docker restart policy)
- Error messages to users

### Scenario 2: ngrok Tunnel Down

**Impact**:

- ❌ Corporate Website cannot reach Backend
- ❌ External access to Admin UI lost
- ✅ Internal Docker services still communicate

**Mitigation**:

- ngrok auto-reconnect
- Monitor tunnel status
- Alert on tunnel failure

### Scenario 3: Database Down

**Impact**:

- ❌ All services fail
- ❌ No data access

**Mitigation**:

- Database health checks
- Automatic restart
- Database backups

### Scenario 4: Netlify Deployment Fails

**Impact**:

- ❌ Corporate Website inaccessible
- ✅ Backend services unaffected

**Mitigation**:

- Netlify build logs
- Rollback to previous deployment
- Local testing before deployment

---

**Document Version**: 1.0  
**Last Updated**: January 17, 2026  
**Status**: ✅ Complete
