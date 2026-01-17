# AURUM VAULT - Quick Reference Summary

## 📋 Service Overview

| Service | Technology | Port | Deployment | Status |
|---------|-----------|------|------------|--------|
| **Corporate Website** | Next.js 14 | 3002 | Netlify | ✅ Ready |
| **Backend Core API** | Fastify + TypeScript | 3001 | Docker + ngrok | ⚠️ Needs CORS update |
| **Admin Interface** | Fastify + EJS | 3003 | Docker + ngrok | ✅ Ready |
| **E-Banking Portal** | Next.js 15 | 4000 | Docker + ngrok | ⚠️ Needs config update |
| **PostgreSQL** | PostgreSQL 15 | 5432 | Docker | ✅ Ready |
| **Redis** | Redis 7 | 6379 | Docker | ✅ Ready |

---

## 🔧 Technology Stack Summary

### Corporate Website

- **Framework**: Next.js 14.2.35
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **UI**: Radix UI + Framer Motion
- **Node**: 18.19.0
- **Type**: SSG/SSR Hybrid
- **Dockerfile**: ❌ Not needed (Netlify)

### Backend Core API

- **Framework**: Fastify 4.24.3
- **Language**: TypeScript 5.3.3
- **ORM**: Prisma 5.7.1
- **Database**: PostgreSQL 15
- **Cache**: Redis 4.6.11
- **Auth**: JWT (@fastify/jwt)
- **Node**: ≥18.0.0
- **Dockerfile**: ✅ Present (multi-stage)

### Admin Interface

- **Framework**: Fastify 4.24.3
- **Template Engine**: EJS 3.1.10
- **Language**: TypeScript 5.3.3
- **ORM**: Prisma 5.7.1 (shared schema)
- **Auth**: JWT (jsonwebtoken)
- **Node**: ≥18.0.0
- **Dockerfile**: ✅ Present (multi-stage)

### E-Banking Portal

- **Framework**: Next.js 15.1.6
- **Language**: TypeScript 5
- **React**: 19.0.0
- **Styling**: Tailwind CSS 4.0.0
- **UI**: Radix UI + Framer Motion
- **Node**: ≥18.0.0
- **Dockerfile**: ✅ Present (multi-stage)

---

## 🌐 Network Configuration

### ngrok Tunnels Required

```
Tunnel 1: Backend API
  Local:  localhost:3001
  Public: https://<random>.ngrok.io

Tunnel 2: Admin Interface
  Local:  localhost:3003
  Public: https://<random>.ngrok.io

Tunnel 3: E-Banking Portal
  Local:  localhost:4000
  Public: https://<random>.ngrok.io
```

### Netlify Deployment

```
Domain: https://aurumvault.netlify.app (or custom domain)
Build:  npm run build
Output: .next directory
```

---

## 📝 Environment Variables Checklist

### ✅ Corporate Website (Netlify)

```bash
NEXT_PUBLIC_API_URL=https://<backend>.ngrok.io
NEXT_PUBLIC_PORTAL_URL=https://<portal>.ngrok.io
NEXT_PUBLIC_PORTAL_HEALTH_URL=https://<backend>.ngrok.io/api/portal/health
```

### ✅ E-Banking Portal (Docker)

```bash
NEXT_PUBLIC_API_URL=https://<backend>.ngrok.io
NEXT_PUBLIC_CORPORATE_URL=https://aurumvault.netlify.app
PORT=4000
```

### ✅ Admin Interface (Docker)

```bash
API_URL=http://backend:3001
PORT=3003
SESSION_SECRET=<generate-32-char-secret>
CORPORATE_URL=https://aurumvault.netlify.app
PORTAL_URL=https://<portal>.ngrok.io
```

