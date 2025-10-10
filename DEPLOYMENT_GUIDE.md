# EagleAI Deployment Guide

## Overview

This guide covers deployment options for the EagleAI platform across different environments and hosting providers.

---

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Linux (Ubuntu 20.04+), macOS, or Windows

#### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Linux (Ubuntu 22.04 LTS)

### Software Dependencies
- **Node.js**: 18.x or higher
- **Python**: 3.9 or higher
- **MongoDB**: 5.0 or higher
- **Docker**: 20.x or higher (optional)
- **Git**: Latest version

---

## Local Development Deployment

### 1. Clone Repository
```bash
git clone <repository-url>
cd eagleAI
```

### 2. Install Dependencies

#### Frontend
```bash
npm install
```

#### Node.js Backend
```bash
cd backend
npm install
```

#### Python Backend
```bash
cd backend_python
pip install -r requirements.txt
```

### 3. Environment Setup
```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env
cp backend_python/.env.example backend_python/.env

# Edit environment files with your values
nano .env
nano backend/.env
nano backend_python/.env
```

### 4. Database Setup
```bash
# Start MongoDB (if not running)
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start Services

#### Option A: Manual Start
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Node.js Backend
cd backend
npm run dev

# Terminal 3: Python Backend
cd backend_python
python run.py
```

#### Option B: Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 6. Access Application
- **Frontend**: http://localhost:5173
- **Node.js API**: http://localhost:3001
- **Python API**: http://localhost:3001 (alternative port)
- **API Docs**: http://localhost:3001/docs (Python backend)

---

## Production Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend Deployment (Vercel)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all `VITE_*` variables from `.env`

3. **Build Configuration**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

#### Backend Deployment (Railway)

1. **Node.js Backend**
   ```bash
   # Connect to Railway
   railway login
   railway init
   
   # Deploy
   railway up
   ```

2. **Environment Variables**
   - Add all backend environment variables in Railway dashboard
   - Set `NODE_ENV=production`
   - Configure MongoDB connection string

3. **Python Backend**
   ```bash
   # Create railway.toml
   [build]
   builder = "nixpacks"
   
   [deploy]
   startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
   ```

### Option 2: AWS Deployment

#### Frontend (S3 + CloudFront)

1. **Build and Upload**
   ```bash
   # Build for production
   npm run build
   
   # Upload to S3
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

2. **CloudFront Configuration**
   - Create CloudFront distribution
   - Set S3 as origin
   - Configure custom domain
   - Set up SSL certificate

#### Backend (ECS + RDS)

1. **Create ECS Cluster**
   ```bash
   # Create cluster
   aws ecs create-cluster --cluster-name eagleai-cluster
   ```

2. **Create Task Definition**
   ```json
   {
     "family": "eagleai-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "containerDefinitions": [
       {
         "name": "eagleai-backend",
         "image": "your-ecr-repo/eagleai-backend:latest",
         "portMappings": [
           {
             "containerPort": 3001,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ]
       }
     ]
   }
   ```

3. **Create Service**
   ```bash
   aws ecs create-service \
     --cluster eagleai-cluster \
     --service-name eagleai-backend-service \
     --task-definition eagleai-backend:1 \
     --desired-count 2
   ```

#### Database (DocumentDB)

1. **Create DocumentDB Cluster**
   ```bash
   aws docdb create-db-cluster \
     --db-cluster-identifier eagleai-docdb \
     --engine docdb \
     --master-username admin \
     --master-user-password your-password
   ```

### Option 3: DigitalOcean App Platform

#### Frontend Deployment

1. **Create App**
   - Connect GitHub repository
   - Select "Static Site" type
   - Set build command: `npm run build`
   - Set output directory: `dist`

2. **Environment Variables**
   - Add all `VITE_*` variables
   - Set `NODE_ENV=production`

#### Backend Deployment

1. **Create App**
   - Select "Web Service" type
   - Choose Node.js runtime
   - Set build command: `npm install`
   - Set run command: `npm start`

2. **Database**
   - Create managed MongoDB cluster
   - Configure connection string

### Option 4: Docker Deployment

#### Docker Compose Production

1. **Create Production Compose File**
   ```yaml
   version: '3.8'
   services:
     frontend:
       build: .
       ports:
         - "80:80"
       environment:
         - NODE_ENV=production
       depends_on:
         - backend
     
     backend:
       build: ./backend
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/eagleai-jobs
       depends_on:
         - mongo
     
     python-backend:
       build: ./backend_python
       ports:
         - "3002:3001"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/eagleai-jobs
       depends_on:
         - mongo
     
     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db
   
   volumes:
     mongo_data:
   ```

2. **Deploy**
   ```bash
   # Build and start
   docker-compose -f docker-compose.prod.yml up -d
   
   # View logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

