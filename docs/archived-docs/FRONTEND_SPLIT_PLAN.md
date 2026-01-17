# Frontend Split Implementation Plan

## Overview

This document outlines the plan to split the AURUM VAULT frontend into two separate codebases based on deployment requirements.

## 🎯 Objectives

### 1. Corporate Website (Cloud-Deployed)

**Location**: `corporate-website/`
**Deployment**: Cloud (Vercel/Netlify/AWS)
**Contents**:

- Landing page (`/`)
- About page (`/about`)
- Personal Banking (`/personal-banking`)
- Business Banking (`/business-banking`)
- **E-Banking Login Page** (`/login`)
- Footer and Header components
- Commercial components

### 2. E-Banking Portal (Local Docker)

**Location**: `e-banking-portal/`
**Deployment**: Local PC via Docker, exposed via ngrok/port forwarding
**Contents**:

- Dashboard (`/dashboard`)
- Accounts (`/accounts`)
- Transactions (`/transactions`)
- Transfer (`/transfer`)
- Bills (`/bills`)
- Cards (`/cards`)
- Beneficiaries (`/beneficiaries`)
- Statements (`/statements`)
- Settings (`/settings`)
- Support (`/support`)
- E-Banking specific layout and components

## 🔄 Health Check Architecture

### Backend Health Endpoint

The backend will expose a health check endpoint:

```
GET /api/portal/health
Response: {
  "status": "online" | "offline" | "maintenance" | "scheduled_downtime",
  "timestamp": "2026-01-15T23:28:41Z",
  "message": "Portal is operational",
  "nextScheduledMaintenance": "2026-01-16T02:00:00Z" (optional)
}
```

### Login Page Health Check Component

The login page will:

1. Check portal health on page load
2. Poll every 30 seconds (configurable)
3. Display status indicator with:
   - ✅ Green dot + "Portal Online" - normal operation
   - 🔴 Red dot + "Portal Offline" - cannot connect
   - 🟡 Yellow dot + "Scheduled Maintenance" - scheduled downtime
   - 🔧 Gray dot + "Under Maintenance" - unscheduled maintenance

### Admin Control Features

Admin interface will provide:

- **Toggle ON/OFF**: Manually enable/disable portal
- **Schedule Mode**: Set maintenance windows
- **Status Message**: Custom message to display on login page
- **Emergency Shutdown**: Immediate portal shutdown

## 📁 Directory Structure

```
AutumVault/
├── corporate-website/          # NEW - Cloud deployed
│   ├── app/
│   │   ├── (commercial)/
│   │   │   ├── about/
│   │   │   ├── personal-banking/
│   │   │   └── business-banking/
│   │   ├── login/              # E-banking login with health check
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── commercial/
│   │   ├── layout/
│   │   ├── ui/
│   │   └── portal-status/      # NEW - Status indicator component
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── next.config.mjs
│
├── e-banking-portal/           # NEW - Docker deployed
│   ├── app/
│   │   ├── dashboard/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   ├── transfer/
│   │   ├── bills/
│   │   ├── cards/
│   │   ├── beneficiaries/
│   │   ├── statements/
│   │   ├── settings/
│   │   ├── support/
│   │   ├── layout.tsx
│   │   └── page.tsx            # Redirect to dashboard
│   ├── components/
│   │   ├── banking/
│   │   └── ui/
│   ├── lib/
│   ├── public/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   └── next.config.mjs
│
├── backend/                     # Existing
│   └── core-api/
│       └── src/
│           └── routes/
│               └── portal/
│                   └── health.ts    # NEW - Health endpoint
│
└── admin-interface/             # Existing
    └── portal-control/          # NEW - Portal management UI
```

## 🛠️ Implementation Steps

### Phase 1: Backend Health Check API

1. **Create Portal Health Endpoint**
   - File: `backend/core-api/src/routes/portal/health.ts`
   - Implement status logic (online/offline/maintenance)
   - Add database table for portal status configuration
   - Return health status, message, and next maintenance window

2. **Create Admin Portal Control API**
   - Endpoints for turning portal on/off
   - Endpoints for scheduling maintenance
   - Endpoints for setting status messages
   - Audit logging for all portal status changes

### Phase 2: Admin Interface Portal Control

1. **Create Portal Control Dashboard**
   - Toggle switch for ON/OFF
   - Schedule maintenance form
   - Status message input
   - Current status display
   - Activity log

### Phase 3: Corporate Website Setup

1. **Create New Project**

   ```bash
   npx create-next-app@latest corporate-website --typescript --tailwind --app
   ```

2. **Copy Shared Resources**
   - Copy commercial components
   - Copy layout components (Header, Footer)
   - Copy UI components (Card, Button, etc.)
   - Copy images and public assets
   - Copy styles and Tailwind config

