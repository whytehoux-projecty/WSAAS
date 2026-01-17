# Aurum Vault - Docker Development Environment

This guide provides comprehensive instructions for setting up and managing the Aurum Vault development environment using Docker.

## 🏗️ Architecture Overview

The development environment consists of the following services:

### Core Services
- **PostgreSQL Database** (`aurumvault-db-dev`) - Primary database with audit capabilities
- **Redis Cache** (`aurumvault-redis-dev`) - Session store and caching layer
- **Core API** (`aurumvault-core-api-dev`) - Main banking API with hot reloading
- **Admin Interface** (`aurumvault-admin-interface-dev`) - Admin dashboard with hot reloading

### Development Tools
- **pgAdmin** (`aurumvault-pgadmin-dev`) - Database management interface
- **Redis Commander** (`aurumvault-redis-commander-dev`) - Redis management interface
- **Mailhog** (`aurumvault-mailhog-dev`) - Email testing service
- **Nginx** (`aurumvault-nginx-dev`) - Reverse proxy and load balancer

### Monitoring Stack
- **Prometheus** (`aurumvault-prometheus-dev`) - Metrics collection
- **Grafana** (`aurumvault-grafana-dev`) - Metrics visualization and dashboards

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 8GB RAM available
- At least 10GB free disk space

### 1. Initial Setup

```bash
# Navigate to the docker directory
cd docker

# Run the setup script
./dev-setup.sh setup
```

This will:
- Check prerequisites
- Set up environment configuration
- Create necessary directories
- Build Docker images
- Start all services
- Run database migrations
- Seed the database with sample data

### 2. Start Existing Environment

```bash
./dev-setup.sh start
```

### 3. Stop Environment

```bash
./dev-setup.sh stop
```

## 🔧 Service Configuration

### Environment Variables

The development environment uses `.env.dev` as the base configuration. Key variables:

```bash
# Database
DB_PASSWORD=dev_password_123
DATABASE_URL=postgresql://aurumvault_admin:dev_password_123@localhost:5432/aurumvault_dev

# Redis
REDIS_PASSWORD=dev_redis_123

# JWT (Development Only)
JWT_SECRET=dev_jwt_secret_key_for_development_only_change_in_production

# CORS (Permissive for Development)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173
```

### Port Mapping

| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| Core API | 3000 | 3000 | Main banking API |
| Admin Interface | 3002 | 3002 | Admin dashboard |
| PostgreSQL | 5432 | 5432 | Database |
| Redis | 6379 | 6379 | Cache |
| pgAdmin | 80 | 5050 | Database management |
| Redis Commander | 8081 | 8081 | Redis management |
| Mailhog SMTP | 1025 | 1025 | Email testing |
| Mailhog Web | 8025 | 8025 | Email web interface |
| Prometheus | 9090 | 9090 | Metrics collection |
| Grafana | 3000 | 3001 | Metrics dashboards |
| Nginx | 80/443 | 80/443 | Reverse proxy |

### Debugging

Both Core API and Admin Interface support Node.js debugging:

- **Core API Debug Port**: 9229
- **Admin Interface Debug Port**: 9230

To attach a debugger:
```bash
# VS Code launch.json example
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Core API",
  "port": 9229,
  "restart": true,
  "localRoot": "${workspaceFolder}/core-api/src",
  "remoteRoot": "/app/core-api/src"
}
```

## 📊 Development Tools

### Database Management (pgAdmin)

- **URL**: http://localhost:5050
- **Email**: admin@aurumvault.dev
- **Password**: dev_admin_123

The PostgreSQL server is pre-configured and will appear automatically.

### Redis Management (Redis Commander)

- **URL**: http://localhost:8081
- **Username**: admin
- **Password**: dev_redis_admin_123

### Email Testing (Mailhog)

- **SMTP**: localhost:1025
- **Web Interface**: http://localhost:8025

All emails sent by the application will be captured and viewable in the web interface.

### Monitoring (Grafana)

- **URL**: http://localhost:3001
- **Username**: admin
- **Password**: dev_grafana_123

Prometheus is pre-configured as a data source.

## 🔄 Development Workflow

### Hot Reloading

Both API services support hot reloading:

