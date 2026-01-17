# AURUM VAULT Quick Start Guide

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v15 or higher)
- **Redis** (v7 or higher)
- **Docker & Docker Compose** (optional, for containerized setup)

## Quick Start (Development)

### Option 1: Automated Setup (Recommended)

1. **Make the startup script executable:**

   ```bash
   chmod +x scripts/dev-all.sh
   ```

2. **Run the startup script:**

   ```bash
   ./scripts/dev-all.sh
   ```

   This will:
   - Check and start PostgreSQL and Redis
   - Install dependencies for all services
   - Run database migrations
   - Start all four services
   - Display service URLs and credentials

3. **Access the applications:**
   - Corporate Website: <http://localhost:3002>
   - Admin Interface: <http://localhost:3003>
   - E-Banking Portal: <http://localhost:4000>
   - API Backend: <http://localhost:3001>

4. **Stop all services:**
   - Press `Ctrl+C` in the terminal running the script

### Option 2: Manual Setup

#### Step 1: Start Infrastructure Services

**Using Docker:**

```bash
docker-compose up -d postgres redis
```

**Or install locally:**

- PostgreSQL: <https://www.postgresql.org/download/>
- Redis: <https://redis.io/download>

#### Step 2: Setup Backend

```bash
cd backend/core-api

# Install dependencies
npm install

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start backend
npm run dev
```

Backend will run on <http://localhost:3001>

#### Step 3: Start Corporate Website

```bash
# In a new terminal
cd corporate-website

# Install dependencies
npm install

# Start development server
npm run dev
```

Corporate Website will run on <http://localhost:3002>

#### Step 4: Start Admin Interface

```bash
# In a new terminal
cd admin-interface

# Install dependencies
npm install

# Start development server
npm run dev
```

Admin Interface will run on <http://localhost:3003>

#### Step 5: Start E-Banking Portal

```bash
# In a new terminal
cd e-banking-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

E-Banking Portal will run on <http://localhost:4000>

## Default Credentials

### Admin Access

- **URL**: <http://localhost:3003>
- **Email**: <admin@aurumvault.com>
- **Password**: Admin@123456

### Test Customer Account

- **URL**: <http://localhost:3002/login>
- **Account Number**: 1234567890
- **Password**: User@123456

## Environment Variables

All necessary environment files have been created:

- `backend/core-api/.env`
- `corporate-website/.env.local`
- `e-banking-portal/.env.local`
- `admin-interface/.env`

**⚠️ Important**: Change all secrets and passwords before deploying to production!

## Verifying the Setup

### 1. Check Backend Health

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected"
}
```

### 2. Check Portal Status

```bash
curl http://localhost:3001/api/portal/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "online",
    "timestamp": "2026-01-17T05:00:00.000Z"
  }
}
```

### 3. Test Corporate Website

Open <http://localhost:3002> in your browser

### 4. Test Admin Interface

Open <http://localhost:3003> in your browser

### 5. Test E-Banking Portal

Open <http://localhost:4000> in your browser

## Common Issues & Solutions

### Port Already in Use

If you see "Port already in use" errors:

```bash
# Find process using port (e.g., 3001)
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3001)
```

### Database Connection Failed

1. Ensure PostgreSQL is running:

   ```bash
   pg_isready -h localhost -p 5432
   ```

2. Check database exists:

   ```bash
   psql -U postgres -l
   ```

3. Recreate database if needed:

   ```bash
   cd backend/core-api
   npm run prisma:reset
   ```

### Redis Connection Failed

1. Check Redis is running:

   ```bash
   redis-cli ping
   ```

2. Start Redis if needed:

   ```bash
   docker-compose up -d redis
   # or
   redis-server
   ```

### Module Not Found Errors

```bash
# Clean install in the affected service
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Not Generated

```bash
cd backend/core-api
npm run prisma:generate
```

## Development Workflow

### Making Changes to Backend

1. Edit files in `backend/core-api/src/`
2. Server auto-restarts (using tsx watch)
3. Test changes at <http://localhost:3001>

### Making Changes to Frontend

1. Edit files in respective frontend directory
2. Next.js auto-reloads
3. See changes immediately in browser

### Database Schema Changes

1. Edit `backend/core-api/prisma/schema.prisma`
2. Create migration:

   ```bash
   cd backend/core-api
   npm run prisma:migrate
   ```

3. Restart backend

## Testing the Integration

### 1. User Registration Flow

1. Go to <http://localhost:3002>
2. Click "Open an Account"
3. Fill in registration form
4. Submit

### 2. Login Flow

1. Go to <http://localhost:3002/login>
2. Check portal status indicator (should be green/online)
3. Enter credentials
4. Should redirect to <http://localhost:4000/dashboard>

### 3. Admin Portal Control

1. Go to <http://localhost:3003>
2. Login with admin credentials
3. Navigate to Portal Status
4. Change status to "maintenance"
5. Verify login page shows maintenance message

### 4. Banking Operations

1. Login to portal (<http://localhost:4000>)
2. View accounts
3. Make a transfer
4. Check transaction history
5. Manage cards
6. Pay bills

## Logs

All services log to the `logs/` directory:

```bash
# View backend logs
tail -f logs/backend.log

# View corporate website logs
tail -f logs/corporate.log

# View admin interface logs
tail -f logs/admin.log

# View portal logs
tail -f logs/portal.log
```

## Database Management

### Access Prisma Studio

```bash
cd backend/core-api
npm run prisma:studio
```

Opens at <http://localhost:5555>

### Reset Database

```bash
cd backend/core-api
npm run prisma:reset
```

⚠️ This will delete all data!

### Seed Database

```bash
cd backend/core-api
npm run prisma:seed
```

## Production Deployment

See `docs/SYSTEM_INTEGRATION_PLAN.md` for detailed production deployment instructions.

### Quick Production Build

```bash
# Build all services
cd backend/core-api && npm run build
cd ../../corporate-website && npm run build
cd ../e-banking-portal && npm run build
cd ../admin-interface && npm run build

# Start in production mode
cd backend/core-api && npm start
cd ../../corporate-website && npm start
cd ../e-banking-portal && npm start
cd ../admin-interface && npm start
```

## Docker Deployment

### Development with Docker

```bash
# Start only infrastructure
docker-compose up -d postgres redis

# Or start everything
docker-compose up -d
```

### Production with Docker

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Next Steps

1. ✅ Verify all services are running
2. ✅ Test user registration and login
3. ✅ Test admin portal control
4. ✅ Test banking operations
5. 📝 Customize branding and content
6. 🔒 Update security settings
7. 📧 Configure email service
8. 🧪 Write integration tests
9. 📊 Set up monitoring
10. 🚀 Deploy to staging

## Support

For issues or questions:

1. Check `docs/SYSTEM_INTEGRATION_PLAN.md`
2. Review logs in `logs/` directory
3. Check service health endpoints
4. Verify environment variables

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│  Corporate Site │────▶│  E-Banking      │
│  Port: 3002     │     │  Portal: 4000   │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Core API Backend    │
         │   Port: 3001          │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌────────────────┐      ┌────────────────┐
│ Admin Interface│      │   PostgreSQL   │
│ Port: 3003     │      │   Port: 5432   │
└────────────────┘      └────────────────┘
```

---

**Happy Banking! 🏦**
