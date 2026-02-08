# NovaBank Backend Services

A comprehensive banking platform backend built with modern technologies and best practices. This backend powers the NovaBank digital banking experience with robust APIs, admin interfaces, and shared utilities.

## 🏗️ Architecture Overview

The NovaBank backend follows a microservices-inspired architecture with clear separation of concerns:

```
backend/
├── core-api/           # Main banking API service
├── admin-interface/    # Administrative management interface
├── shared/            # Shared utilities, types, and constants
├── database/          # Database schemas, migrations, and procedures
└── docker/           # Containerization configurations
```

### Core Components

#### 🔧 Core API (`core-api/`)

The main banking API service that handles:

- **User Authentication & Authorization** - JWT-based auth with session management
- **Account Management** - Bank account creation, updates, and monitoring
- **Transaction Processing** - Real-time transaction handling with audit trails
- **Wire Transfers** - Domestic and international wire transfer processing
- **KYC Management** - Know Your Customer document handling and verification
- **Security & Compliance** - Rate limiting, encryption, and audit logging

#### 👨‍💼 Admin Interface (`admin-interface/`)

Administrative dashboard and API for:

- **User Management** - Customer account administration
- **Transaction Monitoring** - Real-time transaction oversight
- **KYC Review** - Document verification and compliance management
- **Wire Transfer Approval** - Manual review and approval workflows
- **System Analytics** - Dashboard metrics and reporting
- **Audit & Compliance** - Comprehensive audit trail management

#### 📚 Shared Libraries (`shared/`)

Common utilities and types used across services:

- **Type Definitions** - TypeScript interfaces and enums
- **Validation Schemas** - Zod schemas for data validation
- **Utility Functions** - Date, financial, and string manipulation utilities
- **Constants** - Application-wide constants and configurations

## 🚀 Features

### 🔐 Security & Authentication

- **JWT Authentication** with HTTP-only cookies
- **Role-based Access Control** (Customer, Admin, Super Admin)
- **Session Management** with automatic expiration
- **Rate Limiting** to prevent abuse
- **Password Hashing** with bcrypt (12 rounds)
- **Audit Logging** for all sensitive operations

### 💳 Banking Operations

- **Multi-currency Account Support** (USD, EUR, GBP, etc.)
- **Real-time Transaction Processing** with immediate balance updates
- **Wire Transfer Management** (domestic and international)
- **Transaction Categories** and detailed metadata
- **Balance Tracking** with available vs. total balance
- **Daily Transaction Limits** and fraud prevention

### 📊 Compliance & Monitoring

- **KYC Document Management** with automated verification workflows
- **AML Compliance** monitoring and reporting
- **Comprehensive Audit Trails** for regulatory compliance
- **Real-time Fraud Detection** and prevention
- **Transaction Monitoring** with suspicious activity alerts

### 🔧 Technical Excellence

- **TypeScript** for type safety and developer experience
- **Prisma ORM** for type-safe database operations
- **Fastify** for high-performance API development
- **Zod** for runtime type validation
- **Jest** for comprehensive testing
- **Docker** for containerization and deployment

## 🛠️ Tech Stack

### Core Technologies

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: Fastify 4.x
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Caching**: Redis (optional)
- **Authentication**: JWT with HTTP-only cookies

### Development Tools

- **Testing**: Jest with TypeScript support
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Type Checking**: TypeScript compiler
- **API Documentation**: Swagger/OpenAPI
- **Database Migrations**: Prisma Migrate

### Security & Monitoring

- **Security Headers**: Helmet.js
- **Rate Limiting**: Fastify rate limiting
- **Logging**: Pino (built into Fastify)
- **Validation**: Zod schemas
- **CORS**: Configurable cross-origin resource sharing

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **Redis** (optional, for advanced caching)
- **Docker** (optional, for containerized deployment)

### Environment Setup

1. **Clone and navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Copy environment configuration**:

   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**:

   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/novabank"
   
   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   JWT_EXPIRES_IN="24h"
   
   # Server Configuration
   CORE_API_PORT=3000
   ADMIN_API_PORT=3001
   NODE_ENV=development
   
   # Security
   BCRYPT_ROUNDS=12
   RATE_LIMIT_MAX=100
   RATE_LIMIT_WINDOW=900000
   
   # CORS
   CORS_ORIGIN="http://localhost:3000"
   
   # Optional: Redis for caching
   REDIS_URL="redis://localhost:6379"
   ```

### Installation

1. **Install root dependencies**:

   ```bash
   npm install
   ```

2. **Install service dependencies**:

   ```bash
   # Core API
   cd core-api && npm install && cd ..
   
   # Admin Interface
   cd admin-interface && npm install && cd ..
   
   # Shared libraries
   cd shared && npm install && cd ..
   ```

3. **Database setup**:

   ```bash
   cd core-api
   
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate deploy
   
   # Seed database with sample data
   npx prisma db seed
   ```

### Development

Start all services in development mode:

```bash
# Start Core API (Port 3000)
cd core-api && npm run dev &