### ✅ Backend Core API (Docker)

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:password@postgres:5432/aurumvault
REDIS_URL=redis://redis:6379
JWT_SECRET=<generate-32-char-secret>
JWT_REFRESH_SECRET=<generate-32-char-secret>
ADMIN_JWT_SECRET=<generate-32-char-secret>
CORS_ORIGINS=https://aurumvault.netlify.app,https://<backend>.ngrok.io,https://<admin>.ngrok.io,https://<portal>.ngrok.io
```

---

## 🚀 Startup Commands

### Start All Docker Services

```bash
cd /Volumes/Project\ Disk/PROJECTS/CODING/AURUMVAULT
docker-compose up -d
```

### Start ngrok Tunnels (after Docker is running)

```bash
# Terminal 1 - Backend
ngrok http 3001

# Terminal 2 - Admin
ngrok http 3003

# Terminal 3 - Portal
ngrok http 4000
```

### Deploy Corporate Website to Netlify

```bash
cd corporate-website
npm run build
netlify deploy --prod
```

---

## 🔍 Health Check Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| Backend API | `http://localhost:3001/health` | `{"success":true,"data":{"status":"healthy"}}` |
| Admin UI | `http://localhost:3003/api/health` | `{"status":"ok"}` |
| E-Banking Portal | `http://localhost:4000/` | Next.js page loads |
| PostgreSQL | `docker exec aurumvault-db pg_isready` | `accepting connections` |
| Redis | `docker exec aurumvault-redis redis-cli ping` | `PONG` |

---

## 📊 Database Schema Summary

### Key Tables

- **admin_users** - Admin authentication
- **users** - Customer accounts
- **accounts** - Bank accounts
- **transactions** - All transactions
- **wire_transfers** - International transfers
- **kyc_documents** - Identity verification
- **cards** - Debit/credit cards
- **bill_payees** - Bill payment recipients
- **beneficiaries** - Transfer recipients
- **portal_status** - System status
- **audit_logs** - Audit trail

### Prisma Schema Location

```
/backend/core-api/prisma/schema.prisma
```

### Database Migrations

```bash
cd backend/core-api
npx prisma migrate deploy  # Production
npx prisma migrate dev     # Development
```

---

## ⚠️ Critical Issues to Fix

### 1. Backend Server Binding

**File**: `/backend/core-api/src/server.ts` (line 226)  
**Current**:

```typescript
await fastify.listen({
  port: config.PORT,
  host: 'localhost',  // ❌ Won't work with ngrok
});
```

**Fix**:

```typescript
await fastify.listen({
  port: config.PORT,
  host: '0.0.0.0',  // ✅ Allows ngrok access
});
```

### 2. E-Banking Portal Next.js Config

**File**: `/e-banking-portal/next.config.ts`  
**Current**:

```typescript
const nextConfig: NextConfig = {
  /* config options here */
};
```

**Fix**:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // ✅ Required for Docker
};
```

### 3. Backend CORS Configuration

**File**: `/backend/core-api/src/middleware/security.ts`  
**Action**: Add Netlify URL and ngrok URLs to allowed origins

### 4. Corporate Website Netlify Config

**File**: `/corporate-website/netlify.toml`  
**Status**: ❌ Needs to be created

---

## 🔐 Security Checklist

- [ ] Generate strong JWT secrets (min 32 characters)
- [ ] Generate strong session secrets (min 32 characters)
- [ ] Update PostgreSQL password from default
- [ ] Enable Redis password in production
- [ ] Configure ngrok authentication (basic auth or IP whitelist)
- [ ] Set up HTTPS for all ngrok tunnels (default)
- [ ] Configure CORS properly (no wildcards in production)
- [ ] Enable rate limiting (already configured ✅)
- [ ] Set up audit logging (already configured ✅)
- [ ] Review CSP headers in Admin UI

---

## 💰 Cost Breakdown

### ngrok

- **Free Tier**: 1 online process, dynamic URLs
- **Paid Plan**: $8/month
  - ✅ Multiple tunnels (need 3)
  - ✅ Custom subdomains
  - ✅ Reserved domains
  - ✅ Higher limits
- **Recommendation**: Upgrade to paid plan

### Netlify

- **Free Tier**:
  - ✅ 100GB bandwidth/month
  - ✅ 300 build minutes/month
  - ✅ Automatic HTTPS
  - ✅ CDN included
- **Recommendation**: Free tier sufficient for testing

### Total Monthly Cost

- **Minimum**: $8/month (ngrok paid)
- **Recommended**: $8/month

---

## 📁 File Structure

```
AURUMVAULT/
├── backend/
│   ├── core-api/
│   │   ├── Dockerfile.prod ✅
│   │   ├── prisma/
│   │   │   └── schema.prisma ✅
│   │   ├── src/
│   │   │   ├── server.ts ⚠️
│   │   │   └── middleware/security.ts ⚠️
│   │   └── package.json ✅
│   └── package.json ✅
├── admin-interface/
│   ├── Dockerfile.prod ✅
│   ├── src/
│   │   └── server.ts ✅
│   └── package.json ✅
├── e-banking-portal/
│   ├── Dockerfile.prod ✅
│   ├── next.config.ts ⚠️
│   └── package.json ✅
├── corporate-website/
│   ├── next.config.mjs ✅
│   ├── netlify.toml ❌
│   └── package.json ✅
├── docker-compose.yml ⚠️
├── docker-compose.prod.yml ⚠️
├── .env.example ✅
└── docs/
    └── deployment/
        ├── PHASE_1_ARCHITECTURE_ANALYSIS.md ✅
        ├── SERVICE_DEPENDENCY_MAP.md ✅
        └── QUICK_REFERENCE.md ✅ (this file)