3. **Implement Login Page with Health Check**
   - Create `/login` page
   - Add PortalStatus component
   - Implement health check API client
   - Add polling mechanism
   - Style status indicators

### Phase 4: E-Banking Portal Setup

1. **Create New Project**

   ```bash
   npx create-next-app@latest e-banking-portal --typescript --tailwind --app
   ```

2. **Copy E-Banking Resources**
   - Copy all e-banking pages
   - Copy e-banking layout
   - Copy banking components
   - Copy UI components
   - Copy images and assets
   - Copy styles and Tailwind config

3. **Docker Configuration**
   - Create Dockerfile
   - Create docker-compose.yml
   - Configure environment variables
   - Set up health checks

### Phase 5: Integration & Testing

1. **Test Health Check Flow**
   - Verify login page detects portal status
   - Test all status states (online/offline/maintenance)
   - Verify polling works correctly
   - Test admin control interface

2. **Test Deployments**
   - Deploy corporate website to cloud
   - Deploy e-banking portal via Docker
   - Test ngrok/port forwarding setup
   - Verify cross-origin requests work

### Phase 6: Security & Optimization

1. **CORS Configuration**
   - Configure backend to accept requests from both domains
   - Set up proper CORS headers

2. **Environment Variables**
   - Corporate website: `NEXT_PUBLIC_PORTAL_HEALTH_URL`
   - E-Banking portal: `NEXT_PUBLIC_API_URL`

3. **Authentication Flow**
   - Login page authenticates with backend
   - On success, redirect to portal URL
   - Portal verifies session on load

## 🎨 Portal Status Component Design

### Visual Design

```tsx
// PortalStatus.tsx
<div className="flex items-center gap-2 p-3 rounded-lg border">
  <div className={`w-3 h-3 rounded-full ${statusColor}`} />
  <div>
    <p className="text-sm font-semibold">{statusText}</p>
    <p className="text-xs text-gray-500">{statusMessage}</p>
  </div>
</div>
```

### Status Colors

- 🟢 Online: `bg-green-500` with pulse animation
- 🔴 Offline: `bg-red-500`
- 🟡 Scheduled Maintenance: `bg-yellow-500`
- ⚙️ Under Maintenance: `bg-gray-500`

## 🔐 Security Considerations

1. **Health Check Endpoint**
   - Public endpoint (no auth required)
   - Rate limiting to prevent abuse
   - Simple response format

2. **Admin Control**
   - Requires admin authentication
   - Audit all status changes
   - Validate input data

3. **Cross-Origin Requests**
   - Proper CORS configuration
   - Whitelist specific origins
   - Secure cookie handling

## 📊 Database Schema Changes

```sql
-- Portal Status Configuration
CREATE TABLE portal_status (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50) NOT NULL, -- 'online', 'offline', 'maintenance', 'scheduled_downtime'
  message TEXT,
  next_scheduled_maintenance TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES users(id)
);

-- Portal Status Audit Log
CREATE TABLE portal_status_audit (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50) NOT NULL,
  message TEXT,
  changed_by INTEGER REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  reason TEXT
);
```

## 🚀 Deployment Configuration

### Corporate Website (Vercel)

```bash
# vercel.json
{
  "env": {
    "NEXT_PUBLIC_PORTAL_HEALTH_URL": "https://api.aurumvault.com/api/portal/health"
  }
}
```

### E-Banking Portal (Docker)

```yaml
# docker-compose.yml
version: '3.8'
services:
  e-banking-portal:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
      - NODE_ENV=production
    restart: unless-stopped
```

## 📝 Configuration Files

### Corporate Website - `.env.local`

```env
NEXT_PUBLIC_PORTAL_HEALTH_URL=http://localhost:3001/api/portal/health
NEXT_PUBLIC_PORTAL_URL=http://localhost:3000
```

### E-Banking Portal - `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CORPORATE_URL=http://localhost:3002
```

## 🧪 Testing Checklist

- [ ] Health check endpoint returns correct status
- [ ] Login page displays correct status indicator
- [ ] Status updates in real-time (polling)
- [ ] Admin can toggle portal on/off
- [ ] Admin can schedule maintenance
- [ ] Scheduled maintenance shows countdown
- [ ] Offline portal shows appropriate message
- [ ] Login redirects to portal when online
- [ ] Login blocks when portal is offline
- [ ] CORS works between corporate site and backend
- [ ] Docker deployment works correctly
- [ ] ngrok/port forwarding configured
- [ ] Session handling works cross-domain

## 🔄 Migration Path

1. Keep current `New_Frontend` as backup
2. Create both new projects in parallel
3. Test thoroughly before switching
4. Update DNS/routing after validation
5. Archive old frontend once stable

## 📞 Support & Rollback

- Maintain old frontend for quick rollback
- Document all configuration changes
- Create rollback scripts
- Monitor health check reliability
- Set up alerting for portal outages