# Start Admin Interface (Port 3001)
cd admin-interface && npm run dev &

# Or use the root package.json scripts
npm run dev:core-api
npm run dev:admin
```

### Production Build

```bash
# Build all services
npm run build

# Start production servers
npm run start:core-api
npm run start:admin
```

## 📖 API Documentation

### Core API Endpoints

#### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update user profile

#### Accounts

- `GET /api/accounts` - List user accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id` - Get account details
- `PATCH /api/accounts/:id` - Update account

#### Transactions

- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details

#### Wire Transfers

- `GET /api/wire-transfers` - List wire transfers
- `POST /api/wire-transfers` - Create wire transfer
- `DELETE /api/wire-transfers/:id` - Cancel wire transfer

#### KYC Management

- `GET /api/kyc/documents` - List KYC documents
- `POST /api/kyc/documents` - Upload KYC document
- `GET /api/kyc/status` - Get KYC status

### Admin API Endpoints

#### Dashboard

- `GET /api/admin/dashboard/stats` - Dashboard statistics

#### User Management

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PATCH /api/admin/users/:id/status` - Update user status

#### Transaction Monitoring

- `GET /api/admin/transactions` - Monitor transactions
- `GET /api/admin/wire-transfers` - Monitor wire transfers

## 🗄️ Database Schema

The database schema is managed through Prisma and includes:

### Core Entities

- **Users** - Customer information and authentication
- **Accounts** - Bank accounts with balances and metadata
- **Transactions** - All financial transactions
- **WireTransfers** - Wire transfer records
- **KYCDocuments** - Know Your Customer documentation
- **Sessions** - User session management
- **AuditLogs** - Comprehensive audit trail

### Key Relationships

- Users can have multiple Accounts
- Accounts can have multiple Transactions
- Users can have multiple KYC Documents
- All operations are logged in AuditLogs

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens** with configurable expiration
- **HTTP-only Cookies** to prevent XSS attacks
- **Role-based Access Control** with granular permissions
- **Session Management** with automatic cleanup

### Data Protection

- **Password Hashing** with bcrypt and salt rounds
- **SQL Injection Prevention** through Prisma ORM
- **Input Validation** with Zod schemas
- **Rate Limiting** to prevent abuse

### Compliance

- **Audit Logging** for all sensitive operations
- **Data Encryption** for sensitive fields
- **GDPR Compliance** with data retention policies
- **PCI DSS** considerations for payment data

## 📊 Monitoring & Logging

### Application Logging

- **Structured JSON Logging** with Pino
- **Request/Response Logging** for API calls
- **Error Tracking** with stack traces
- **Performance Metrics** for optimization

### Health Monitoring

- **Database Connection** health checks
- **API Response Times** monitoring
- **Error Rate** tracking
- **System Resource** usage

### Audit Trail

- **User Actions** comprehensive logging
- **Administrative Operations** tracking
- **Security Events** monitoring
- **Compliance Reporting** capabilities

## 🧪 Testing

### Test Structure

```bash
# Run all tests
npm test

# Run tests for specific service
cd core-api && npm test
cd admin-interface && npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Categories

- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **Database Tests** - Data layer testing
- **Security Tests** - Authentication and authorization

## 🐳 Docker Deployment

### Container Images

```bash
# Build Core API image
docker build -f docker/Dockerfile.api -t novabank-core-api .

# Build Admin Interface image
docker build -f docker/Dockerfile.admin -t novabank-admin .

# Run with Docker Compose
docker-compose up -d
```

### Production Deployment

- **Multi-stage Builds** for optimized images
- **Health Checks** for container monitoring
- **Environment Configuration** through Docker secrets
- **Load Balancing** with reverse proxy

## 🔧 Environment Variables

### Core API Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

### Admin Interface Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Admin server port | `3001` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `COOKIE_SECRET` | Cookie signing secret | Required |

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes with tests
4. **Ensure** all tests pass
5. **Submit** a pull request

### Code Standards

- **TypeScript** for all new code
- **ESLint** configuration compliance
- **Prettier** for code formatting
- **Jest** tests for new features
- **Conventional Commits** for commit messages

### Pull Request Process

1. Update documentation for new features
2. Add tests for new functionality
3. Ensure CI/CD pipeline passes
4. Request review from maintainers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check the service-specific README files
- **Issues**: Create a GitHub issue for bugs
- **Security**: Report security issues privately
- **Community**: Join our developer community

---

**NovaBank Backend** - Powering the future of digital banking with security, scalability, and excellence.
