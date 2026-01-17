# AURUM VAULT System Integration - Test Checklist

This document provides a comprehensive test checklist to verify all system components are properly wired and connected.

## Prerequisites

Before testing, ensure all services are running:

```bash
# Start all services
cd /Volumes/Project\ Disk/PROJECTS/CODING/BANK/AutumVault

# Install dependencies
cd backend/core-api && npm install
cd ../..
cd corporate-website && npm install
cd ..
cd e-banking-portal && npm install
cd ..
cd admin-interface && npm install
cd ..

# Start services (in separate terminals)
# Terminal 1: Backend
cd backend/core-api && npm run dev

# Terminal 2: Corporate Website
cd corporate-website && npm run dev

# Terminal 3: E-Banking Portal
cd e-banking-portal && npm run dev

# Terminal 4: Admin Interface
cd admin-interface && npm run dev
```

## Test Checklist

### 1. Backend API Health Checks

| Test | Endpoint | Expected | Status |
|------|----------|----------|--------|
| Root endpoint | GET <http://localhost:3001/> | JSON with API info | ☐ |
| Health check | GET <http://localhost:3001/health> | `{"success": true, "data": {"status": "healthy"}}` | ☐ |
| Portal health | GET <http://localhost:3001/api/portal/health> | `{"success": true, "data": {"status": "online"}}` | ☐ |
| API docs | GET <http://localhost:3001/docs> | Swagger UI | ☐ |

### 2. Corporate Website

| Test | URL | Expected | Status |
|------|-----|----------|--------|
| Home page loads | <http://localhost:3002> | Corporate homepage | ☐ |
| Login page loads | <http://localhost:3002/login> | Login form with portal status | ☐ |
| Portal status shows | <http://localhost:3002/login> | Status indicator (online/offline) | ☐ |
| Signup page loads | <http://localhost:3002/signup> | Registration form | ☐ |

### 3. E-Banking Portal

| Test | URL | Expected | Status |
|------|-----|----------|--------|
| Redirect to login | <http://localhost:4000> | Redirects to corporate login if no token | ☐ |
| Dashboard loads | <http://localhost:4000/dashboard?token=xxx> | Dashboard with user data | ☐ |
| Accounts page | <http://localhost:4000/accounts> | Account list | ☐ |
| Transactions page | <http://localhost:4000/transactions> | Transaction history | ☐ |
| Transfer page | <http://localhost:4000/transfer> | Transfer form | ☐ |
| Cards page | <http://localhost:4000/cards> | Card management | ☐ |
| Bills page | <http://localhost:4000/bills> | Bill payment | ☐ |
| Settings page | <http://localhost:4000/settings> | User settings | ☐ |

### 4. Admin Interface

| Test | URL | Expected | Status |
|------|-----|----------|--------|
| Login page | <http://localhost:3003/login> | Admin login form | ☐ |
| Dashboard | <http://localhost:3003/dashboard> | Admin dashboard | ☐ |
| Portal Status | <http://localhost:3003/portal-status> | Portal status management | ☐ |
| Users page | <http://localhost:3003/users> | User management | ☐ |
| Transactions | <http://localhost:3003/transactions> | Transaction monitoring | ☐ |
| Accounts | <http://localhost:3003/accounts> | Account management | ☐ |

### 5. Authentication Flow Tests

#### 5.1 User Registration

1. ☐ Go to <http://localhost:3002/signup>
2. ☐ Fill in registration form
3. ☐ Submit form
4. ☐ Verify API call to /api/auth/register
5. ☐ Check response for user data

#### 5.2 User Login

1. ☐ Go to <http://localhost:3002/login>
2. ☐ Check portal status indicator shows "Online"
3. ☐ Enter credentials
4. ☐ Submit form
5. ☐ Verify API call to /api/auth/login
6. ☐ Check token is stored in localStorage
7. ☐ Verify redirect to e-banking portal with token

#### 5.3 Token Handling in Portal

1. ☐ Receive token from URL parameter
2. ☐ Store token in localStorage
3. ☐ Clean URL (remove token parameter)
4. ☐ Use token for API calls
5. ☐ Handle token expiration (redirect to login)

#### 5.4 Admin Login

1. ☐ Go to <http://localhost:3003/login>
2. ☐ Enter admin credentials
3. ☐ Submit form
4. ☐ Verify admin_token cookie is set
5. ☐ Access admin dashboard

### 6. Portal Status Control Tests

#### 6.1 View Current Status

