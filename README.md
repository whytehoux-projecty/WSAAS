# UHI Staff Portal

**Enterprise HR Management System for United Health Initiative**

[![Production Ready](https://img.shields.io/badge/Production-75%25-yellow)](./UHI-STAFF-PORTAL/REVIEW_SUMMARY.md)
[![Feature Complete](https://img.shields.io/badge/Features-87%25-brightgreen)](./UHI-STAFF-PORTAL/GAP_IMPLEMENTATION_STATUS.md)
[![Code Quality](https://img.shields.io/badge/Quality-86%2F100-green)](./UHI-STAFF-PORTAL/TECHNICAL_REVIEW_2026.md)

---

## 📋 Overview

A comprehensive full-stack HR management platform built with modern technologies, featuring:

- 🔐 **Secure Authentication** with Two-Factor Authentication (2FA)
- 💰 **Finance Management** (Payroll, Loans, Grants) with Stripe integration
- 📄 **Document Management** with AWS S3 storage
- 🔄 **Automated Workflows** for leave and application processing
- 📊 **Analytics Dashboard** with real-time insights
- 👥 **Role-Based Access Control** for staff and administrators

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    UHI Staff Portal                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Backend    │  │ Staff Portal │  │    Admin     │  │
│  │   API        │  │  (Next.js)   │  │  Interface   │  │
│  │ (Express)    │  │              │  │  (Next.js)   │  │
│  │              │  │  Port 3001   │  │  Port 3002   │  │
│  │  Port 3000   │  │              │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         └─────────────────┴──────────────────┘          │
│                           │                             │
│         ┌─────────────────┴─────────────────┐           │
│         │                                   │           │
│    ┌────▼─────┐                      ┌─────▼────┐      │
│    │PostgreSQL│                      │  Redis   │      │
│    │ Database │                      │  Cache   │      │
│    └──────────┘                      └──────────┘      │
│                                                         │
│         External Integrations:                         │
│         • Stripe (Payments)                            │
│         • AWS S3 (Document Storage)                    │
│         • Sentry (Error Monitoring)                    │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend**

- Node.js 20 + TypeScript 5.7
- Express 4.21
- Prisma ORM 5.22 (PostgreSQL)
- Redis for caching
- Stripe for payments
- AWS S3 for file storage

**Frontend**

- Next.js 16.1 (App Router)
- React 19.2
- TypeScript 5
- Tailwind CSS 4
- Recharts for analytics

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 15 or higher
- Redis 7 or higher
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/whytehoux-projecty/WSAAS.git
   cd WSAAS/UHI-STAFF-PORTAL
   ```

2. **Install Backend Dependencies**

   ```bash
   cd staff_backend
   npm install
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd ../staff_portal
   npm install
   
   cd ../staff_admin_interface
   npm install
   ```

4. **Configure Environment Variables**

   ```bash
   cd ../staff_backend
   cp .env.example .env
   # Edit .env with your database credentials and API keys
   ```

5. **Setup Database**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Start Services**

   **Terminal 1 - Backend:**

   ```bash
   cd staff_backend
   npm run dev
   # Runs on http://localhost:3000
   ```

   **Terminal 2 - Staff Portal:**

   ```bash
   cd staff_portal
   npm run dev
   # Runs on http://localhost:3001
   ```

   **Terminal 3 - Admin Interface:**

   ```bash
   cd staff_admin_interface
   npm run dev
   # Runs on http://localhost:3002
   ```

### Default Credentials

After seeding the database:

- **Admin**: <admin@uhi.org> / password123
- **Staff**: <staff@uhi.org> / password123

---

## 📁 Project Structure

```
UHI-STAFF-PORTAL/
├── staff_backend/          # Backend API (Express + Prisma)
│   ├── src/
│   │   ├── modules/        # Business logic modules
│   │   │   ├── auth/       # Authentication & 2FA
│   │   │   ├── staff/      # Staff management
│   │   │   ├── finance/    # Payroll, loans, grants
│   │   │   ├── applications/ # Leave, transfer requests
│   │   │   ├── admin/      # Admin operations
│   │   │   ├── cms/        # Content management
│   │   │   └── webhook/    # External integrations
│   │   ├── shared/         # Shared utilities
│   │   └── config/         # Configuration
│   └── prisma/             # Database schema & migrations
│
├── staff_portal/           # Staff Self-Service Portal
│   └── src/
│       ├── app/            # Next.js pages
│       ├── components/     # React components
│       ├── contexts/       # React contexts
│       └── lib/            # Utilities
│
├── staff_admin_interface/  # Admin Dashboard
│   └── src/
│       ├── app/            # Next.js pages
│       └── components/     # React components
│
└── docs/                   # Documentation
    ├── TECHNICAL_REVIEW_2026.md
    ├── GAP_IMPLEMENTATION_STATUS.md
    ├── REVIEW_SUMMARY.md
    └── EXECUTIVE_SUMMARY.md
```

---

## 🎯 Features

### For Staff Members

- ✅ **Dashboard** - Overview of payroll, loans, and applications
- ✅ **Payroll Management** - View payslips and download PDFs
- ✅ **Loan Management** - Apply for loans and make payments via Stripe
- ✅ **Grant Applications** - Request grants with approval workflow
- ✅ **Leave Requests** - Submit and track leave applications
- ✅ **Document Access** - View and download employment documents
- ✅ **Profile Management** - Update personal info and enable 2FA
- ✅ **Contract Information** - View employment history and contracts

### For Administrators

- ✅ **Analytics Dashboard** - Real-time charts and metrics
- ✅ **Application Review** - Approve/reject staff applications
- ✅ **Payroll Processing** - Generate and manage payroll records
- ✅ **Loan Administration** - Review and approve loan requests
- ✅ **User Management** - Manage staff accounts and roles
- ✅ **System Settings** - Configure organization, email, workflows
- ✅ **Document Management** - Upload and manage staff documents
- ⚠️ **Reporting** - Export data and generate reports (25% complete)

---

## 📊 Project Status

### Overall Metrics

- **Feature Completion**: 87% (65 of 75 planned features)
- **Production Readiness**: 75% (Pending security enhancements)
- **Code Quality Score**: 86/100
- **Test Coverage**: Backend 60%, Frontend 0%

### Component Scores

| Component | Score | Status |
|-----------|-------|--------|
| Architecture | 92/100 | ✅ Excellent |
| Code Quality | 85/100 | ✅ Good |
| Security | 73.5/100 | ⚠️ Needs Work |
| Performance | 82/100 | ⚠️ Optimization Needed |
| Testing | 60/100 | ⚠️ Critical Gap |
| DevOps | 61/100 | ⚠️ Not Ready |
| Documentation | 80/100 | ✅ Adequate |

### Critical Gaps

Before production deployment, the following must be addressed:

1. ❌ **CSRF Protection** (CRITICAL)
2. ❌ **Secrets Management** (CRITICAL)
3. ❌ **Automated Backups** (HIGH)
4. ❌ **CI/CD Pipeline** (HIGH)
5. ❌ **Load Testing** (MEDIUM)

**Estimated Time to Production**: 7 weeks

---

## 🔒 Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Two-Factor Authentication (TOTP)
- ✅ Role-Based Access Control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (5 req/15min for auth, 100 req/15min general)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Sentry error monitoring
- ❌ CSRF protection (PENDING)
- ⚠️ Data encryption (Partial - passwords only)

---

## 🧪 Testing

### Backend Tests

```bash
cd staff_backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

**Current Coverage**: 60% (163 test files)  
**Target**: 80%

### Frontend Tests

⚠️ **Not yet implemented**

**Planned**:

- React Testing Library for component tests
- Playwright for E2E tests
- Target: 60% coverage

---

## 📚 Documentation

Comprehensive documentation is available in the `UHI-STAFF-PORTAL/` directory:

1. **[REVIEW_SUMMARY.md](./UHI-STAFF-PORTAL/REVIEW_SUMMARY.md)** - Quick reference guide
2. **[TECHNICAL_REVIEW_2026.md](./UHI-STAFF-PORTAL/TECHNICAL_REVIEW_2026.md)** - Detailed technical analysis
3. **[GAP_IMPLEMENTATION_STATUS.md](./UHI-STAFF-PORTAL/GAP_IMPLEMENTATION_STATUS.md)** - Feature completion status
4. **[EXECUTIVE_SUMMARY.md](./UHI-STAFF-PORTAL/EXECUTIVE_SUMMARY.md)** - High-level overview

### API Documentation

Swagger documentation is available when running the backend:

```
http://localhost:3000/api-docs
```

---

## 🛠️ Development

### Available Scripts

**Backend:**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run lint         # Lint code
npm run prisma:migrate  # Run database migrations
npm run prisma:seed     # Seed database
```

**Frontend (both portals):**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

---

## 🚢 Deployment

### Docker (Recommended)

⚠️ **Docker configuration is pending** - See [TECHNICAL_REVIEW_2026.md](./UHI-STAFF-PORTAL/TECHNICAL_REVIEW_2026.md) for implementation plan.

### Manual Deployment

1. Build all services:

   ```bash
   cd staff_backend && npm run build
   cd ../staff_portal && npm run build
   cd ../staff_admin_interface && npm run build
   ```

2. Set production environment variables

3. Run database migrations:

   ```bash
   cd staff_backend
   npx prisma migrate deploy
   ```

4. Start services:

   ```bash
   # Backend
   cd staff_backend && npm start
   
   # Staff Portal
   cd staff_portal && npm start
   
   # Admin Interface
   cd staff_admin_interface && npm start
   ```

---

## 🤝 Contributing

This is a private project for United Health Initiative. For internal contributions:

1. Create a feature branch from `main`
2. Make your changes
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration provided
- Write meaningful commit messages
- Document complex logic

---

## 📝 License

Proprietary - United Health Initiative  
All rights reserved.

---

## 📞 Support

For technical support or questions:

- **Technical Lead**: [Contact Information]
- **Project Manager**: [Contact Information]
- **Documentation**: See `UHI-STAFF-PORTAL/docs/`

---

## 🗺️ Roadmap

### Q1 2026 (Current)

- ✅ Core features implementation (87% complete)
- 🔄 Security hardening (In Progress)
- 🔄 DevOps setup (Planned)

### Q2 2026

- 📋 Production deployment
- 📋 Performance optimization
- 📋 Enhanced reporting module
- 📋 Mobile app development

### Q3 2026

- 📋 Microservices architecture
- 📋 Advanced analytics
- 📋 Machine learning integration
- 📋 Multi-tenancy support

---

## ⭐ Acknowledgments

Built with modern technologies and best practices:

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Stripe](https://stripe.com/) - Payment processing
- [AWS S3](https://aws.amazon.com/s3/) - File storage
- [Sentry](https://sentry.io/) - Error monitoring

---

**Last Updated**: February 1, 2026  
**Version**: 1.0.0  
**Status**: Development (75% Production Ready)
