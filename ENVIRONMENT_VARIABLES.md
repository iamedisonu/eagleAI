# EagleAI Environment Variables

## Overview

This document describes all environment variables used across the EagleAI platform components.

---

## Frontend Environment Variables

### Vite Configuration
Located in `.env` file in the root directory.

```bash
# Vite Development Server
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
VITE_PYTHON_API_URL=http://localhost:3001

# Google AI Integration
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Application Configuration
VITE_APP_NAME=EagleAI
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

### Production Environment
For production builds, these variables are embedded at build time:

```bash
# Production API URLs
VITE_API_URL=https://api.eagleai.com
VITE_WS_URL=wss://api.eagleai.com
VITE_PYTHON_API_URL=https://resume.eagleai.com

# Production Google AI Key
VITE_GOOGLE_AI_API_KEY=prod_google_ai_key
```

---

## Node.js Backend Environment Variables

### Core Configuration
Located in `backend/.env` file.

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eagleai-jobs
MONGODB_DB_NAME=eagleai-jobs

# Security Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Google AI Integration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Job Scraping Configuration
SCRAPING_ENABLED=true
SCRAPING_INTERVAL_HOURS=1
SCRAPING_SOURCES=linkedin,indeed,glassdoor

# LinkedIn Scraping (if using LinkedIn API)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Indeed Scraping
INDEED_API_KEY=your_indeed_api_key
INDEED_PARTNER_ID=your_indeed_partner_id

# Glassdoor Scraping
GLASSDOOR_API_KEY=your_glassdoor_api_key

# Matching Algorithm Configuration
MATCHING_SKILLS_WEIGHT=0.7
MATCHING_EXPERIENCE_WEIGHT=0.15
MATCHING_JOB_TYPE_WEIGHT=0.1
MATCHING_LOCATION_WEIGHT=0.05
MATCHING_MIN_THRESHOLD=60

# Notification Configuration
NOTIFICATION_RETENTION_DAYS=30
NOTIFICATION_CLEANUP_HOURS=24

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/eagleai.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# WebSocket Configuration
WS_CORS_ORIGIN=http://localhost:5173
WS_PING_TIMEOUT=60000
WS_PING_INTERVAL=25000
```

### Production Environment
```bash
# Production Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://eagleai.com

# Production Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eagleai-jobs
MONGODB_DB_NAME=eagleai-jobs

# Production Security
JWT_SECRET=production_jwt_secret_key
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Production Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Production Google AI
GOOGLE_AI_API_KEY=production_google_ai_key

# Production Scraping
SCRAPING_ENABLED=true
SCRAPING_INTERVAL_HOURS=1

# Production Logging
LOG_LEVEL=warn
LOG_FILE=/var/log/eagleai/eagleai.log
```

---

## Python Backend Environment Variables

### Core Configuration
Located in `backend_python/.env` file.

```bash
# Server Configuration
PORT=3001
HOST=0.0.0.0
ENVIRONMENT=development
DEBUG=true

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eagleai-jobs
MONGODB_DB_NAME=eagleai-jobs

# File Upload Configuration
UPLOAD_DIR=uploads/resumes
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=pdf

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_ALLOW_CREDENTIALS=true

# Resume Analysis Configuration
ANALYSIS_MODEL=gemini-pro
ANALYSIS_CONFIDENCE_THRESHOLD=0.7
ANALYSIS_MAX_TOKENS=1000

# Google AI Integration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Logging Configuration
LOG_LEVEL=INFO
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s
LOG_FILE=logs/python_backend.log

# Security Configuration
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Cleanup Configuration
CLEANUP_INTERVAL_HOURS=24
CLEANUP_OLD_FILES_DAYS=30
```

### Production Environment
```bash
# Production Server Configuration
PORT=3001
HOST=0.0.0.0
ENVIRONMENT=production
DEBUG=false

# Production Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eagleai-jobs
MONGODB_DB_NAME=eagleai-jobs

# Production File Upload
UPLOAD_DIR=/var/uploads/eagleai/resumes
MAX_FILE_SIZE=5242880

# Production CORS
CORS_ORIGINS=https://eagleai.com,https://www.eagleai.com

# Production Google AI
GOOGLE_AI_API_KEY=production_google_ai_key

# Production Logging
LOG_LEVEL=WARNING
LOG_FILE=/var/log/eagleai/python_backend.log

# Production Security
SECRET_KEY=production_secret_key
```

---

## Docker Environment Variables

### Docker Compose Configuration
Located in `docker-compose.yml` and `backend/.env`.

```bash
# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=eagleai-jobs

# Node.js Backend
NODE_ENV=production
MONGODB_URI=mongodb://mongo:27017/eagleai-jobs
FRONTEND_URL=http://localhost:5173

# Python Backend
MONGODB_URI=mongodb://mongo:27017/eagleai-jobs
UPLOAD_DIR=/app/uploads/resumes

# Nginx Configuration
NGINX_WORKER_PROCESSES=auto
NGINX_WORKER_CONNECTIONS=1024
```

---

## Environment-Specific Configurations

### Development Environment
```bash
# All services run locally
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Staging Environment
```bash
# Staging server configuration
NODE_ENV=staging
DEBUG=false
LOG_LEVEL=info
CORS_ORIGINS=https://staging.eagleai.com
```

### Production Environment
```bash
# Production server configuration
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn
CORS_ORIGINS=https://eagleai.com,https://www.eagleai.com
```

---

## Required Environment Variables

### Minimum Required Variables

#### Frontend
- `VITE_API_URL` - Backend API URL
- `VITE_GOOGLE_AI_API_KEY` - Google AI API key

#### Node.js Backend
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_AI_API_KEY` - Google AI API key

#### Python Backend
- `MONGODB_URI` - MongoDB connection string
- `GOOGLE_AI_API_KEY` - Google AI API key
- `SECRET_KEY` - Application secret key

---

## Environment Variable Validation

### Node.js Backend
The server validates required environment variables on startup:

```javascript
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GOOGLE_AI_API_KEY'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### Python Backend
Environment variables are validated using Pydantic:

```python
from pydantic import BaseSettings

class Settings(BaseSettings):
    mongodb_uri: str
    google_ai_api_key: str
    secret_key: str
    
    class Config:
        env_file = ".env"
```

---

## Security Considerations

### Sensitive Variables
These variables should never be committed to version control:

- `JWT_SECRET`
- `GOOGLE_AI_API_KEY`
- `MONGODB_URI` (with credentials)
- `SECRET_KEY`
- Any API keys or passwords

### Environment File Security
- Use `.env` files for local development
- Use secure secret management in production (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate secrets regularly
- Use different secrets for different environments

---

## Environment Setup Scripts

### Development Setup
```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env
cp backend_python/.env.example backend_python/.env

# Edit environment files with your values
# Start services
npm run dev
```

### Production Setup
```bash
# Set environment variables in your deployment platform
# Or use a secrets management service
# Deploy using Docker or your preferred method
```

---

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check that all required variables are set
   - Verify `.env` files are in the correct locations
   - Ensure environment variables are loaded before application startup

2. **Database Connection Issues**
   - Verify `MONGODB_URI` is correct
   - Check database server is running
   - Verify network connectivity

3. **CORS Issues**
   - Check `CORS_ORIGINS` includes your frontend URL
   - Verify `FRONTEND_URL` matches your frontend domain

4. **API Key Issues**
   - Verify Google AI API key is valid
   - Check API key has necessary permissions
   - Ensure API key is not expired

### Debug Mode
Enable debug mode for detailed logging:

```bash
# Node.js Backend
DEBUG=true npm run dev

# Python Backend
DEBUG=true python run.py
```
