# NovaBank Admin Interface

A secure, feature-rich administrative interface for managing the NovaBank platform. Built with Fastify, TypeScript, and Prisma.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Comprehensive user administration with status and KYC management
- **Transaction Monitoring**: Real-time transaction oversight and management
- **Wire Transfer Compliance**: Review and approve/reject wire transfers
- **Audit Logging**: Complete audit trail for all administrative actions
- **Dashboard Analytics**: Real-time statistics and insights
- **Security**: Rate limiting, CORS, security headers, and comprehensive input validation

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (for session management and caching)
- npm or yarn

### Installation

1. **Install dependencies**:

   ```bash
   cd backend/admin-interface
   npm install
   ```

2. **Environment setup**:

   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/novabank"
   
   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   JWT_EXPIRES_IN="24h"
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # CORS
   CORS_ORIGIN="http://localhost:3000"
   
   # Cookies
   COOKIE_SECRET="your-cookie-secret-change-in-production"
   
   # Rate Limiting
   RATE_LIMIT_MAX=100
   RATE_LIMIT_WINDOW=900000
   ```

4. **Database setup**:

   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   
   # Seed database (optional)
   npx prisma db seed
   ```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/profile` - Get current admin profile
- `PATCH /api/auth/profile` - Update admin profile
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/verify-token` - Verify JWT token

### Admin Management Endpoints

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users with pagination
- `GET /api/admin/users/:userId` - Get specific user details
- `PATCH /api/admin/users/:userId/status` - Update user status
- `PATCH /api/admin/users/:userId/kyc-status` - Update KYC status
- `GET /api/admin/transactions` - List transactions with filtering
- `GET /api/admin/wire-transfers` - List wire transfers
- `PATCH /api/admin/wire-transfers/:transferId/status` - Update wire transfer status
- `GET /api/admin/audit-logs` - View audit logs

### System Endpoints

- `GET /api/health` - Health check

## Authentication Flow

1. **Login**: Admin provides email and password
2. **Verification**: Credentials verified against database
3. **Token Generation**: JWT token created with admin permissions
4. **Cookie Setting**: Token stored in HTTP-only cookie
5. **Session Management**: Session tracked in database
6. **Authorization**: Each request validates token and session

## Security Features

### Authentication Security

- Bcrypt password hashing with 12 rounds
- JWT tokens with configurable expiration
- HTTP-only cookies prevent XSS attacks
- Session invalidation on logout
- Failed login attempt tracking

### API Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting per IP
- Request validation with Zod
- SQL injection prevention with Prisma

### Audit & Monitoring

- All admin actions logged
- IP address and user agent tracking
- Failed authentication attempts logged
- Session activity monitoring

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRES_IN` | JWT token expiration time | `24h` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `COOKIE_SECRET` | Secret for cookie signing | Required |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `900000` |
| `LOG_LEVEL` | Logging level | `info` |

## Monitoring & Logging

### Health Monitoring

- Database connection status
- System resource usage
- API response times
- Error rates

### Logging

- Structured JSON logging
- Request/response logging
- Error tracking with stack traces
- Audit trail for all admin actions

### Metrics

- User activity metrics
- Transaction volume tracking
- System performance metrics
- Security event monitoring

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

## Production Deployment

### Build Process

```bash
# Install production dependencies
npm ci --only=production

# Build TypeScript
npm run build

# Start production server
npm start
```

### Environment Configuration

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Set up SSL/TLS certificates
- Configure reverse proxy (nginx)

### Security Checklist

- [ ] Strong JWT secret configured
- [ ] Database credentials secured
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] Error monitoring set up
- [ ] Backup strategy implemented

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
