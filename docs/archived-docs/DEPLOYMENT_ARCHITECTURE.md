# AURUM VAULT Deployment Architecture Plan

## Deployment Strategy Overview

### Architecture Split

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET                                     │
└───────────────────┬─────────────────────────────────┬───────────────┘
                    │                                 │
                    │                                 │
        ┌───────────▼──────────┐          ┌──────────▼──────────┐
        │  Corporate Website   │          │   Local PC Server   │
        │  (Cloud Hosted)      │          │   (Docker)          │
        │  Port: 80/443        │          │   Exposed via       │
        │  - Next.js Static    │          │   ngrok/Cloudflare  │
        └──────────────────────┘          └──────────┬──────────┘
                                                     │
                    ┌────────────────────────────────┴────────────┐
                    │                                              │
        ┌───────────▼──────────┐              ┌──────────▼────────────┐
        │  Backend Services    │              │  Frontend Services    │
        │  (Docker Container)  │              │  (Docker Container)   │
        │                      │              │                       │
        │  - Core API (3001)   │◄─────────────┤  - E-Banking (4000)  │
        │  - PostgreSQL (5432) │              │  - Admin UI (3003)    │
        │  - Redis (6379)      │              │                       │
        └──────────────────────┘              └───────────────────────┘
```

## Deployment Components

### 1. Local PC Server (Docker Container)

**Hosts:**

- Backend Core API (Port 3001)
- E-Banking Portal (Port 4000)
- Admin Interface (Port 3003)
- PostgreSQL Database (Port 5432)
- Redis Cache (Port 6379)

**Exposed to Internet via:**

- ngrok (Development/Testing)
- Cloudflare Tunnel (Production)
- Custom Domain with SSL

### 2. Corporate Website (Cloud Hosted)

**Hosts:**

- Corporate Website (Static/SSR)
- Deployed on: Vercel/Netlify/AWS Amplify

**Connects to:**

- Backend API via public URL (<https://api.yourbank.com>)

## Internet Exposure Options

### Option 1: ngrok (Quick Setup - Development)

**Pros:**

- Easy setup (5 minutes)
- Free tier available
- Automatic HTTPS
- No port forwarding needed

**Cons:**

- URL changes on restart (free tier)
- Limited bandwidth
- Not recommended for production

**Setup:**

```bash
# Install ngrok
brew install ngrok

# Authenticate
ngrok config add-authtoken YOUR_TOKEN

# Expose backend API
ngrok http 3001 --subdomain=aurumvault-api

# Expose e-banking portal
ngrok http 4000 --subdomain=aurumvault-portal

# Expose admin interface
ngrok http 3003 --subdomain=aurumvault-admin
```

### Option 2: Cloudflare Tunnel (Recommended - Production)

**Pros:**

- Free
- Custom domain support
- Automatic HTTPS
- DDoS protection
- No port forwarding needed
- Persistent URLs

**Cons:**

- Requires Cloudflare account
- DNS setup required

**Setup:**

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Login
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create aurumvault

# Configure tunnel (see cloudflare-tunnel.yml below)

# Run tunnel
cloudflared tunnel run aurumvault
```

### Option 3: Port Forwarding + Dynamic DNS (Traditional)

**Pros:**

- Full control
- No third-party dependencies
- Custom domain

**Cons:**

- Requires router configuration
- Security concerns
- Need static IP or DDNS
- Manual SSL setup

**Setup:**

1. Configure router port forwarding
2. Setup Dynamic DNS (No-IP, DuckDNS)
3. Configure SSL with Let's Encrypt
4. Setup reverse proxy (Nginx)

## Recommended Architecture

### Production Setup with Cloudflare Tunnel

```
Internet
   │
   ├─→ https://www.aurumvault.com (Corporate Website - Vercel)
   │
   └─→ https://api.aurumvault.com (Backend API - Local PC via Cloudflare)
       │
       ├─→ https://portal.aurumvault.com (E-Banking - Local PC via Cloudflare)
       │
       └─→ https://admin.aurumvault.com (Admin UI - Local PC via Cloudflare)
```