1. **File Changes**: Modify files in `core-api/src` or `admin-interface/src`
2. **Automatic Restart**: Services automatically restart when files change
3. **Volume Mounting**: Source code is mounted as read-only volumes

### Database Operations

```bash
# Generate Prisma client
docker-compose -f docker-compose.dev.yml exec core-api-dev npm run prisma:generate

# Run migrations
docker-compose -f docker-compose.dev.yml exec core-api-dev npm run prisma:migrate

# Seed database
docker-compose -f docker-compose.dev.yml exec core-api-dev npm run prisma:seed

# Open Prisma Studio
docker-compose -f docker-compose.dev.yml exec core-api-dev npm run prisma:studio

# Reset database
docker-compose -f docker-compose.dev.yml exec core-api-dev npm run prisma:reset
```

### Viewing Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f core-api-dev

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 admin-interface-dev
```

### Service Management

```bash
# Restart specific service
docker-compose -f docker-compose.dev.yml restart core-api-dev

# Rebuild and restart service
docker-compose -f docker-compose.dev.yml up -d --build core-api-dev

# Scale service (if needed)
docker-compose -f docker-compose.dev.yml up -d --scale core-api-dev=2

# Execute commands in service
docker-compose -f docker-compose.dev.yml exec core-api-dev npm test
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
docker-compose -f docker-compose.dev.yml exec core-api-dev npm test
docker-compose -f docker-compose.dev.yml exec admin-interface-dev npm test

# Run tests with coverage
docker-compose -f docker-compose.dev.yml exec core-api-dev npm run test:coverage

# Run tests in watch mode
docker-compose -f docker-compose.dev.yml exec core-api-dev npm run test:watch
```

### Test Database

A separate test database (`aurumvault_test`) is automatically created for testing purposes.

## 🔍 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using a port
   lsof -i :3000
   
   # Kill process using port
   kill -9 $(lsof -t -i:3000)
   ```

2. **Database Connection Issues**
   ```bash
   # Check database health
   docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U aurumvault_admin -d aurumvault_dev
   
   # View database logs
   docker-compose -f docker-compose.dev.yml logs postgres
   ```

3. **Service Not Starting**
   ```bash
   # Check service status
   docker-compose -f docker-compose.dev.yml ps
   
   # View service logs
   docker-compose -f docker-compose.dev.yml logs <service-name>
   
   # Restart service
   docker-compose -f docker-compose.dev.yml restart <service-name>
   ```

4. **Volume Issues**
   ```bash
   # Remove all volumes and restart
   docker-compose -f docker-compose.dev.yml down -v
   ./dev-setup.sh setup
   ```

### Performance Optimization

1. **Increase Docker Resources**
   - Memory: 8GB minimum, 16GB recommended
   - CPU: 4 cores minimum
   - Disk: SSD recommended

2. **Enable File Watching Optimization**
   ```bash
   # Add to .env
   CHOKIDAR_USEPOLLING=true
   WATCHPACK_POLLING=true
   ```

### Health Checks

All services include health checks. Check status:

```bash
# View health status
docker-compose -f docker-compose.dev.yml ps

# Services should show "healthy" or "Up"
```

## 🔒 Security Notes

⚠️ **Development Only**: This configuration is optimized for development and includes:
- Weak passwords for convenience
- Permissive CORS settings
- Debug ports exposed
- Verbose logging enabled

**Never use these configurations in production!**

## 📝 Available Scripts

The `dev-setup.sh` script provides several commands:

```bash
./dev-setup.sh setup     # Initial setup
./dev-setup.sh start     # Start services
./dev-setup.sh stop      # Stop services
./dev-setup.sh restart   # Restart services
./dev-setup.sh rebuild   # Rebuild and restart
./dev-setup.sh cleanup   # Clean up everything
./dev-setup.sh logs      # Show logs
./dev-setup.sh status    # Show service status
```

## 🎯 Next Steps

1. **API Development**: Start developing in `core-api/src`
2. **Admin Development**: Start developing in `admin-interface/src`
3. **Database Changes**: Modify Prisma schema and run migrations
4. **Testing**: Write and run tests for your features
5. **Monitoring**: Use Grafana to monitor application metrics

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)