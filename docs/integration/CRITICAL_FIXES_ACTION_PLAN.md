# AURUM VAULT - Critical Issues Fix Plan

**Created**: 2026-01-17  
**Status**: 🔴 URGENT ACTION REQUIRED  
**Estimated Time**: 2-3 hours

---

## 🚨 CRITICAL FIXES (Do Immediately)

### Fix #1: Install Missing Axios Dependency

**Time**: 2 minutes  
**Commands**:

```bash
# E-Banking Portal
cd e-banking-portal
npm install axios
npm run build  # Verify fix

# Corporate Website
cd ../corporate-website
npm install axios
npm run build  # Verify fix
```

**Verification**:

- [ ] e-banking-portal builds successfully
- [ ] corporate-website builds successfully

---

### Fix #2: Fix TypeScript Error in Cards Route

**Time**: 5 minutes  
**File**: `backend/core-api/src/routes/cards.ts`

**Change** (line 156):

```typescript
// BEFORE (BROKEN):
await prisma.card.update({
  where: { id: cardId },
  data: updateData,  // ❌ Type error
});

// AFTER (FIXED):
await prisma.card.update({
  where: { id: cardId },
  data: {
    ...(dailyLimit !== undefined && { dailyLimit }),
    ...(monthlyLimit !== undefined && { monthlyLimit }),
  },
});
```

**Verification**:

```bash
cd backend/core-api
npm run type-check  # Should pass
```

---

### Fix #3: Create Prisma Migrations

**Time**: 5 minutes  
**Commands**:

```bash
cd backend/core-api

# Generate initial migration
npx prisma migrate dev --name init

# This creates: prisma/migrations/XXXXXX_init/migration.sql
```

**Verification**:

- [ ] Migration file created in `prisma/migrations/`
- [ ] Database schema matches Prisma schema

---

### Fix #4: Standardize Database Configuration

**Time**: 10 minutes  
**Decision**: Use PostgreSQL for consistency

**Option A: Keep SQLite for Dev (Quick)**

```bash
# No changes needed for local dev
# Just document the difference
```

**Option B: Switch to PostgreSQL (Recommended)**

```bash
# 1. Start PostgreSQL with Docker
docker run -d \
  --name aurumvault-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=aurumvault \
  -p 5432:5432 \
  postgres:15-alpine

# 2. Update backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/aurumvault"

# 3. Update admin-interface/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/aurumvault"

# 4. Run migrations
cd backend/core-api
npx prisma migrate deploy
npx prisma generate

# 5. Update admin-interface
cd ../../admin-interface
npx prisma generate
```

**Verification**:

- [ ] Backend connects to PostgreSQL
- [ ] Admin interface connects to PostgreSQL
- [ ] Migrations applied successfully

---

### Fix #5: Configure JWT Secrets for Docker

**Time**: 5 minutes  
**File**: Create root `.env`

```bash
# Create root .env file
cat > .env << 'EOF'
# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-me
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-change-me
ADMIN_JWT_SECRET=your-super-secret-admin-jwt-key-min-32-chars-change-me
SESSION_SECRET=your-super-secret-session-key-min-32-chars-change-me
EOF
```

**Generate Secure Secrets** (Production):

```bash
# Generate random secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('ADMIN_JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Verification**:

- [ ] Root `.env` file created
- [ ] Secrets are unique and secure
- [ ] Docker compose can read variables

---

## 🟠 HIGH PRIORITY FIXES (Do Next)

### Fix #6: Update CORS Configuration

**Time**: 3 minutes  
**File**: `backend/core-api/.env`

```env
# Development
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:4000"
```

**Verification**:

- [ ] All frontend services can call backend
- [ ] No CORS errors in browser console

---

### Fix #7: Add Health Checks to Docker Compose

**Time**: 5 minutes  
**File**: `docker-compose.yml`

**Add to backend service**:

```yaml
backend:
  # ... existing config ...
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

**Add to other services**:

```yaml
corporate:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3002"]
    interval: 30s
    timeout: 10s
    retries: 3

portal:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:4000"]
    interval: 30s
    timeout: 10s
    retries: 3

admin:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3003"]
    interval: 30s
    timeout: 10s
    retries: 3
```

---

### Fix #8: Generate Secure Session Secret

**Time**: 2 minutes  
**File**: `admin-interface/.env`

```bash
# Generate secure secret
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Update .env
sed -i '' "s/SESSION_SECRET=.*/SESSION_SECRET=$NEW_SECRET/" admin-interface/.env
```

**Verification**:

- [ ] Session secret is 64 characters (32 bytes hex)
- [ ] Not a default value

---

### Fix #9: Handle Docker Init SQL

**Time**: 5 minutes  
**Option A**: Remove init.sql reference (use Prisma migrations)

**File**: `docker-compose.yml`

```yaml
postgres:
  # ... existing config ...
  volumes:
    - postgres_data:/var/lib/postgresql/data
    # REMOVE: - ./backend/core-api/prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
```

