# 🚀 AURUM VAULT - Quick Start Guide (Post-Detachment)

## Overview

AURUM VAULT now consists of **3 separate applications**:

1. **Backend API** (Port 3001)
2. **Corporate Website** (Port 3002)
3. **E-Banking Portal** (Port 4000)

---

## ⚡ Quick Start (All Services)

### Option 1: Manual Start (Recommended for Development)

**Terminal 1 - Backend API**:

```bash
cd backend/core-api
npm run dev
```

✅ Running on: <http://localhost:3001>

**Terminal 2 - Corporate Website**:

```bash
cd corporate-website
npm run dev
```

✅ Running on: <http://localhost:3002>

**Terminal 3 - E-Banking Portal**:

```bash
cd e-banking-portal
npm run dev
```

✅ Running on: <http://localhost:4000>

---

### Option 2: Docker (E-Banking Portal Only)

**Terminal 1 - Backend API**:

```bash
cd backend/core-api
npm run dev
```

**Terminal 2 - Corporate Website**:

```bash
cd corporate-website
npm run dev
```

**Terminal 3 - E-Banking Portal (Docker)**:

```bash
cd e-banking-portal
npm run docker:up
```

✅ Portal running in Docker on: <http://localhost:4000>

---

## 🌐 Access URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Corporate Website** | <http://localhost:3002> | Public pages, login |
| **E-Banking Portal** | <http://localhost:4000> | Banking dashboard |
| **Backend API** | <http://localhost:3001> | REST API |

---

## 🔄 User Flow

1. **Visit Corporate Website**: <http://localhost:3002>
2. **Click "Sign In"** or use E-Banking widget
3. **Login page checks portal status** (green = online)
4. **Enter credentials** and sign in
5. **Redirected to E-Banking Portal**: <http://localhost:4000/dashboard>
6. **Use banking features** (accounts, transfer, etc.)
7. **Logout** → Returns to corporate website

---

## 🧪 Testing the Setup

### 1. Test Corporate Website

```bash
# Visit in browser
open http://localhost:3002
```

**Expected**:

- ✅ Landing page with glassmorphism
- ✅ E-Banking widget in hero
- ✅ Product grid with 8 solutions
- ✅ Enhanced footer

### 2. Test Login Page

```bash
# Visit login page
open http://localhost:3002/login
```

**Expected**:

- ✅ Compact glassmorphic login card
- ✅ Portal status indicator (should show "online" if backend running)
- ✅ Account number and password fields
- ✅ "New User" info card below

### 3. Test E-Banking Portal

```bash
# Visit portal directly
open http://localhost:4000
```

**Expected**:

- ✅ Redirects to `/dashboard`
- ✅ Dashboard loads (may show mock data)
- ✅ All navigation links work
- ✅ Glassmorphism effects visible

---

## 🛑 Stopping Services

### Stop Development Servers

Press `Ctrl + C` in each terminal

### Stop Docker Container

```bash
cd e-banking-portal
npm run docker:down
```

---

## 🔧 Common Commands

### Corporate Website

```bash
cd corporate-website

# Development
npm run dev          # Start dev server (port 3002)

# Production
npm run build        # Build for production
npm run start        # Start production server
```

### E-Banking Portal

```bash
cd e-banking-portal

# Development
npm run dev          # Start dev server (port 4000)

# Docker
npm run docker:build # Build Docker image
npm run docker:up    # Start Docker container
npm run docker:down  # Stop Docker container

# Production
npm run build        # Build for production
npm run start        # Start production server
```

### Backend API

```bash
cd backend/core-api

# Development
npm run dev          # Start dev server (port 3001)
```

---

## 📊 Port Summary

```
┌─────────────────────────────────────────────┐
│  AURUM VAULT Application Ports              │
├─────────────────────────────────────────────┤
│  3001  →  Backend API                       │
│  3002  →  Corporate Website                 │
│  4000  →  E-Banking Portal                  │
└─────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: "Port already in use"

**Solution**:

```bash
# Find and kill process on port
lsof -ti:3002 | xargs kill -9  # Corporate
lsof -ti:4000 | xargs kill -9  # Portal
lsof -ti:3001 | xargs kill -9  # Backend
```

### Issue: "Cannot connect to backend"

**Solution**:

1. Ensure backend is running on port 3001
2. Check `.env.local` files have correct `NEXT_PUBLIC_API_URL`
3. Verify CORS is configured in backend

### Issue: "Portal status shows offline"

**Solution**:

1. Ensure backend is running
2. Check health endpoint: <http://localhost:3001/api/portal/health>
3. Verify `NEXT_PUBLIC_PORTAL_HEALTH_URL` in corporate website `.env.local`

### Issue: "Login doesn't redirect to portal"

**Solution**:

1. Check `NEXT_PUBLIC_PORTAL_URL` in corporate website `.env.local`
2. Ensure portal is running on port 4000
3. Verify authentication logic in login page

---

## 📁 Project Structure Quick Reference

```
AutumVault/
├── backend/core-api/          # Port 3001
├── corporate-website/         # Port 3002 (NEW)
├── e-banking-portal/          # Port 4000 (NEW)
└── New_Frontend/              # Original (backup)
```

---

## ✅ Verification Checklist

Before considering the setup complete, verify:

- [ ] Backend API responds at <http://localhost:3001>
- [ ] Corporate website loads at <http://localhost:3002>
- [ ] E-Banking portal loads at <http://localhost:4000>
- [ ] Login page shows portal status indicator
- [ ] Portal status shows "online" (green dot)
- [ ] Can navigate all corporate pages
- [ ] Can navigate all portal pages
- [ ] Glassmorphism effects visible on all cards
- [ ] No console errors in browser
- [ ] All images load correctly

---

## 🎯 Next Steps

1. ✅ **Test the setup** using this guide
2. ✅ **Verify all features** work correctly
3. 📝 **Document any issues** encountered
4. 🚀 **Prepare for deployment** (see DETACHMENT_COMPLETE.md)

---

**Ready to start?** Open 3 terminals and run the commands above! 🚀
