# TBURN Blockchain Explorer - Deployment Guide

## Overview
This guide covers deploying the TBURN Blockchain Explorer to production environments on AWS, GCP, or Azure.

---

## Prerequisites

### Required
- **Node.js**: 20.x or higher
- **PostgreSQL**: 16.x or higher (Neon Serverless recommended)
- **Domain**: Custom domain with SSL/TLS certificate
- **Cloud Provider**: AWS, GCP, or Azure account

### Recommended
- **CDN**: CloudFlare, CloudFront, or equivalent
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack or CloudWatch
- **CI/CD**: GitHub Actions, GitLab CI, or Jenkins

---

## Production Configuration

### 1. Environment Variables

Create `.env.production`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/tburn_mainnet
PGHOST=your-neon-host.neon.tech
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=tburn_mainnet

# Session
SESSION_SECRET=your-256-bit-secret-key-here

# Application
NODE_ENV=production
PORT=3000

# Security
DEMO_MODE=false
PASSWORD=your-production-password

# CORS
ALLOWED_ORIGINS=https://explorer.tburn.io,https://www.tburn.io

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
```

### 2. Config Files

Update `config/mainnet.toml`:
```toml
[deployment]
environment = "production"
demo_mode = false

[api.endpoints]
explorer = "https://explorer.tburn.io"
rpc = "https://rpc.tburn.io"
websocket = "wss://ws.tburn.io"
```

---

## Deployment Options

### Option 1: AWS Deployment

#### Architecture
```
┌─────────────┐
│  Route 53   │ DNS
└──────┬──────┘
       │
┌──────▼──────┐
│  CloudFront │ CDN
└──────┬──────┘
       │
┌──────▼──────┐
│     ALB     │ Load Balancer
└──────┬──────┘
       │
┌──────▼──────┐
│   ECS/EC2   │ Application
└──────┬──────┘
       │
┌──────▼──────┐
│     RDS     │ PostgreSQL
└─────────────┘
```

#### 1. Database Setup (RDS PostgreSQL)
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier tburn-mainnet \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxx
```

#### 2. Application Deployment (ECS)
```yaml
# ecs-task-definition.json
{
  "family": "tburn-explorer",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "tburn-explorer",
      "image": "your-registry/tburn-explorer:latest",
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
          "valueFrom": "arn:aws:secretsmanager:..."
        }
      ]
    }
  ]
}
```

Deploy:
```bash
# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json

# Create service
aws ecs create-service \
  --cluster tburn-cluster \
  --service-name tburn-explorer \
  --task-definition tburn-explorer \
  --desired-count 3 \
  --launch-type FARGATE
```

#### 3. Load Balancer Setup
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name tburn-explorer-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

# Create target group
aws elbv2 create-target-group \
  --name tburn-explorer-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx
```

---

### Option 2: GCP Deployment

#### Architecture
```
┌─────────────┐
│ Cloud DNS   │ DNS
└──────┬──────┘
       │
┌──────▼──────┐
│ Cloud CDN   │ CDN
└──────┬──────┘
       │
┌──────▼──────┐
│  Cloud Run  │ Application
└──────┬──────┘
       │
┌──────▼──────┐
│ Cloud SQL   │ PostgreSQL
└─────────────┘
```

#### 1. Database Setup (Cloud SQL)
```bash
gcloud sql instances create tburn-mainnet \
  --database-version=POSTGRES_16 \
  --tier=db-custom-2-8192 \
  --region=us-central1

gcloud sql databases create tburn_explorer \
  --instance=tburn-mainnet
```

#### 2. Application Deployment (Cloud Run)
```bash
# Build container
gcloud builds submit --tag gcr.io/your-project/tburn-explorer

# Deploy
gcloud run deploy tburn-explorer \
  --image gcr.io/your-project/tburn-explorer \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=database-url:latest \
  --min-instances 3 \
  --max-instances 20
```

---

### Option 3: Azure Deployment

#### 1. Database Setup (Azure Database for PostgreSQL)
```bash
az postgres flexible-server create \
  --resource-group tburn-rg \
  --name tburn-mainnet \
  --location eastus \
  --admin-user admin \
  --admin-password your-password \
  --sku-name Standard_D2s_v3 \
  --tier GeneralPurpose \
  --storage-size 128
