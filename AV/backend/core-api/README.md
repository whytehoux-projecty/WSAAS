# NovaBank Core API

A comprehensive banking API built with Fastify, TypeScript, and Prisma.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Account Management**: Create and manage bank accounts with real-time balance tracking
- **Transaction Processing**: Handle deposits, withdrawals, and transfers with proper validation
- **Wire Transfers**: Domestic and international wire transfer capabilities
- **KYC Management**: Document upload and verification system
- **Security**: Rate limiting, input validation, and comprehensive audit logging
- **Documentation**: Auto-generated API documentation with Swagger
- **Health Monitoring**: Built-in health checks and system monitoring

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify 4.x
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Redis server
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run database migrations:

```bash
npm run prisma:migrate
```

5. Seed the database (optional):

```bash
npm run prisma:seed
```

### Development

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Building for Production

```bash
npm run build
npm start
```

## API Documentation

Once the server is running, visit:

- Swagger UI: `http://localhost:3001/docs`
- API Info: `http://localhost:3001/api/info`
- Health Check: `http://localhost:3001/api/health`

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Accounts

- `GET /api/accounts` - List user accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id` - Get account details
- `PUT /api/accounts/:id` - Update account
- `GET /api/accounts/:id/balance` - Get account balance
- `GET /api/accounts/:id/transactions` - Get account transactions

### Transactions

- `GET /api/transactions` - List transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions/deposit` - Create deposit
- `POST /api/transactions/withdrawal` - Create withdrawal
- `POST /api/transactions/transfer` - Create transfer
- `GET /api/transactions/statistics` - Get transaction statistics

### KYC

- `GET /api/kyc/documents` - List KYC documents
- `POST /api/kyc/documents` - Upload KYC document
- `GET /api/kyc/documents/:id` - Get document details
- `DELETE /api/kyc/documents/:id` - Delete document
- `GET /api/kyc/status` - Get KYC status

### Wire Transfers

- `GET /api/wire-transfers` - List wire transfers
- `POST /api/wire-transfers` - Create wire transfer
- `GET /api/wire-transfers/:id` - Get wire transfer details
- `POST /api/wire-transfers/:id/cancel` - Cancel wire transfer
- `GET /api/wire-transfers/fees` - Get transfer fees

### System

- `GET /api/health` - Health check
- `GET /api/info` - API information
- `GET /api/statistics` - System statistics

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Code Quality

Lint code:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

Format code:

```bash
npm run format
```

## Database Management

Generate Prisma client:

```bash
npm run prisma:generate
```

Create and apply migration:

```bash
npm run prisma:migrate
```

Deploy migrations to production:

```bash
npm run prisma:deploy
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

## Environment Variables

Key environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/novabank"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"

# Server
API_PORT=3001
NODE_ENV="development"

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# External Services
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
DWOLLA_KEY="your-dwolla-key"
DWOLLA_SECRET="your-dwolla-secret"
```

## Security Features

- **Rate Limiting**: Configurable rate limits per endpoint
- **Input Validation**: Comprehensive validation using Zod schemas
- **Authentication**: JWT-based authentication with secure token handling
- **Authorization**: Role-based access control with middleware
- **Audit Logging**: Complete audit trail of all operations
- **Password Security**: bcrypt hashing with configurable rounds
- **CORS**: Configurable CORS policies
- **Helmet**: Security headers via Helmet middleware

## Monitoring & Logging

- **Health Checks**: Database and Redis connectivity monitoring
- **Structured Logging**: Winston-based logging with multiple transports
- **Error Tracking**: Comprehensive error handling and reporting
- **Performance Metrics**: Response time and throughput monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
