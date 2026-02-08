# AURUM VAULT - Luxury Banking Platform

[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![Node Version](https://img.shields.io/badge/node-18.19.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

A modern, secure, and feature-rich banking platform built with cutting-edge technologies. AURUM VAULT provides a complete banking solution with separate interfaces for corporate website, customer e-banking portal, and administrative management.

## 🏗️ Architecture

### Hybrid Deployment Strategy

- **Corporate Website** → Deployed to Netlify (Public-facing)
- **Backend API** → Docker + ngrok tunnel (Secure API layer)
- **Admin Interface** → Docker + ngrok tunnel (Internal management)
- **E-Banking Portal** → Docker + ngrok tunnel (Customer portal)

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Corporate Website** | Next.js + React + Tailwind CSS | 14.2.35 |
| **E-Banking Portal** | Next.js + React + Tailwind CSS | 15.1.6 |
| **Backend API** | Fastify + TypeScript + Prisma | 4.24.3 |
| **Admin Interface** | Fastify + EJS + TypeScript | 4.24.3 |
| **Database** | PostgreSQL | 15 |
| **Cache** | Redis | 7 |
| **ORM** | Prisma | 5.7.1 |

## 🚀 Quick Start

### Prerequisites

- Node.js 18.19.0 or higher
- Docker Desktop
- ngrok account (for tunneling)
- Netlify account (for corporate website)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ajirohack/Aurum_Vault.git
cd Aurum_Vault

# Copy environment template
cp .env.example .env

# Generate secure secrets (run 4 times)
openssl rand -base64 32

# Edit .env and add your secrets
# - DB_PASSWORD
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - ADMIN_JWT_SECRET
# - SESSION_SECRET

# Configure ngrok
# Get auth token from: https://dashboard.ngrok.com
# Edit ngrok.yml and add your token
```

### Running Locally

```bash
# Start all services (Docker + ngrok)
./scripts/start-all.sh

# This will:
# 1. Start PostgreSQL, Redis, Backend, Admin, Portal
# 2. Start 3 ngrok tunnels
# 3. Display all service URLs
```

### Accessing Services

After startup, services will be available at:

```
Local URLs:
- Corporate Website: http://localhost:3000 (marketing site)
- Backend API:       http://localhost:3001
- Admin Interface:   http://localhost:3003
- E-Banking Portal:  http://localhost:4000 (login & dashboard)

Public URLs (ngrok):
- Backend API:      https://[random].ngrok.io
- Admin Interface:  https://[random].ngrok.io
- E-Banking Portal: https://[random].ngrok.io
```

### 🔐 Login Flow

**Important**: The login page has been moved to the E-Banking Portal as the main index page.

**User Journey**:

1. Visit corporate website (`http://localhost:3000`)
2. Click "Login" button → Redirects to E-Banking Portal (`http://localhost:4000`)
3. Login page appears as the portal's index page
4. After successful login → Dashboard (`http://localhost:4000/dashboard`)

**Service Unavailable**: If the backend is offline, users can visit `/unavailable` for status updates and contact information.

**Documentation**: See `/docs/QUICK_START_LOGIN.md` for detailed setup and testing instructions.

## 📁 Project Structure

```
AURUMVAULT/
├── backend/
│   ├── core-api/          # Main API service (Fastify + Prisma)
│   ├── shared/            # Shared utilities and types
│   └── database/          # Database scripts and seeds
├── admin-interface/       # Admin management UI (Fastify + EJS)
├── e-banking-portal/      # Customer portal (Next.js 15)
├── corporate-website/     # Public website (Next.js 14)
├── docs/
│   ├── deployment/        # Deployment documentation
│   ├── integration/       # Integration guides
│   └── testing/           # Testing documentation
├── scripts/               # Automation scripts
│   ├── start-all.sh       # Start all services
│   ├── stop-all.sh        # Stop all services
│   ├── start-ngrok.sh     # Start ngrok tunnels
│   └── get-ngrok-urls.sh  # Display tunnel URLs
├── docker-compose.yml     # Docker configuration
├── ngrok.yml              # ngrok configuration
└── .env.example           # Environment template
```

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt/argon2)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Security headers (Helmet)
- ✅ Audit logging
- ✅ Session management
- ✅ Input validation (Zod)

## 🌐 Deployment

### Corporate Website (Netlify)

```bash
cd corporate-website
npm install
npm run build
netlify deploy --prod
```

### Backend Services (Docker)

```bash
# Start all Docker services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### ngrok Tunnels

```bash
# Start tunnels
./scripts/start-ngrok.sh

# Get current URLs
./scripts/get-ngrok-urls.sh

# Stop tunnels
./scripts/stop-ngrok.sh
```

## 📊 Database Schema

The platform uses PostgreSQL with Prisma ORM. Key models include:

- **Users** - Customer accounts
- **Accounts** - Bank accounts
- **Transactions** - All transactions
- **Cards** - Debit/credit cards
- **WireTransfers** - International transfers
- **KycDocuments** - Identity verification
- **AdminUsers** - Admin authentication
- **AuditLogs** - Audit trail

## 🧪 Testing

```bash
# Run tests for all services
npm test

# Run tests for specific service
cd backend/core-api && npm test
cd admin-interface && npm test
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Quick Start Guide](./DEPLOYMENT_READY.md)** - Get started in 15 minutes
- **[Architecture Analysis](./docs/deployment/PHASE_1_ARCHITECTURE_ANALYSIS.md)** - Technical deep dive
- **[Service Dependencies](./docs/deployment/SERVICE_DEPENDENCY_MAP.md)** - Visual diagrams
- **[Quick Reference](./docs/deployment/QUICK_REFERENCE.md)** - Daily operations
- **[Deployment Guide](./docs/deployment/PHASE_2_SUMMARY.md)** - Docker & ngrok setup

## 🛠️ Development

### Backend API

```bash
cd backend/core-api
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Admin Interface

```bash
cd admin-interface
npm install
npx prisma generate
npm run dev
```

### E-Banking Portal

```bash
cd e-banking-portal
npm install
npm run dev
```

### Corporate Website

```bash
cd corporate-website
npm install
npm run dev
```

## 🔧 Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/aurumvault

# JWT Secrets
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
ADMIN_JWT_SECRET=your-admin-secret-here

# ngrok URLs (updated after starting ngrok)
NGROK_BACKEND_URL=https://your-backend.ngrok.io
NGROK_ADMIN_URL=https://your-admin.ngrok.io
NGROK_PORTAL_URL=https://your-portal.ngrok.io

# Netlify
CORPORATE_URL=https://aurumvault.netlify.app
```

## 💰 Cost

- **ngrok**: $8/month (paid plan for 3 tunnels)
- **Netlify**: Free tier (100GB bandwidth, 300 build minutes)
- **Docker**: Free (local deployment)

**Total**: $8/month

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📝 License

This project is licensed under the GPL-2.0 License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ajirohack** - *Initial work* - [GitHub](https://github.com/Ajirohack)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by luxury banking experiences
- Designed for security and scalability

## 📞 Support

For support, please:

1. Check the [documentation](./docs/deployment/README.md)
2. Review [troubleshooting guide](./DEPLOYMENT_READY.md#-quick-troubleshooting)
3. Open an issue on GitHub

---

**Status**: ✅ Core API Production Ready | 🔄 E-Banking Portal @ 78%  
**Version**: 1.0.0  
**Last Updated**: February 2026