```

#### 2. Application Deployment (App Service)
```bash
# Create App Service Plan
az appservice plan create \
  --name tburn-plan \
  --resource-group tburn-rg \
  --sku P1V2 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group tburn-rg \
  --plan tburn-plan \
  --name tburn-explorer \
  --runtime "NODE:20-lts"

# Configure environment variables
az webapp config appsettings set \
  --resource-group tburn-rg \
  --name tburn-explorer \
  --settings NODE_ENV=production DATABASE_URL=your-connection-string
```

---

## Build & Deploy Process

### 1. Build Application
```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Database migration
npm run db:push
```

### 2. Docker Build
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

Build:
```bash
docker build -t tburn-explorer:latest .
docker push your-registry/tburn-explorer:latest
```

---

## Database Migration

### Initial Setup
```bash
# Push schema to database
npm run db:push --force

# Seed database (demo data)
npm run seed
```

### Production Migration
```bash
# Backup database first!
pg_dump -h your-host -U your-user -d tburn_mainnet > backup.sql

# Apply schema changes
npm run db:push

# Verify
psql -h your-host -U your-user -d tburn_mainnet -c "SELECT COUNT(*) FROM blocks;"
```

---

## Monitoring & Logging

### Prometheus Metrics
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'tburn-explorer'
    static_configs:
      - targets: ['localhost:9090']
```

### Grafana Dashboard
Import dashboard from: `config/grafana-dashboard.json`

### Application Logs
```bash
# View logs
docker logs -f tburn-explorer

# AWS CloudWatch
aws logs tail /aws/ecs/tburn-explorer --follow

# GCP Cloud Logging
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

---

## Security Checklist

- [ ] Enable HTTPS/TLS with valid certificate
- [ ] Configure firewall rules (allow 443, deny others)
- [ ] Set strong `SESSION_SECRET` (256-bit random)
- [ ] Enable rate limiting (1000 req/min)
- [ ] Configure CORS allowed origins
- [ ] Enable database encryption at rest
- [ ] Set up database backups (daily)
- [ ] Configure DDoS protection (CloudFlare)
- [ ] Enable audit logging
- [ ] Set up intrusion detection (AWS GuardDuty, GCP Security Command Center)

---

## Performance Optimization

### CDN Configuration
```nginx
# CloudFront / CloudFlare
Cache-Control: public, max-age=3600
ETag: "version-hash"
Expires: Thu, 31 Dec 2037 23:55:55 GMT
```

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_blocks_number ON blocks(number);
CREATE INDEX idx_transactions_hash ON transactions(hash);
CREATE INDEX idx_transactions_from ON transactions("from");
CREATE INDEX idx_validators_address ON validators(address);
```

### Auto-Scaling
```yaml
# AWS ECS Auto-Scaling
scaling_policy:
  target_tracking:
    target_value: 70
    metric: CPUUtilization
  min_capacity: 3
  max_capacity: 20
```

---

## Backup & Disaster Recovery

### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE | \
  gzip > backups/tburn_${DATE}.sql.gz

# Upload to S3
aws s3 cp backups/tburn_${DATE}.sql.gz s3://tburn-backups/
```

### Restore
```bash
# Download backup
aws s3 cp s3://tburn-backups/tburn_20250101_120000.sql.gz .

# Restore
gunzip < tburn_20250101_120000.sql.gz | \
  psql -h $PGHOST -U $PGUSER -d $PGDATABASE
```

---

## Troubleshooting

### Connection Issues
```bash
# Test database connection
psql -h $PGHOST -U $PGUSER -d $PGDATABASE

# Test WebSocket
wscat -c wss://explorer.tburn.io/ws
```

### High Memory Usage
```bash
# Check container resources
docker stats tburn-explorer

# Increase memory limit
docker run --memory=4g tburn-explorer
```

### Slow Queries
```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- View slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## Support

- **Documentation**: https://docs.tburn.io
- **Email**: ops@tburn.io
- **Discord**: https://discord.gg/tburn
- **GitHub Issues**: https://github.com/tburn/explorer/issues