## Docker Configuration for Local PC

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: aurumvault-db-prod
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: aurumvault
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - aurumvault-network
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: aurumvault-redis-prod
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - aurumvault-network
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend Core API
  backend:
    build:
      context: ./backend/core-api
      dockerfile: Dockerfile.prod
    container_name: aurumvault-api-prod
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/aurumvault
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - aurumvault-network
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # E-Banking Portal
  portal:
    build:
      context: ./e-banking-portal
      dockerfile: Dockerfile.prod
    container_name: aurumvault-portal-prod
    environment:
      - NEXT_PUBLIC_API_URL=${PUBLIC_API_URL}
      - NEXT_PUBLIC_CORPORATE_URL=${CORPORATE_URL}
    ports:
      - "4000:4000"
    depends_on:
      - backend
    networks:
      - aurumvault-network
    restart: always

  # Admin Interface
  admin:
    build:
      context: ./admin-interface
      dockerfile: Dockerfile.prod
    container_name: aurumvault-admin-prod
    environment:
      - API_URL=http://backend:3001
      - PORT=3003
      - SESSION_SECRET=${SESSION_SECRET}
    ports:
      - "3003:3003"
    depends_on:
      - backend
    networks:
      - aurumvault-network
    restart: always

  # Cloudflare Tunnel (Optional)
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: aurumvault-tunnel
    command: tunnel --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - aurumvault-network
    restart: always

volumes:
  postgres_data:
  redis_data:

networks:
  aurumvault-network:
    driver: bridge
```

## Security Considerations

### 1. Environment Variables (.env.production)

```env
# Database
DB_USER=aurumvault_prod
DB_PASSWORD=STRONG_RANDOM_PASSWORD_HERE
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/aurumvault

# Redis
REDIS_PASSWORD=STRONG_RANDOM_PASSWORD_HERE

# JWT Secrets (Generate with: openssl rand -base64 64)
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_MIN_64_CHARS
JWT_REFRESH_SECRET=YOUR_SUPER_SECRET_REFRESH_KEY_MIN_64_CHARS
ADMIN_JWT_SECRET=YOUR_SUPER_SECRET_ADMIN_JWT_KEY_MIN_64_CHARS

# Session
SESSION_SECRET=YOUR_SUPER_SECRET_SESSION_KEY_MIN_64_CHARS

# URLs
PUBLIC_API_URL=https://api.aurumvault.com
CORPORATE_URL=https://www.aurumvault.com
PORTAL_URL=https://portal.aurumvault.com
ADMIN_URL=https://admin.aurumvault.com

# CORS
CORS_ORIGINS=https://www.aurumvault.com,https://portal.aurumvault.com,https://admin.aurumvault.com

# Cloudflare
CLOUDFLARE_TUNNEL_TOKEN=YOUR_TUNNEL_TOKEN
```

### 2. Firewall Rules

```bash
# Only allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Block direct access to application ports (handled by Cloudflare)
# Ports 3001, 3003, 4000 should NOT be exposed directly
```

### 3. SSL/TLS Configuration

Cloudflare Tunnel provides automatic SSL. For custom setup:

```bash
# Install certbot
sudo apt-get install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d api.aurumvault.com
sudo certbot certonly --standalone -d portal.aurumvault.com
sudo certbot certonly --standalone -d admin.aurumvault.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Admin Portal Status Management

The admin interface will have full control over portal status:

### Features

1. **Real-time Status Control**
   - Set portal: Online, Offline, Maintenance, Scheduled Downtime
   - Immediate effect on login page

2. **Scheduled Maintenance**
   - Schedule future maintenance windows
   - Automatic status changes
   - Email notifications to users

3. **Status History & Audit Log**
   - Track all status changes
   - Who changed it, when, and why
   - IP address logging

4. **User Notifications**
   - Display custom messages on login page
   - Estimated downtime duration
   - Contact information

## Deployment Workflow

### Initial Setup

```bash
# 1. Clone repository on local PC
git clone <repo-url>
cd AutumVault

# 2. Create production environment file
cp .env.example .env.production
# Edit .env.production with production values

# 3. Build Docker images
docker-compose -f docker-compose.prod.yml build

# 4. Initialize database
docker-compose -f docker-compose.prod.yml run backend npm run prisma:migrate:prod
docker-compose -f docker-compose.prod.yml run backend npm run prisma:seed

# 5. Start all services
docker-compose -f docker-compose.prod.yml up -d

# 6. Setup Cloudflare Tunnel (see below)
```

