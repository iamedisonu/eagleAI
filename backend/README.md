# EagleAI Job Scraper & Matching System

A comprehensive backend system for automated job scraping from intern-list.com and AI-powered resume matching for students.

## Features

- **Automated Job Scraping**: Scrapes job postings from intern-list.com and other sources
- **AI-Powered Matching**: Uses Google AI to match student resumes with relevant jobs
- **Real-time Notifications**: WebSocket-based notifications for job matches
- **RESTful API**: Complete API for job data, student profiles, and notifications
- **Scheduled Tasks**: Automated scraping and matching via cron jobs
- **Scalable Architecture**: Docker-based deployment with MongoDB and Redis

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- Redis (optional, for caching)
- Google AI API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or install locally
   # Follow MongoDB installation guide for your OS
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Jobs
- `GET /api/jobs` - List jobs with filtering and pagination
- `GET /api/jobs/:id` - Get specific job details
- `GET /api/jobs/search` - Search jobs by keywords
- `POST /api/jobs/scrape` - Trigger manual job scraping

### Students
- `GET /api/students` - List students
- `POST /api/students` - Create new student
- `GET /api/students/:id/matches` - Get job matches for student
- `POST /api/students/:id/analyze-resume` - Analyze student resume

### Notifications
- `GET /api/notifications` - List notifications for student
- `PUT /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/mark-all-read` - Mark all notifications as read

### Matching
- `POST /api/matching/match` - Trigger manual matching process
- `GET /api/matching/stats` - Get matching statistics
- `GET /api/matching/students/:id/recommendations` - Get job recommendations

## Scripts

### Manual Job Scraping
```bash
# Scrape all sources
npm run scrape

# Scrape specific source
node scripts/scraper.js --source=intern-list

# Dry run (no database changes)
node scripts/scraper.js --dry-run --verbose
```

### Manual Resume Matching
```bash
# Match all students
npm run match

# Match specific student
node scripts/matcher.js --student-id=STUDENT_ID

# Dry run
node scripts/matcher.js --dry-run --verbose
```

## Docker Deployment

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Individual Services
```bash
# Build image
docker build -t eagleai-backend .

# Run container
docker run -d \
  --name eagleai-backend \
  -p 3001:3001 \
  -e MONGODB_URI=mongodb://localhost:27017/eagleai-jobs \
  -e GOOGLE_AI_API_KEY=your_key_here \
  eagleai-backend
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/eagleai-jobs |
| `GOOGLE_AI_API_KEY` | Google AI API key | Required |
| `NODE_ENV` | Environment | development |
| `SCRAPING_INTERVAL` | Scraping interval (ms) | 3600000 (1 hour) |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit per window | 100 |

### Scheduled Tasks

The system includes automated scheduled tasks:

- **Job Scraping**: Every hour (`0 * * * *`)
- **Resume Matching**: Every 2 hours (`0 */2 * * *`)
- **Notification Cleanup**: Daily (`0 0 * * *`)

## Database Schema

### Jobs Collection
```javascript
{
  title: String,
  company: String,
  location: String,
  description: String,
  applicationUrl: String,
  skills: [String],
  categories: [String],
  jobType: String,
  matchScore: Number,
  matchedStudents: [{
    studentId: ObjectId,
    matchScore: Number,
    matchedAt: Date
  }]
}
```

### Students Collection
```javascript
{
  name: String,
  email: String,
  university: String,
  major: String,
  resumeText: String,
  skills: [{
    name: String,
    level: Number
  }],
  jobMatches: [{
    jobId: ObjectId,
    matchScore: Number,
    status: String
  }]
}
```

## Monitoring & Logging

### Logs
- Application logs: `logs/app.log`
- Error logs: `logs/error.log`
- Log rotation: 5MB max, 5 files kept

### Health Checks
- API health: `GET /health`
- Database connectivity
- Service status monitoring

## Development

### Project Structure
```
backend/
├── models/           # Mongoose schemas
├── routes/           # Express routes
├── services/         # Business logic
├── scripts/          # Standalone scripts
├── utils/            # Utilities
├── logs/             # Log files
└── server.js         # Main server file
```

### Adding New Job Sources

1. Create a new scraper method in `JobScraper.js`
2. Add the source to `scrapeAllSources()`
3. Update the `source` enum in the Job model
4. Test with `--source=your-source` flag

### Adding New Matching Criteria

1. Modify `ResumeMatcher.js`
2. Update the `calculateMatchScore()` method
3. Add new scoring factors
4. Test with sample data

## Troubleshooting

### Common Issues

1. **Puppeteer fails to launch**
   - Ensure Chromium is installed
   - Check Docker configuration
   - Verify system dependencies

2. **MongoDB connection issues**
   - Check connection string
   - Verify MongoDB is running
   - Check authentication credentials

3. **Google AI API errors**
   - Verify API key is correct
   - Check rate limits
   - Review API quotas

### Debug Mode
```bash
# Enable verbose logging
NODE_ENV=development LOG_LEVEL=debug npm run dev

# Or use script flags
node scripts/scraper.js --verbose
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

