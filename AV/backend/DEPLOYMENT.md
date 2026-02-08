# NovaBank Backend - Deployment Guide

This guide covers production deployment strategies for the NovaBank backend services.

## 🚀 Deployment Overview

### Architecture Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   API Gateway   │    │   Monitoring    │
│    (Nginx)      │    │   (Kong/AWS)    │    │  (Prometheus)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Core API      │    │  Admin Interface│    │    Logging      │
│   (Fastify)     │    │   (Fastify)     │    │   (ELK Stack)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │     Redis       │
                    │   (Primary)     │    │    (Cluster)    │
                    └─────────────────┘    └─────────────────┘
```

## 🐳 Docker Production Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # Nginx Load Balancer
  nginx:
    image: nginx:alpine
    container_name: novabank-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - core-api
      - admin-interface
    networks:
      - novabank-network
    restart: unless-stopped

  # PostgreSQL with replication
  postgres-primary:
    image: postgres:15-alpine
    container_name: novabank-db-primary
    environment:
      POSTGRES_DB: novabank
      POSTGRES_USER: novabank_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: ${REPLICATION_PASSWORD}
    volumes:
      - postgres_primary_data:/var/lib/postgresql/data
      - ./postgres/postgresql.conf:/etc/postgresql/postgresql.conf
      - ./postgres/pg_hba.conf:/etc/postgresql/pg_hba.conf
    networks:
      - novabank-network
    restart: unless-stopped
    command: postgres -c config_file=/etc/postgresql/postgresql.conf

  # Redis Cluster
  redis-master:
    image: redis:7-alpine
    container_name: novabank-redis-master
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_master_data:/data
    networks:
      - novabank-network
    restart: unless-stopped

  redis-slave:
    image: redis:7-alpine
    container_name: novabank-redis-slave
    command: redis-server --slaveof redis-master 6379 --requirepass ${REDIS_PASSWORD}
    depends_on:
      - redis-master
    networks:
      - novabank-network
    restart: unless-stopped

  # Core API (Multiple instances)
  core-api-1:
    build:
      context: ..
      dockerfile: docker/Dockerfile.api
    container_name: novabank-core-api-1
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://novabank_admin:${DB_PASSWORD}@postgres-primary:5432/novabank
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis-master:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    depends_on:
      - postgres-primary
      - redis-master
    networks:
      - novabank-network
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  # Admin Interface
  admin-interface:
    build:
      context: ..
      dockerfile: docker/Dockerfile.admin
    container_name: novabank-admin-interface
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://novabank_admin:${DB_PASSWORD}@postgres-primary:5432/novabank
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis-master:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3001
    depends_on:
      - postgres-primary
      - redis-master
    networks:
      - novabank-network
    restart: unless-stopped

volumes:
  postgres_primary_data:
  redis_master_data:

networks:
  novabank-network:
    driver: bridge
```

### Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream core_api {
        server core-api-1:3000;
        server core-api-2:3000;
        server core-api-3:3000;
    }

    upstream admin_interface {
        server admin-interface:3001;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=admin:10m rate=5r/s;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Core API
    server {
        listen 443 ssl http2;
        server_name api.novabank.com;

        ssl_certificate /etc/nginx/ssl/api.novabank.com.crt;
        ssl_certificate_key /etc/nginx/ssl/api.novabank.com.key;

        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://core_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Admin Interface
    server {
        listen 443 ssl http2;
        server_name admin.novabank.com;

        ssl_certificate /etc/nginx/ssl/admin.novabank.com.crt;
        ssl_certificate_key /etc/nginx/ssl/admin.novabank.com.key;

        location / {
            limit_req zone=admin burst=10 nodelay;
            proxy_pass http://admin_interface;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name api.novabank.com admin.novabank.com;
        return 301 https://$server_name$request_uri;
    }
}
```

## ☁️ Cloud Deployment

### AWS Deployment

#### ECS with Fargate

```yaml
# ecs-task-definition.json
{
  "family": "novabank-core-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "core-api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/novabank-core-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:novabank/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:novabank/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/novabank-core-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### RDS Configuration

```yaml
# terraform/rds.tf
resource "aws_db_instance" "novabank_primary" {
  identifier = "novabank-primary"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.large"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = "novabank"
  username = "novabank_admin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.novabank.name
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  deletion_protection = true
  skip_final_snapshot = false
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring.arn
  
  tags = {
    Name        = "NovaBank Primary DB"
    Environment = "production"
  }
}
```

### Kubernetes Deployment

#### Core API Deployment

```yaml
# k8s/core-api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: novabank-core-api
  namespace: novabank
spec:
  replicas: 3
  selector:
    matchLabels:
      app: novabank-core-api
  template:
    metadata:
      labels:
        app: novabank-core-api
    spec:
      containers:
      - name: core-api
        image: novabank/core-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: novabank-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: novabank-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: novabank-core-api-service
  namespace: novabank
spec:
  selector:
    app: novabank-core-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

#### Ingress Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: novabank-ingress
  namespace: novabank
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.novabank.com
    - admin.novabank.com
    secretName: novabank-tls
  rules:
  - host: api.novabank.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: novabank-core-api-service
            port:
              number: 80
  - host: admin.novabank.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: novabank-admin-interface-service
            port:
              number: 80
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        REDIS_URL: redis://localhost:6379
    
    - name: Run security audit
      run: npm audit --audit-level high

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build and push Core API image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: novabank-core-api
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -f docker/Dockerfile.api -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
    
    - name: Build and push Admin Interface image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: novabank-admin-interface
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -f docker/Dockerfile.admin -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service --cluster novabank-cluster --service novabank-core-api --force-new-deployment
        aws ecs update-service --cluster novabank-cluster --service novabank-admin-interface --force-new-deployment
```

## 📊 Monitoring & Observability

### Prometheus Configuration

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'novabank-core-api'
    static_configs:
      - targets: ['core-api:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'novabank-admin-interface'
    static_configs:
      - targets: ['admin-interface:3001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "NovaBank API Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security Hardening

### Production Security Checklist

#### Infrastructure Security

- [ ] SSL/TLS certificates configured
- [ ] Firewall rules implemented
- [ ] VPC/Network segmentation
- [ ] Security groups configured
- [ ] IAM roles with least privilege
- [ ] Secrets management enabled
- [ ] Backup encryption enabled
- [ ] Monitoring and alerting active

#### Application Security

- [ ] Environment variables secured
- [ ] Database connections encrypted
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] Audit logging configured
- [ ] Error handling secured
- [ ] Dependencies updated
- [ ] Security headers enabled

#### Operational Security

- [ ] Access controls implemented
- [ ] Change management process
- [ ] Incident response plan
- [ ] Backup and recovery tested
- [ ] Security monitoring active
- [ ] Compliance checks passed
- [ ] Documentation updated
- [ ] Team training completed

## 📈 Scaling Strategies

### Horizontal Scaling

#### Auto Scaling Configuration

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: novabank-core-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: novabank-core-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling

#### Read Replicas

```sql
-- PostgreSQL streaming replication
-- On primary server
CREATE USER replicator REPLICATION LOGIN CONNECTION LIMIT 1 ENCRYPTED PASSWORD 'password';

-- postgresql.conf
wal_level = replica
max_wal_senders = 3
max_replication_slots = 3
synchronous_commit = on

-- pg_hba.conf
host replication replicator replica_ip/32 md5
```

#### Connection Pooling

```javascript
// PgBouncer configuration
const pool = new Pool({
  host: 'pgbouncer-host',
  port: 6432,
  database: 'novabank',
  user: 'novabank_admin',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🚨 Disaster Recovery

### Backup Strategy

#### Automated Backups

```bash
#!/bin/bash
# backup-script.sh

# Database backup
pg_dump -h $DB_HOST -U $DB_USER -d novabank | gzip > /backups/novabank-$(date +%Y%m%d-%H%M%S).sql.gz

# Upload to S3
aws s3 cp /backups/novabank-$(date +%Y%m%d-%H%M%S).sql.gz s3://novabank-backups/database/

# Redis backup
redis-cli --rdb /backups/redis-$(date +%Y%m%d-%H%M%S).rdb
aws s3 cp /backups/redis-$(date +%Y%m%d-%H%M%S).rdb s3://novabank-backups/redis/

# Cleanup old backups (keep 30 days)
find /backups -name "*.gz" -mtime +30 -delete
find /backups -name "*.rdb" -mtime +30 -delete
```

#### Recovery Procedures

```bash
#!/bin/bash
# recovery-script.sh

# Download latest backup
aws s3 cp s3://novabank-backups/database/latest.sql.gz /tmp/

# Restore database
gunzip -c /tmp/latest.sql.gz | psql -h $DB_HOST -U $DB_USER -d novabank

# Verify data integrity
psql -h $DB_HOST -U $DB_USER -d novabank -c "SELECT COUNT(*) FROM users;"
```

---

**NovaBank Deployment** - Production-ready deployment for enterprise banking platform.
