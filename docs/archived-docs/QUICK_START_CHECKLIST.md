# 🚀 Quick Start Checklist

Follow these steps in order to get the portal health check system running.

## ⚠️ Prerequisites

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running (or using SQLite for dev)
- [ ] Both backend and frontend dependencies installed

## 📝 Step-by-Step Setup

### 1. Database Setup (5 minutes)

```bash
# Navigate to backend
cd /Volumes/Project\ Disk/PROJECTS/CODING/BANK/AutumVault/backend/core-api

# Generate Prisma client with new models
npx prisma generate

# Create migration
npx prisma migrate dev --name add_portal_status

# Seed default portal status (optional)
npx prisma studio  # Opens UI to manually add a record
```

**Expected Result**: ✅ Two new tables created: `portal_status` and `portal_status_audit`

---

### 2. Backend Configuration (2 minutes)

```bash
# Still in backend/core-api directory
# Check if .env exists
cat .env

# Make sure these variables are set:
# DATABASE_URL="file:./prisma/dev.db"  # or your PostgreSQL URL
# JWT_SECRET="your-secret-key"
# PORT=3001
```

**Expected Result**: ✅ Environment variables configured

---

### 3. Start Backend Server (1 minute)

```bash
# In backend/core-api directory
npm run dev

# Or if that doesn't work:
npm run build
npm start
```

**Expected Output**:

```
🚀 Aurum Vault Core API server running on http://0.0.0.0:3001
📚 API documentation available at http://0.0.0.0:3001/docs
```

**✅ Checkpoint**: Visit <http://localhost:3001/api/portal/health> in browser

- Should see JSON response with `"status": "online"`

---

### 4. Frontend Configuration (2 minutes)

```bash
# Open new terminal
cd /Volumes/Project\ Disk/PROJECTS/CODING/BANK/AutumVault/New_Frontend

# Create .env.local from example
cp .env.example .env.local

# Verify content
cat .env.local
```

**Expected content**:

```
NEXT_PUBLIC_PORTAL_HEALTH_URL=http://localhost:3001/api/portal/health
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Expected Result**: ✅ Environment file created

---

### 5. Start Frontend Server (1 minute)

```bash
# In New_Frontend directory
npm run dev
```

**Expected Output**:

```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

**Expected Result**: ✅ Frontend running on <http://localhost:3000>

---

### 6. Test the System (5 minutes)

#### Test 1: Visit Login Page

```
URL: http://localhost:3000/e-banking/auth/login
```

**Look for**:

- ✅ Green dot with "Portal Online"
- ✅ Animated pulse effect on green dot
- ✅ Message: "E-Banking portal is operational and ready to use"
- ✅ Last checked timestamp updates

**If you see**: "Checking portal status..." → Wait 5 seconds
**If you see**: Error → Check backend is running on port 3001

---

#### Test 2: Change Portal Status

**Option A: Using Prisma Studio**

```bash
# In backend/core-api directory
npx prisma studio
```

1. Click on `portal_status` table
2. Click "Add record"
3. Set:
   - status: `offline`
   - message: `Testing offline mode`
4. Save

**Option B: Using API (need admin JWT)**

```bash
# First login as admin to get token
# Then:
curl -X POST http://localhost:3001/api/portal/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "offline",
    "message": "Testing offline mode"
  }'
```

**Expected Result**: Within 30 seconds, login page should show:

- ✅ Red dot with "Portal Offline"
- ✅ Message: "Testing offline mode"

---

#### Test 3: Try to Login While Offline

1. Fill in account number and password
2. Click "Sign In"

**Expected Result**:

- ✅ Red error message: "Portal is currently offline. Please try again later."
- ✅ Login blocked (does not proceed)

---

#### Test 4: Bring Portal Back Online

Change status back to `online` using Prisma Studio or API.

**Expected Result**:

- ✅ Green dot shows within 30 seconds
- ✅ Login now works