### Cloudflare Tunnel Configuration

Create `cloudflare-tunnel.yml`:

```yaml
tunnel: aurumvault
credentials-file: /root/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  # Backend API
  - hostname: api.aurumvault.com
    service: http://backend:3001
    originRequest:
      noTLSVerify: true
  
  # E-Banking Portal
  - hostname: portal.aurumvault.com
    service: http://portal:4000
    originRequest:
      noTLSVerify: true
  
  # Admin Interface
  - hostname: admin.aurumvault.com
    service: http://admin:3003
    originRequest:
      noTLSVerify: true
  
  # Catch-all rule
  - service: http_status:404
```

### Continuous Deployment

```bash
# Update script (deploy.sh)
#!/bin/bash
set -e

echo "🚀 Deploying AURUM VAULT..."

# Pull latest changes
git pull origin main

# Rebuild images
docker-compose -f docker-compose.prod.yml build

# Run migrations
docker-compose -f docker-compose.prod.yml run backend npm run prisma:migrate:prod

# Restart services with zero downtime
docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend
docker-compose -f docker-compose.prod.yml up -d --no-deps --build portal
docker-compose -f docker-compose.prod.yml up -d --no-deps --build admin

echo "✅ Deployment complete!"
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f portal
docker-compose -f docker-compose.prod.yml logs -f admin

# Check backend health
curl https://api.aurumvault.com/health
```

### Backup Strategy

```bash
# Database backup script (backup.sh)
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

docker exec aurumvault-db-prod pg_dump -U aurumvault_prod aurumvault > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +30 -delete

echo "✅ Backup completed: db_backup_$DATE.sql"
```

### Auto-restart on PC Reboot

```bash
# Add to crontab
crontab -e

# Add this line:
@reboot cd /path/to/AutumVault && docker-compose -f docker-compose.prod.yml up -d
```

## Corporate Website Configuration

### Environment Variables for Corporate Website

```env
# .env.production (for Vercel/Netlify)
NEXT_PUBLIC_API_URL=https://api.aurumvault.com
NEXT_PUBLIC_PORTAL_URL=https://portal.aurumvault.com
NEXT_PUBLIC_PORTAL_HEALTH_URL=https://api.aurumvault.com/api/portal/health
```

### Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd corporate-website
vercel --prod
```

## Testing the Setup

### 1. Test Backend API

```bash
curl https://api.aurumvault.com/health
```

### 2. Test Portal Status

```bash
curl https://api.aurumvault.com/api/portal/health
```

### 3. Test Corporate Website

```bash
curl https://www.aurumvault.com
```

### 4. Test Admin Access

```bash
curl https://admin.aurumvault.com
```

### 5. Test E-Banking Portal

```bash
curl https://portal.aurumvault.com
```

## Disaster Recovery

### Full System Restore

```bash
# 1. Restore database
docker exec -i aurumvault-db-prod psql -U aurumvault_prod aurumvault < backup.sql

# 2. Restart all services
docker-compose -f docker-compose.prod.yml restart

# 3. Verify health
curl https://api.aurumvault.com/health
```

## Cost Estimation

### Local PC Server

- **Hardware**: Existing PC (no cost)
- **Electricity**: ~$10-20/month
- **Internet**: Existing connection

### Cloud Services

- **Cloudflare Tunnel**: Free
- **Domain**: ~$12/year
- **Corporate Website (Vercel)**: Free tier or ~$20/month
- **Total**: ~$30-50/month

## Next Steps

1. ✅ Set up local PC with Docker
2. ✅ Configure production environment variables
3. ✅ Build and test Docker containers
4. ✅ Set up Cloudflare Tunnel
5. ✅ Configure DNS records
6. ✅ Deploy corporate website to Vercel
7. ✅ Implement admin portal status UI
8. ✅ Test complete integration
9. ✅ Set up monitoring and backups
10. ✅ Document runbooks

---

**Last Updated**: 2026-01-17
**Version**: 2.0.0