---

## Environment-Specific Configurations

### Development Environment
```bash
# Frontend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
VITE_PYTHON_API_URL=http://localhost:3001

# Backend
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eagleai-jobs
FRONTEND_URL=http://localhost:5173
```

### Staging Environment
```bash
# Frontend
VITE_API_URL=https://api-staging.eagleai.com
VITE_WS_URL=wss://api-staging.eagleai.com
VITE_PYTHON_API_URL=https://resume-staging.eagleai.com

# Backend
NODE_ENV=staging
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eagleai-staging
FRONTEND_URL=https://staging.eagleai.com
```

### Production Environment
```bash
# Frontend
VITE_API_URL=https://api.eagleai.com
VITE_WS_URL=wss://api.eagleai.com
VITE_PYTHON_API_URL=https://resume.eagleai.com

# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eagleai-prod
FRONTEND_URL=https://eagleai.com
```

---

## Database Migration

### MongoDB Setup

1. **Create Database**
   ```javascript
   use eagleai-jobs
   ```

2. **Create Collections**
   ```javascript
   db.createCollection("jobs")
   db.createCollection("students")
   db.createCollection("notifications")
   ```

3. **Create Indexes**
   ```javascript
   // Jobs collection
   db.jobs.createIndex({ "title": "text", "description": "text" })
   db.jobs.createIndex({ "category": 1 })
   db.jobs.createIndex({ "location": 1 })
   db.jobs.createIndex({ "postedDate": -1 })
   
   // Students collection
   db.students.createIndex({ "email": 1 }, { unique: true })
   db.students.createIndex({ "skills": 1 })
   
   // Notifications collection
   db.notifications.createIndex({ "studentId": 1 })
   db.notifications.createIndex({ "createdAt": -1 })
   ```

---

## SSL/TLS Configuration

### Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d eagleai.com -d www.eagleai.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name eagleai.com www.eagleai.com;
    
    ssl_certificate /etc/letsencrypt/live/eagleai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eagleai.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Frontend
    location / {
        root /var/www/eagleai/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Monitoring and Logging

### Application Monitoring

1. **Health Checks**
   ```bash
   # Frontend health
   curl http://eagleai.com/health
   
   # Backend health
   curl http://api.eagleai.com/health
   ```

2. **Log Monitoring**
   ```bash
   # View logs
   tail -f /var/log/eagleai/eagleai.log
   
   # Log rotation
   logrotate /etc/logrotate.d/eagleai
   ```

### Performance Monitoring

1. **Node.js Backend**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start with PM2
   pm2 start backend/server.js --name eagleai-backend
   
   # Monitor
   pm2 monit
   ```

2. **Python Backend**
   ```bash
   # Install Gunicorn
   pip install gunicorn
   
   # Start with Gunicorn
   gunicorn -w 4 -b 0.0.0.0:3001 main:app
   ```

---

## Backup and Recovery

### Database Backup
```bash
# Create backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/eagleai-prod" --out=/backup/eagleai-$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/eagleai-prod" /backup/eagleai-20240101
```

### File Backup
```bash
# Backup uploaded files
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /var/uploads/eagleai/

# Restore files
tar -xzf /backup/uploads-20240101.tar.gz -C /
```

---

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3001
   
   # Kill process
   sudo kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Test MongoDB connection
   mongo "mongodb+srv://user:pass@cluster.mongodb.net/eagleai-prod"
   
   # Check network connectivity
   telnet cluster.mongodb.net 27017
   ```

3. **Build Failures**
   ```bash
   # Clear cache
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R www-data:www-data /var/www/eagleai
   sudo chmod -R 755 /var/www/eagleai
   ```

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm run dev

# Verbose logging
NODE_ENV=development LOG_LEVEL=debug npm start
```

---

## Security Checklist

### Pre-Deployment
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] Database credentials strong
- [ ] SSL certificates valid
- [ ] Firewall configured
- [ ] Dependencies updated

### Post-Deployment
- [ ] Health checks passing
- [ ] SSL certificate working
- [ ] API endpoints accessible
- [ ] Database connections stable
- [ ] Logs being generated
- [ ] Monitoring alerts configured

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancers for multiple backend instances
- Implement database sharding for large datasets
- Use CDN for static assets
- Consider microservices architecture

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement caching (Redis)
- Use connection pooling

---

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Review and clean logs weekly
- [ ] Monitor disk space daily
- [ ] Test backup restoration monthly

### Updates
```bash
# Update dependencies
npm update
pip install --upgrade -r requirements.txt

# Rebuild and redeploy
npm run build
docker-compose up -d --build
```