---

### 7. Test Different Status Types

#### Test Maintenance Mode

```json
{
  "status": "maintenance",
  "message": "System upgrade in progress"
}
```

**Expected**: Gray dot, wrench icon, login blocked

#### Test Scheduled Downtime

```json
{
  "status": "scheduled_downtime",
  "message": "Planned maintenance tonight",
  "nextScheduledMaintenance": "2026-01-16T02:00:00.000Z"
}
```

**Expected**: Yellow dot, clock icon, shows maintenance time

---

## 🎯 Success Criteria

You've successfully implemented the portal health check if:

- [x] ✅ Login page shows portal status indicator
- [x] ✅ Status updates automatically every 30 seconds
- [x] ✅ Login is blocked when portal is offline/maintenance
- [x] ✅ Appropriate error messages display
- [x] ✅ All four status states work (online/offline/maintenance/scheduled)
- [x] ✅ Visual indicators match the design (colors, icons, animations)

---

## 🐛 Troubleshooting

### Problem: Backend won't start

**Solutions**:

1. Check PostgreSQL is running
2. Run `npm install` in `backend/core-api`
3. Check port 3001 is not in use: `lsof -i :3001`
4. Delete `node_modules` and reinstall

---

### Problem: Migration fails

**Solutions**:

1. Delete `prisma/dev.db` and `prisma/migrations` folder
2. Run `npx prisma migrate reset`
3. Run `npx prisma migrate dev --name add_portal_status` again

---

### Problem: Frontend shows "Checking portal status..." forever

**Solutions**:

1. Open browser DevTools → Network tab
2. Look for failed request to `/api/portal/health`
3. Check error message
4. Verify backend is running
5. Verify `NEXT_PUBLIC_PORTAL_HEALTH_URL` is correct
6. Check CORS configuration in backend

---

### Problem: Status doesn't update

**Solutions**:

1. Check browser console for errors
2. Verify polling is working (check Network tab)
3. Hard refresh browser (Cmd+Shift+R)
4. Check backend logs
5. Verify database has latest status

---

### Problem: Login works even when portal is offline

**Solutions**:

1. Check `portalStatus` state is being updated
2. Verify `setPortalStatus` callback is firing
3. Check form submission logic
4. Look for JavaScript errors in console

---

## 📚 Documentation References

- **Full Implementation Guide**: `/docs/PORTAL_HEALTH_CHECK_GUIDE.md`
- **Architecture Plan**: `/docs/FRONTEND_SPLIT_PLAN.md`
- **Summary**: `/docs/IMPLEMENTATION_SUMMARY.md`
- **API Routes**: `/backend/core-api/src/routes/portal.ts`
- **Component**: `/New_Frontend/components/portal/PortalStatusIndicator.tsx`

---

## 🎨 Visual Reference

Check the generated mockup image to see what the portal status indicators should look like:

- `portal_status_indicator.png` in artifacts

---

## ⏱️ Time Estimate

- Database setup: ~5 minutes
- Backend start: ~2 minutes  
- Frontend setup: ~3 minutes
- Testing: ~5-10 minutes
- **Total: ~15-20 minutes**

---

## 🚀 Next Phase: Frontend Split

Once everything is working:

1. **Corporate Website** (Cloud deployment)
   - Will include login page with health check
   - Always accessible
   - Points to remote portal

2. **E-Banking Portal** (Local Docker)
   - All banking functionality
   - Controlled by admin
   - Can be turned on/off

See `/docs/FRONTEND_SPLIT_PLAN.md` for details.

---

## ✨ You're Done

If all checkboxes are ticked, your portal health check system is fully operational! 🎉

The admin can now control portal availability, and users will see real-time status on the login page.

**Questions?** Review the detailed guides in `/docs/` directory.

---

**Last Updated**: 2026-01-15
**Estimated Time to Complete**: 15-20 minutes