**Option B**: Create init.sql

```sql
-- backend/core-api/prisma/init.sql
-- This file is auto-generated from Prisma migrations
-- Run: npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/init.sql
```

**Recommendation**: Use Option A (Prisma migrations)

---

### Fix #10: Clean Up Obsolete Environment Files

**Time**: 3 minutes  
**Commands**:

```bash
# Archive obsolete files
mkdir -p .archive
mv .env.example .archive/.env.example.old
mv .env.local .archive/.env.local.old

# Create new root .env.example
cat > .env.example << 'EOF'
# AURUM VAULT - Root Environment Variables
# Copy to .env and fill in actual values

# Service URLs (Development)
BACKEND_API_URL=http://localhost:3001
CORPORATE_URL=http://localhost:3002
ADMIN_URL=http://localhost:3003
PORTAL_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/aurumvault

# JWT Secrets (GENERATE NEW ONES FOR PRODUCTION!)
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
ADMIN_JWT_SECRET=your-admin-secret-min-32-chars
SESSION_SECRET=your-session-secret-min-32-chars

# Redis
REDIS_URL=redis://localhost:6379

# Email (Optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EOF
```

---

## 🟡 MEDIUM PRIORITY FIXES (Do Soon)

### Fix #11: Add Engines to Package.json

**Time**: 5 minutes  
**Files**: All `package.json` files

**Add to each**:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

**Create .nvmrc** (root):

```bash
echo "18.19.0" > .nvmrc
```

---

### Fix #12: Fix Docker Port Conflicts

**Time**: 5 minutes  
**File**: `docker-compose.yml`

**Change port mappings**:

```yaml
backend:
  ports:
    - "3101:3001"  # External:Internal

corporate:
  ports:
    - "3102:3002"

admin:
  ports:
    - "3103:3003"

portal:
  ports:
    - "4100:4000"
```

**Update frontend .env files** to use Docker ports when needed.

---

### Fix #13: Document Environment Variables

**Time**: 15 minutes  
**File**: Create `docs/ENVIRONMENT_VARIABLES.md`

(See separate documentation file)

---

### Fix #14: Verify Gitignore

**Time**: 3 minutes  
**File**: `.gitignore`

**Ensure includes**:

```gitignore
# Environment files
.env
.env.local
.env.*.local
!.env.example

# Database
*.db
*.db-journal
*.db-shm
*.db-wal
prisma/dev.db*

# Logs
logs/
*.log
npm-debug.log*

# Uploads
uploads/
temp/

# Build
dist/
build/
.next/
out/

# Dependencies
node_modules/

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store
```

---

### Fix #15: Create Backup Strategy

**Time**: 30 minutes  
**File**: Create `scripts/backup-database.sh`

```bash
#!/bin/bash
# Database backup script

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="aurumvault"

mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -U postgres -h localhost $DB_NAME > "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# Compress
gzip "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${DB_NAME}_${TIMESTAMP}.sql.gz"
```

---

## 📋 Execution Checklist

### Phase 1: Critical Fixes (30 minutes)

- [ ] Install axios in frontend projects
- [ ] Fix TypeScript error in cards.ts
- [ ] Create Prisma migrations
- [ ] Decide on database strategy
- [ ] Configure JWT secrets

### Phase 2: High Priority (30 minutes)

- [ ] Update CORS configuration
- [ ] Add Docker health checks
- [ ] Generate secure session secret
- [ ] Handle init.sql
- [ ] Clean up obsolete files

### Phase 3: Medium Priority (60 minutes)

- [ ] Add engines to package.json
- [ ] Fix Docker port conflicts
- [ ] Document environment variables
- [ ] Verify gitignore
- [ ] Create backup strategy

### Phase 4: Verification (30 minutes)

- [ ] All services build successfully
- [ ] Type checks pass
- [ ] Docker compose works
- [ ] Integration tests pass
- [ ] Security audit clean

---

## 🎯 Success Criteria

### Build Success

```bash
✅ backend/core-api: npm run build
✅ e-banking-portal: npm run build
✅ corporate-website: npm run build
✅ admin-interface: npm run build
```

### Type Check Success

```bash
✅ backend/core-api: npm run type-check
✅ admin-interface: npm run type-check
```

### Docker Success

```bash
✅ docker-compose up -d
✅ All services healthy
✅ No port conflicts
```

### Integration Success

```bash
✅ Corporate → Backend (login works)
✅ Portal → Backend (transactions work)
✅ Admin → Backend (user management works)
```

---

## 📞 Support

If issues persist after fixes:

1. Check logs: `docker-compose logs [service]`
2. Verify environment: `docker-compose config`
3. Test connectivity: `curl http://localhost:3001/health`
4. Review audit report: `docs/integration/SYSTEM_INTEGRATION_AUDIT.md`

---

**Last Updated**: 2026-01-17  
**Status**: Ready for execution  
**Estimated Total Time**: 2-3 hours
