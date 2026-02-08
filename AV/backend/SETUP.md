# NovaBank Backend - Complete Setup Guide

Welcome to the NovaBank backend services! This guide will help you set up and run the complete banking platform.

## 🏗️ Architecture Overview

NovaBank backend follows a microservices-inspired architecture:

```
backend/
├── core-api/           # Main banking API (Fastify)
├── admin-interface/    # Admin dashboard API (Fastify)
├── shared/            # Common utilities and types
├── database/          # Database schemas and migrations
└── docker/           # Docker configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm 9+
- **PostgreSQL** 15+
- **Redis** 7+
- **Docker** & Docker Compose (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone and navigate:**

   ```bash
   cd backend/docker
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services:**

   ```bash
   docker-compose up -d
   ```

4. **Check status:**

   ```bash
   docker-compose ps
   ```

### Option 2: Local Development

1. **Install dependencies:**

   ```bash
   npm run install:all
   ```

2. **Set up environment:**

   ```bash
   cp .env.example .env
   # Configure your local database and Redis
   ```

3. **Set up database:**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development servers:**

   ```bash
   npm run dev
   ```

## 🔧 Development Commands

### Root Level Commands

```bash
# Install all dependencies
npm run install:all

# Development (all services)
npm run dev

# Build all services
npm run build

# Start production
npm run start

# Run tests
npm run test
npm run test:coverage

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:deploy      # Deploy to production
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio
npm run db:reset       # Reset database

# Docker operations
npm run docker:build
npm run docker:up
npm run docker:down
npm run docker:logs

# Cleanup
npm run clean
```

### Service-Specific Commands

```bash
# Core API
cd core-api
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests

# Admin Interface
cd admin-interface
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests

# Shared Library
cd shared
npm run build        # Build shared library
npm run test         # Run tests
```

## 🌐 Service URLs

When running locally:

- **Core API**: <http://localhost:3000>
- **Admin Interface**: <http://localhost:3001>
- **pgAdmin**: <http://localhost:5050>
- **Redis Commander**: <http://localhost:8081>

## 📊 API Documentation

### Core API Endpoints

```
GET    /api/health              # Health check
POST   /api/auth/register       # User registration
POST   /api/auth/login          # User login
POST   /api/auth/refresh        # Refresh token
GET    /api/accounts            # Get user accounts
POST   /api/accounts            # Create account
GET    /api/transactions        # Get transactions
POST   /api/transactions        # Create transaction
POST   /api/wire-transfers      # Create wire transfer
GET    /api/fx-rates            # Get exchange rates
```

### Admin API Endpoints

```
GET    /api/health              # Health check
POST   /api/admin/login         # Admin login
GET    /api/admin/users         # Get all users
GET    /api/admin/accounts      # Get all accounts
GET    /api/admin/transactions  # Get all transactions
GET    /api/admin/wire-transfers # Get wire transfers
GET    /api/admin/audit-logs    # Get audit logs
GET    /api/admin/statistics    # Get platform statistics
```

## 🗄️ Database Schema

### Core Models

- **User**: Customer information and KYC status
- **Account**: Bank accounts with balances and types
- **Transaction**: All financial transactions
- **WireTransfer**: International wire transfers
- **KycDocument**: KYC verification documents
- **AuditLog**: System audit trail
- **UserSession**: Active user sessions
- **FxRate**: Foreign exchange rates

### Key Features

- **Multi-currency support**
- **Comprehensive audit trail**
- **KYC/AML compliance**
- **Real-time transaction processing**
- **Wire transfer management**
- **Risk assessment**

## 🔒 Security Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Session management with Redis
- Secure password hashing (bcrypt)

### API Security

- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Zod
- SQL injection prevention

### Audit & Monitoring

- Comprehensive audit logging
- Real-time monitoring
- Error tracking
- Performance metrics

## 🧪 Testing

### Running Tests

```bash
# All services
npm run test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific service
cd core-api && npm test
cd admin-interface && npm test
cd shared && npm test
```

### Test Structure

```
src/
├── __tests__/          # Unit tests
├── integration/        # Integration tests
└── e2e/               # End-to-end tests
```

## 🐳 Docker Deployment

### Development

```bash
cd docker
docker-compose up -d
```

### Production

```bash
cd docker
docker-compose -f docker-compose.prod.yml up -d
```

### Monitoring

```bash
# View logs
docker-compose logs -f

# Check health
docker-compose ps

# Resource usage
docker stats
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/novabank` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:3000` |

## 📈 Monitoring & Logging

### Application Logs

- Structured logging with Pino
- Log levels: error, warn, info, debug
- Request/response logging
- Performance metrics

### Health Checks

- Database connectivity
- Redis connectivity
- External service status
- Memory and CPU usage

### Metrics

- Request rate and latency
- Error rates
- Database query performance
- Cache hit rates

## 🚀 Production Deployment

### Prerequisites

- Docker and Docker Compose
- SSL certificates
- Environment variables configured
- Database migrations applied

### Deployment Steps

1. **Build images:**

   ```bash
   docker-compose build
   ```

2. **Run migrations:**

   ```bash
   docker-compose run core-api npm run db:migrate
   ```

3. **Start services:**

   ```bash
   docker-compose up -d
   ```

4. **Verify deployment:**

   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:3001/api/health
   ```

### Production Considerations

- Use environment-specific configurations
- Enable SSL/TLS encryption
- Set up load balancing
- Configure monitoring and alerting
- Implement backup strategies
- Use secrets management

## 🤝 Contributing

### Development Workflow

1. **Fork and clone** the repository
2. **Create feature branch** from `main`
3. **Install dependencies** with `npm run install:all`
4. **Make changes** following coding standards
5. **Run tests** with `npm test`
6. **Submit pull request** with clear description

### Coding Standards

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Jest** for testing
- **Conventional commits** for commit messages

### Code Review Process

- All changes require pull request review
- Automated tests must pass
- Code coverage should not decrease
- Documentation must be updated

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and service-specific docs
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions

### Common Issues

1. **Port conflicts**: Check if ports 3000, 3001, 5432, 6379 are available
2. **Database connection**: Verify PostgreSQL is running and accessible
3. **Redis connection**: Ensure Redis is running and configured correctly
4. **Environment variables**: Check all required variables are set

### Troubleshooting

```bash
# Check service status
npm run health-check

# View logs
npm run logs

# Reset database
npm run db:reset

# Clean and reinstall
npm run clean && npm run install:all
```

---

**NovaBank Backend** - Modern banking platform built with Node.js, TypeScript, and Fastify.
