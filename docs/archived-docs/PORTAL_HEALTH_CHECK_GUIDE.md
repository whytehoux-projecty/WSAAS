# Portal Health Check Implementation Guide

## Overview

This guide walks you through the complete portal health check system that allows the e-banking login page to display real-time portal availability status. The admin can control the portal status (online/offline/maintenance/scheduled) from the admin interface.

## 📋 What Has Been Implemented

### 1. Backend - Database Schema

✅ **Created**: `PortalStatus` and `PortalStatusAudit` models in Prisma schema

- Tracks current portal status
- Maintains audit log of all status changes
- Links to admin users for accountability

### 2. Backend - API Endpoints

✅ **Created**: `/backend/core-api/src/routes/portal.ts`

#### Public Endpoint

- `GET /api/portal/health` - Publicly accessible, no authentication required
  - Returns portal status in real-time
  -Used by login page to check availability
  
#### Admin Endpoints (Authentication Required)

- `POST /api/portal/status` - Update portal status
- `GET /api/portal/status` - Get current status with full details
- `GET /api/portal/status/history` - Get status change audit log

### 3. Frontend - Portal Status Component

✅ **Created**: `/components/portal/PortalStatusIndicator.tsx`

- Visual status indicator with animated dots
- Auto-polling (default: every 30 seconds)
- Displays status messages and maintenance windows
- Two variants:
  - `PortalStatusIndicator` - Full details with icons
  - `PortalStatusBadge` - Compact badge version

### 4. Frontend - Login Page Integration

✅ **Updated**: `/app/e-banking/auth/login/page.tsx`

- Added portal status indicator at top of login form
- Prevents login when portal is offline/maintenance
- Shows appropriate error messages based on status

## 🚀 Setup Instructions

### Step 1: Database Migration

```bash
cd backend/core-api

# Generate Prisma client with new models
npx prisma generate

# Create and run migration
npx prisma migrate dev --name add_portal_status

# Verify migration succeeded
npx prisma studio  # Opens browser UI to view database
```

### Step 2: Start Backend Server

```bash
cd backend/core-api

# Install dependencies if not already done
npm install

# Start development server
npm run dev

# Backend should now be running on http://localhost:3001
```

### Step 3: Configure Frontend Environment

```bash
cd New_Frontend

# Copy environment example
cp .env.example .env.local

# The file should contain:
# NEXT_PUBLIC_PORTAL_HEALTH_URL=http://localhost:3001/api/portal/health
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 4: Start Frontend Server

```bash
cd New_Frontend

# Install dependencies if needed
npm install

# Start development server
npm run dev

# Frontend should now be running on http://localhost:3000
```

### Step 5: Test the Health Check

1. **Visit Login Page**: <http://localhost:3000/e-banking/auth/login>
2. **Observe Status Indicator**: Should show "Portal Online" with green animated dot
3. **Try Different Statuses**: Use the API to change portal status and see updates

## 🧪 Testing the System

### Test 1: Check Initial Status

```bash
# Public endpoint - no auth needed
curl http://localhost:3001/api/portal/health

# Expected response:
# {
#   "success": true,
#   "data": {
#     "status": "online",
#     "timestamp": "2026-01-15T23:28:41.000Z",
#     "message": "E-Banking Portal is operational"
#   }
# }
```

### Test 2: Change Portal Status (Admin only)

```bash
# First, you need to login as admin and get JWT token
# Then use the token in Authorization header

curl -X POST http://localhost:3001/api/portal/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "maintenance",
    "message": "Scheduled maintenance in progress",
    "reason": "System upgrade"
  }'
```

### Test 3: View Status History (Admin only)

```bash
curl http://localhost:3001/api/portal/status/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎨 Status Types & Visual Indicators

### Online (Green 🟢)

- **Status**: `"online"`
- **Behavior**: Login allowed
- **Visual**: Animated green dot with pulse effect
- **Message**: "Portal is operational and ready to use"

### Offline (Red 🔴)

- **Status**: `"offline"`
- **Behavior**: Login blocked
- **Visual**: Static red dot
- **Message**: "Portal is currently unavailable"

### Under Maintenance (Gray ⚙️)

- **Status**: `"maintenance"`
- **Behavior**: Login blocked
- **Visual**: Static gray dot with wrench icon
- **Message**: "Portal is undergoing maintenance"

### Scheduled Downtime (Yellow 🟡)

- **Status**: `"scheduled_downtime"`
- **Behavior**: Login blocked
- **Visual**: Static yellow dot with clock icon
- **Message**: Shows next scheduled maintenance time

## 🔧 Admin Control (To Be Implemented)

### Future Admin Interface Features

1. **Portal Control Dashboard**
   - Toggle switch for quick ON/OFF
   - Status dropdown: Online | Offline | Maintenance | Scheduled
   - Custom message input
   - Schedule maintenance window