1. ☐ Login to admin interface
2. ☐ Go to Portal Status page
3. ☐ Verify current status is displayed
4. ☐ Check last updated timestamp
5. ☐ Verify status history is shown

#### 6.2 Change Portal Status

1. ☐ Click "Set Offline" button
2. ☐ Confirm the change
3. ☐ Verify status updates to "Offline"
4. ☐ Check corporate login page shows "Portal Offline"
5. ☐ Verify login is disabled when offline

#### 6.3 Maintenance Mode

1. ☐ Click "Maintenance" button
2. ☐ Enter maintenance message
3. ☐ Confirm the change
4. ☐ Verify status updates to "Maintenance"
5. ☐ Check corporate login page shows maintenance message

#### 6.4 Scheduled Maintenance

1. ☐ Click "Schedule" button
2. ☐ Select future date/time
3. ☐ Enter scheduled message
4. ☐ Confirm the schedule
5. ☐ Verify scheduled maintenance is displayed

#### 6.5 Set Portal Online

1. ☐ Click "Set Online" button
2. ☐ Confirm the change
3. ☐ Verify status updates to "Online"
4. ☐ Check corporate login page shows "Portal Online"
5. ☐ Verify login is enabled

### 7. API Integration Tests

#### 7.1 Corporate Website API Calls

```bash
# Portal health check
curl http://localhost:3001/api/portal/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234","firstName":"Test","lastName":"User","dateOfBirth":"1990-01-01"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

#### 7.2 E-Banking Portal API Calls

```bash
# Get profile
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get accounts
curl http://localhost:3001/api/accounts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get transactions
curl http://localhost:3001/api/transactions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 7.3 Admin API Calls

```bash
# Get portal status
curl http://localhost:3001/api/portal/status \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Update portal status
curl -X POST http://localhost:3001/api/portal/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"offline","message":"System is offline","reason":"Testing"}'

# Get status history
curl http://localhost:3001/api/portal/status/history \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 8. Cross-Origin Communication

| Test | From | To | Expected | Status |
|------|------|-----|----------|--------|
| Portal health | Corporate (3002) | Backend (3001) | CORS allowed | ☐ |
| Auth login | Corporate (3002) | Backend (3001) | CORS allowed | ☐ |
| Dashboard data | Portal (4000) | Backend (3001) | CORS allowed | ☐ |
| Portal status | Admin (3003) | Backend (3001) | CORS allowed | ☐ |

### 9. Environment Variables

#### Backend (core-api/.env)

- ☐ DATABASE_URL is set
- ☐ JWT_SECRET is set
- ☐ CORS_ORIGINS includes all frontend URLs
- ☐ PORT is 3001

#### Corporate Website (.env.local)

- ☐ NEXT_PUBLIC_API_URL = <http://localhost:3001>
- ☐ NEXT_PUBLIC_PORTAL_URL = <http://localhost:4000>
- ☐ NEXT_PUBLIC_PORTAL_HEALTH_URL = <http://localhost:3001/api/portal/health>

#### E-Banking Portal (.env.local)

- ☐ NEXT_PUBLIC_API_URL = <http://localhost:3001>
- ☐ NEXT_PUBLIC_CORPORATE_URL = <http://localhost:3002>

#### Admin Interface (.env)

- ☐ API_URL = <http://localhost:3001>
- ☐ PORT = 3003

## Troubleshooting

### Common Issues

#### "Cannot connect to API"

- Check if backend is running on port 3001
- Verify CORS configuration
- Check network/firewall settings

#### "Portal status shows offline when it should be online"

- Check PortalStatus table in database
- Verify API endpoint `/api/portal/health` returns correctly
- Check browser console for errors

#### "Login fails with CORS error"

- Add frontend URL to CORS_ORIGINS in backend .env
- Restart backend after changing .env

#### "Token not being set"

- Check localStorage permissions
- Verify API response contains accessToken
- Check browser console for errors

#### "Admin can't update portal status"

- Verify admin token is valid
- Check admin permissions in database
- Verify API URL in admin .env

## Test Results Summary

| Component | Tests Passed | Tests Failed | Notes |
|-----------|-------------|--------------|-------|
| Backend API | ☐ | ☐ | |
| Corporate Website | ☐ | ☐ | |
| E-Banking Portal | ☐ | ☐ | |
| Admin Interface | ☐ | ☐ | |
| Authentication | ☐ | ☐ | |
| Portal Status | ☐ | ☐ | |
| CORS | ☐ | ☐ | |

---

**Last Updated**: 2026-01-17
**Tester**: _________________
**Date**: _________________
