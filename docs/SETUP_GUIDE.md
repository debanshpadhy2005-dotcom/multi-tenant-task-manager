# TaskMaster - Complete Setup Guide

This guide provides step-by-step instructions for setting up the TaskMaster application in different environments.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Development Setup](#development-setup)
3. [Production Deployment](#production-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB free space
- **OS**: Linux, macOS, or Windows 10+

### Software Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v13 or higher
- **Docker**: v20.10+ (optional)
- **Docker Compose**: v2.0+ (optional)

## Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd multi_tenant_task_manager
```

### Step 2: Install PostgreSQL

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### On macOS:
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### On Windows:
Download and install from https://www.postgresql.org/download/windows/

### Step 3: Create Database

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE taskmaster_db;
CREATE USER taskmaster_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE taskmaster_db TO taskmaster_user;
\q
```

### Step 4: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor

# Run database migrations
npm run migrate

# Seed sample data (optional)
npm run seed

# Start development server
npm run dev
```

The backend should now be running on http://localhost:5000

### Step 5: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env

# Start development server
npm run dev
```

The frontend should now be running on http://localhost:3000

### Step 6: Verify Installation

1. Open http://localhost:3000 in your browser
2. Register a new organization
3. Login with the created credentials
4. Create a test task

## Production Deployment

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker installed
- Docker Compose installed

#### Steps

1. **Prepare environment**
```bash
cp .env.example .env
# Edit .env with production values
# IMPORTANT: Change all secrets!
```

2. **Build and start services**
```bash
docker-compose up -d --build
```

3. **Run migrations**
```bash
docker-compose exec backend npm run migrate
```

4. **Check service status**
```bash
docker-compose ps
docker-compose logs -f
```

5. **Access application**
- Frontend: http://your-domain:3000
- Backend: http://your-domain:5000
- API Docs: http://your-domain:5000/api/docs

### Option 2: Manual Production Deployment

#### Backend Deployment

1. **Build application**
```bash
cd backend
npm install --production
npm run build
```

2. **Install PM2 (Process Manager)**
```bash
npm install -g pm2
```

3. **Start application**
```bash
pm2 start dist/server.js --name taskmaster-api
pm2 save
pm2 startup
```

4. **Setup Nginx reverse proxy**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Frontend Deployment

1. **Build application**
```bash
cd frontend
npm install
npm run build
```

2. **Setup Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/taskmaster/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

3. **Copy build files**
```bash
sudo mkdir -p /var/www/taskmaster/frontend
sudo cp -r dist/* /var/www/taskmaster/frontend/
```

4. **Restart Nginx**
```bash
sudo systemctl restart nginx
```

### Option 3: Cloud Platform Deployment

#### Deploy to Render

1. **Backend (Web Service)**
   - Connect GitHub repository
   - Select backend directory
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/server.js`
   - Add environment variables

2. **Frontend (Static Site)**
   - Connect GitHub repository
   - Select frontend directory
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

3. **Database**
   - Create PostgreSQL database on Render
   - Copy connection string to backend environment

#### Deploy to AWS

1. **Backend (ECS/Fargate)**
   - Push Docker image to ECR
   - Create ECS task definition
   - Create ECS service
   - Configure load balancer

2. **Frontend (S3 + CloudFront)**
   - Build frontend
   - Upload to S3 bucket
   - Configure CloudFront distribution

3. **Database (RDS)**
   - Create PostgreSQL RDS instance
   - Configure security groups
   - Update backend connection string

## Database Setup

### Schema Migration

The database schema is automatically created when you run:

```bash
npm run migrate
```

This creates:
- Tenants table
- Users table
- Roles table
- Tasks table
- Activity logs table
- Notifications table
- Refresh tokens table

### Seed Data

To populate the database with sample data:

```bash
npm run seed
```

This creates:
- 2 sample organizations
- Multiple users with different roles
- Sample tasks
- Activity logs
- Notifications

### Manual Database Operations

#### Backup Database
```bash
pg_dump -U taskmaster_user taskmaster_db > backup.sql
```

#### Restore Database
```bash
psql -U taskmaster_user taskmaster_db < backup.sql
```

#### Reset Database
```bash
# Drop and recreate
dropdb taskmaster_db
createdb taskmaster_db
npm run migrate
npm run seed
```

## Environment Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmaster_db
DB_USER=taskmaster_user
DB_PASSWORD=your_secure_password

# JWT (CHANGE THESE!)
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Optional: OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Redis
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### Frontend Environment Variables

```env
VITE_API_URL=https://api.yourdomain.com/api/v1
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (min 32 characters)
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database SSL
- [ ] Regular security updates
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Review and limit API rate limits

## Troubleshooting

### Backend Issues

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Test connection
psql -U taskmaster_user -d taskmaster_db -h localhost
```

#### Migration Errors
```bash
# Check database exists
psql -U postgres -c "\l"

# Manually run schema
psql -U taskmaster_user -d taskmaster_db -f backend/src/database/schema.sql
```

### Frontend Issues

#### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### API Connection Issues
```bash
# Check backend is running
curl http://localhost:5000/api/v1/health

# Check CORS configuration
# Ensure CORS_ORIGIN in backend .env matches frontend URL
```

### Docker Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

#### Database Connection in Docker
```bash
# Ensure services are on same network
docker network ls
docker network inspect taskmaster-network

# Check database is ready
docker-compose exec postgres pg_isready
```

### Common Errors

#### "JWT malformed"
- Check Authorization header format: `Bearer <token>`
- Verify JWT secrets match between requests

#### "Cross-tenant access denied"
- User trying to access resources from different organization
- Check tenantId in JWT payload

#### "Insufficient permissions"
- User role doesn't have required permission
- Check role permissions in database

## Performance Tuning

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_tasks_tenant_status 
ON tasks(tenant_id, status) WHERE deleted_at IS NULL;

-- Analyze tables
ANALYZE tasks;
ANALYZE users;
```

### Backend Optimization

```javascript
// Enable compression
app.use(compression());

// Increase connection pool
max: 50  // in database config
```

### Frontend Optimization

```bash
# Build with optimization
npm run build

# Analyze bundle size
npm run build -- --analyze
```

## Monitoring

### Application Logs

```bash
# Backend logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Docker logs
docker-compose logs -f backend
```

### Database Monitoring

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Health Checks

```bash
# Backend health
curl http://localhost:5000/api/v1/health

# Database health
docker-compose exec postgres pg_isready
```

## Maintenance

### Regular Tasks

1. **Daily**
   - Monitor error logs
   - Check disk space
   - Review failed requests

2. **Weekly**
   - Database backup
   - Security updates
   - Performance review

3. **Monthly**
   - Clean old logs
   - Database optimization
   - Security audit

### Backup Strategy

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U taskmaster_user taskmaster_db > backup_$DATE.sql
# Upload to S3 or backup server
```

## Support

For additional help:
- Check API documentation: http://localhost:5000/api/docs
- Review application logs
- Check GitHub issues
- Contact support team

---

**Last Updated**: 2026-04-22