2. **Maintenance Scheduler**
   - Set start time and duration
   - Automatic status changes
   - Email notifications to users

3. **Status History View**
   - Table of all status changes
   - Who changed it and when
   - Reason for change
   - Export to CSV

## 📝 API Response Examples

### Success Response (Portal Online)

```json
{
  "success": true,
  "data": {
    "status": "online",
    "timestamp": "2026-01-15T23:28:41.000Z",
    "message": "E-Banking Portal is operational"
  },
  "meta": {
    "timestamp": "2026-01-15T23:28:41.000Z",
    "requestId": "abc-123-def-456"
  }
}
```

### Success Response (Portal Under Maintenance)

```json
{
  "success": true,
  "data": {
    "status": "maintenance",
    "timestamp": "2026-01-15T23:28:41.000Z",
    "message": "System upgrade in progress. Expected completion: 2:00 AM"
  },
  "meta": {
    "timestamp": "2026-01-15T23:28:41.000Z",
    "requestId": "abc-123-def-456"
  }
}
```

### Response with Scheduled Maintenance

```json
{
  "success": true,
  "data": {
    "status": "online",
    "timestamp": "2026-01-15T23:28:41.000Z",
    "message": "Portal is operational",
    "nextScheduledMaintenance": "2026-01-16T02:00:00.000Z"
  },
  "meta": {
    "timestamp": "2026-01-15T23:28:41.000Z",
    "requestId": "abc-123-def-456"
  }
}
```

## 🔐 Security Considerations

1. **Public Health Endpoint**
   - No sensitive data exposed
   - Rate-limited to prevent abuse
   - Simple status information only

2. **Admin Endpoints**
   - Require JWT authentication
   - Admin role verification
   - All changes logged in audit table
   - IP address and user agent tracked

3. **Frontend Security**
   - Environment variables for API URLs
   - No secrets in frontend code
   - CORS properly configured on backend

## 🚧 Next Steps (Frontend Split)

Once this system is tested and working:

1. **Create Corporate Website**
   - Copy commercial pages + login page
   - Deploy to cloud (Vercel/Netlify)
   - Configure production API URL

2. **Create E-Banking Portal**
   - Copy all e-banking pages
   - Package with Docker
   - Deploy locally
   - Configure health check endpoint

3. **Admin Portal Control**
   - Build admin UI for portal control
   - Add scheduling functionality
   - Implement email notifications

## 📊 Monitoring & Logs

### What Gets Logged

- Every status change (who, when, why)
- IP addresses for security
- User agents for debugging
- Previous and new status values
- Custom reason/message

### Viewing Logs

```sql
-- View recent status changes
SELECT * FROM portal_status_audit 
ORDER BY changed_at DESC 
LIMIT 10;

-- View who made changes
SELECT 
  psa.new_status,
  psa.changed_at,
  au.email,
  psa.reason
FROM portal_status_audit psa
JOIN admin_users au ON psa.changed_by = au.id
ORDER BY psa.changed_at DESC;
```

## ❓ Troubleshooting

### Issue: Status indicator shows "Checking..."

**Solutions**:

- Verify backend is running on port 3001
- Check CORS configuration allows frontend origin
- Check browser network tab for failed requests
- Verify `NEXT_PUBLIC_PORTAL_HEALTH_URL` is set correctly

### Issue: Login still works when portal is offline

**Solutions**:

- Check portal status state is being updated
- Verify `setPortalStatus` is being called
- Check browser console for errors
- Ensure form validation is running

### Issue: Can't change portal status

**Solutions**:

- Verify you're logged in as admin
- Check JWT token is valid and not expired
- Verify admin has proper permissions
- Check backend logs for errors

## 📚 Related Files

### Backend Files

- `/backend/core-api/prisma/schema.prisma` - Database schema
- `/backend/core-api/src/routes/portal.ts` - API routes
- `/backend/core-api/src/server.ts` - Route registration

### Frontend Files

- `/New_Frontend/components/portal/PortalStatusIndicator.tsx` - Status component
- `/New_Frontend/app/e-banking/auth/login/page.tsx` - Login page
- `/New_Frontend/.env.example` - Environment config example

### Documentation

- `/docs/FRONTEND_SPLIT_PLAN.md` - Overall architecture plan
- `/docs/PORTAL_HEALTH_CHECK_GUIDE.md` - This file

## ✅ Checklist

Before considering this feature complete:

- [ ] Database migration completed successfully
- [ ] Backend API endpoints tested and working
- [ ] Frontend status indicator displays correctly
- [ ] Auto-polling works (status updates every 30s)
- [ ] Login is blocked when portal is offline
- [ ] Appropriate error messages shown
- [ ] Admin can change portal status
- [ ] Status changes are logged in audit table
- [ ] Environment variables documented
- [ ] CORS properly configured
- [ ] Ready for frontend split into two codebases

---

**Last Updated**: 2026-01-15
**Status**: Implementation Complete, Testing Required
