# AURUM VAULT - Environment Variables Reference

This document provides a comprehensive reference for all environment variables used across the AURUM VAULT services.

## global (.env)

These are the root-level variables often passed to Docker Compose or shared.

| Variable | Description | Default / Example | Required |
|----------|-------------|-------------------|----------|
| `DATABASE_URL` | Connection string for PostgreSQL database. | `postgresql://postgres:password@localhost:5432/aurumvault` | Yes |
| `JWT_SECRET` | Secret key for signing Access Tokens. | (Generated Random) | Yes |
| `JWT_REFRESH_SECRET` | Secret key for signing Refresh Tokens. | (Generated Random) | Yes |
| `ADMIN_JWT_SECRET` | Secret key for signing Admin Access Tokens. | (Generated Random) | Yes |
| `SESSION_SECRET` | Secret key for signing Admin Sessions. | (Generated Random) | Yes |
| `REDIS_URL` | URL for Redis instance. | `redis://localhost:6379` | Yes |
| `BACKEND_API_URL` | Public URL of the Backend API. | `http://localhost:3001` or `3101` (Docker) | Yes |
| `CORPORATE_URL` | Public URL of Corporate Website. | `http://localhost:3002` | Yes |
| `PORTAL_URL` | Public URL of E-Banking Portal. | `http://localhost:4000` | Yes |
| `ADMIN_URL` | Public URL of Admin Interface. | `http://localhost:3003` | Yes |

## Backend Core API (`backend/core-api/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Local port for the service. | `3001` |
| `HOST` | Host binding. | `0.0.0.0` |
| `NODE_ENV` | Environment mode. | `development` |
| `DATABASE_URL` | Postgres Connection String. | `postgresql://...` |
| `REDIS_URL` | Redis Connection String. | `redis://...` |
| `CORS_ORIGINS` | Comma-separated allowed origins. | `http://localhost:3000,...` |
| `JWT_*` | JWT Configuration (see Global). | |
| `SMTP_*` | Email Configuration (Optional). | |
| `DEFAULT_PORTAL_STATUS` | Initial portal status. | `online` |

## Corporate Website (`corporate-website/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL of the Backend API (Client-side). | `http://localhost:3101` |
| `NEXT_PUBLIC_PORTAL_URL` | URL of the E-Banking Portal. | `http://localhost:4000` |
| `NEXT_PUBLIC_PORTAL_HEALTH_URL` | URL for health check widget. | `http://localhost:3101/api/portal/health` |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL of this site. | `http://localhost:3002` |
| `NEXT_PUBLIC_ENABLE_REGISTRATION`| Feature flag: Registration. | `true` |

## E-Banking Portal (`e-banking-portal/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL of the Backend API. | `http://localhost:3101` |
| `NEXT_PUBLIC_CORPORATE_URL` | URL of Corporate Website (for logout).| `http://localhost:3002` |
| `NEXT_PUBLIC_SESSION_TIMEOUT` | Session timeout in ms. | `900000` (15m) |
| `NEXT_PUBLIC_TOKEN_REFRESH_INTERVAL` | Refresh check interval. | `840000` (14m) |

## Admin Interface (`admin-interface/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | URL of the Backend API (Server-side). | `http://localhost:3001` |
| `SESSION_SECRET` | Secret for express-session. | (Secure Random) |
| `ADMIN_EMAIL` | Default admin email. | `admin@aurumvault.com` |
| `DATABASE_URL` | Postgres Connection String. | `postgresql://...` |

## Docker Compose

When running via Docker Compose, ports are mapped externally:

- **Backend**: `3101` (Host) -> `3001` (Container)
- **Corporate**: `3102` (Host) -> `3002` (Container)
- **Admin**: `3103` (Host) -> `3003` (Container)
- **Portal**: `4100` (Host) -> `4000` (Container)

Internal communication uses service names (e.g., `http://backend:3001`).