```

---

## 🎯 Next Actions (Phase 2)

### Priority 1: Critical Fixes

1. ✅ Fix Backend server binding (`0.0.0.0`)
2. ✅ Add `output: 'standalone'` to E-Banking Portal config
3. ✅ Update Backend CORS configuration
4. ✅ Create `netlify.toml` for Corporate Website

### Priority 2: Docker Configuration

5. ✅ Update `docker-compose.yml` for hybrid deployment
2. ✅ Remove Corporate Website service from Docker Compose
3. ✅ Add environment variable templates
4. ✅ Configure health checks for all services

### Priority 3: ngrok Setup

9. ✅ Create `ngrok.yml` configuration file
2. ✅ Create startup scripts for multiple tunnels
3. ✅ Create URL capture and update scripts
4. ✅ Document ngrok account setup

### Priority 4: Netlify Configuration

13. ✅ Create `netlify.toml` with build settings
2. ✅ Document environment variable setup
3. ✅ Create deployment scripts
4. ✅ Set up Netlify CLI for automation

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Docker containers won't start  
**Solution**: Check Docker daemon is running, check port conflicts

**Issue**: ngrok tunnel not accessible  
**Solution**: Verify ngrok auth token, check firewall settings

**Issue**: CORS errors from Netlify  
**Solution**: Verify Backend CORS_ORIGINS includes Netlify URL

**Issue**: Database connection failed  
**Solution**: Check PostgreSQL is running, verify DATABASE_URL

**Issue**: Netlify build fails  
**Solution**: Check build logs, verify environment variables set

---

## 🔗 Useful Commands

### Docker

```bash
# View all containers
docker ps -a

# View logs
docker logs aurumvault-api
docker logs aurumvault-admin
docker logs aurumvault-portal

# Restart a service
docker restart aurumvault-api

# Stop all services
docker-compose down

# Rebuild a service
docker-compose build backend
```

### ngrok

```bash
# Start tunnel with config
ngrok start --all --config ngrok.yml

# View tunnel status
curl http://localhost:4040/api/tunnels

# Kill all tunnels
pkill ngrok
```

### Netlify

```bash
# Login
netlify login

# Deploy
netlify deploy --prod

# View site info
netlify status

# Set environment variable
netlify env:set NEXT_PUBLIC_API_URL "https://xyz.ngrok.io"
```

### Database

```bash
# Access PostgreSQL
docker exec -it aurumvault-db psql -U postgres -d aurumvault

# Backup database
docker exec aurumvault-db pg_dump -U postgres aurumvault > backup.sql

# Restore database
docker exec -i aurumvault-db psql -U postgres aurumvault < backup.sql
```

---

**Document Version**: 1.0  
**Last Updated**: January 17, 2026  
**Status**: ✅ Complete  
**Ready for**: Phase 2 Implementation
