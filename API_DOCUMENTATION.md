# EagleAI API Documentation

## Overview

EagleAI provides two backend APIs for different functionalities:

1. **Node.js Backend** (Port 3001): Job scraping, matching, and real-time notifications
2. **Python Backend** (Port 3001): Resume management and analysis

## Base URLs

- **Node.js Backend**: `http://localhost:3001`
- **Python Backend**: `http://localhost:3001` (alternative port)

---

## Node.js Backend API

### Authentication
Currently uses mock authentication. In production, implement JWT or OAuth2.

### Jobs API

#### GET /api/jobs
Get all job postings with optional filtering.

**Query Parameters:**
- `category` (string): Filter by job category
- `jobType` (string): Filter by job type (internship, full-time, part-time, contract)
- `location` (string): Filter by location
- `minMatchScore` (number): Minimum match score (0-100)
- `isRemote` (boolean): Filter for remote jobs
- `page` (number): Page number for pagination
- `limit` (number): Number of results per page

**Response:**
```json
{
  "jobs": [
    {
      "id": "string",
      "title": "string",
      "company": "string",
      "location": "string",
      "jobType": "string",
      "category": "string",
      "description": "string",
      "requirements": ["string"],
      "salary": "string",
      "postedDate": "ISO 8601 string",
      "source": "string",
      "externalUrl": "string",
      "isActive": true,
      "matchScore": 85
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### GET /api/jobs/:id
Get specific job details.

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "company": "string",
  "location": "string",
  "jobType": "string",
  "category": "string",
  "description": "string",
  "requirements": ["string"],
  "salary": "string",
  "postedDate": "ISO 8601 string",
  "source": "string",
  "externalUrl": "string",
  "isActive": true,
  "matchScore": 85
}
```

#### POST /api/jobs
Create new job posting (Admin only).

**Request Body:**
```json
{
  "title": "string",
  "company": "string",
  "location": "string",
  "jobType": "string",
  "category": "string",
  "description": "string",
  "requirements": ["string"],
  "salary": "string",
  "source": "string",
  "externalUrl": "string"
}
```

### Students API

#### GET /api/students
Get list of students.

**Response:**
```json
{
  "students": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "university": "string",
      "major": "string",
      "graduationYear": 2024,
      "skills": ["string"],
      "interests": ["string"],
      "careerGoals": ["string"],
      "isActive": true,
      "createdAt": "ISO 8601 string"
    }
  ]
}
```

#### GET /api/students/:id
Get specific student profile.

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "university": "string",
  "major": "string",
  "graduationYear": 2024,
  "skills": ["string"],
  "interests": ["string"],
  "careerGoals": ["string"],
  "jobPreferences": {
    "categories": ["string"],
    "jobTypes": ["string"],
    "locations": ["string"],
    "minSalary": 50000,
    "isRemote": true
  },
  "resumeText": "string",
  "resumeAnalysis": {
    "overallScore": 8.5,
    "categoryScores": {},
    "strengths": ["string"],
    "improvements": ["string"]
  },
  "isActive": true,
  "createdAt": "ISO 8601 string",
  "lastLogin": "ISO 8601 string"
}
```

#### POST /api/students
Create new student profile.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "university": "string",
  "major": "string",
  "graduationYear": 2024,
  "skills": ["string"],
  "interests": ["string"],
  "careerGoals": ["string"],
  "jobPreferences": {
    "categories": ["string"],
    "jobTypes": ["string"],
    "locations": ["string"],
    "minSalary": 50000,
    "isRemote": true
  }
}
```

### Matching API

#### POST /api/matching/analyze
Match resume with available jobs.

**Request Body:**
```json
{
  "studentId": "string",
  "resumeText": "string",
  "jobPreferences": {
    "categories": ["string"],
    "jobTypes": ["string"],
    "locations": ["string"],
    "minSalary": 50000,
    "isRemote": true
  }
}
```

**Response:**
```json
{
  "matches": [
    {
      "jobId": "string",
      "matchScore": 85,
      "reasons": ["string"],
      "job": {
        "id": "string",
        "title": "string",
        "company": "string",
        "location": "string"
      }
    }
  ],
  "totalMatches": 10,
  "analysisTime": "2024-01-01T00:00:00Z"
}
```

#### GET /api/matching/:studentId
Get student's job matches.

**Response:**
```json
{
  "matches": [
    {
      "jobId": "string",
      "matchScore": 85,
      "reasons": ["string"],
      "job": {
        "id": "string",
        "title": "string",
        "company": "string",
        "location": "string"
      }
    }
  ],
  "lastUpdated": "ISO 8601 string"
}
```

### Notifications API

#### GET /api/notifications/:studentId
Get student's notifications.

**Response:**
```json
{
  "notifications": [
    {
      "id": "string",
      "type": "job_match|application_update|system",
      "title": "string",
      "message": "string",
      "data": {},
      "isRead": false,
      "createdAt": "ISO 8601 string",
      "expiresAt": "ISO 8601 string"
    }
  ]
}
```

#### POST /api/notifications
Create notification.

**Request Body:**
```json
{
  "studentId": "string",
  "type": "job_match|application_update|system",
  "title": "string",
  "message": "string",
  "data": {},
  "expiresAt": "ISO 8601 string"
}
```

#### PUT /api/notifications/:id/read
Mark notification as read.

#### DELETE /api/notifications/:id
Delete notification.

### WebSocket Events

#### Connection
```javascript
const socket = io('http://localhost:3001');
```

#### Join Student Room
```javascript
socket.emit('join-student', studentId);
```

#### Subscribe to Job Matches
```javascript
socket.emit('subscribe-job-matches', studentId);
```

#### Listen for Notifications
```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

---

## Python Backend API

### Resume Management

#### GET /api/students/{student_id}/resume
Get student's stored resume information.

**Response:**
```json
{
  "id": "string",
  "fileName": "string",
  "fileUrl": "string",
  "uploadedAt": "ISO 8601 string",
  "fileSize": 1024000,
  "analysis": {
    "overallScore": 8.5,
    "categoryScores": {
      "bulletPoints": 8,
      "header": 9,
      "education": 8,
      "experience": 9,
      "secondarySections": 7,
      "formatting": 8,
      "language": 8,
      "contentQuality": 9,
      "targeting": 8,
      "universalStandards": 8
    },
    "strengths": ["string"],
    "priorityImprovements": ["string"],
    "overallAssessment": "string",
    "lastAnalyzed": "ISO 8601 string"
  }
}
```

#### POST /api/students/{student_id}/resume
Upload student resume (PDF only, max 5MB).

**Request:**
- Content-Type: multipart/form-data
- Body: PDF file

**Response:**
```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "id": "string",
    "fileName": "string",
    "fileUrl": "string",
    "uploadedAt": "ISO 8601 string",
    "fileSize": 1024000
  }
}
```

#### GET /api/students/{student_id}/resume/download
Download student resume file.

**Response:**
- Content-Type: application/pdf
- Body: PDF file

#### POST /api/students/{student_id}/resume/analyze
Analyze stored resume using AI.

**Response:**
```json
{
  "message": "Resume analyzed successfully",
  "analysis": {
    "overallScore": 8.5,
    "categoryScores": {
      "bulletPoints": 8,
      "header": 9,
      "education": 8,
      "experience": 9,
      "secondarySections": 7,
      "formatting": 8,
      "language": 8,
      "contentQuality": 9,
      "targeting": 8,
      "universalStandards": 8
    },
    "strengths": ["string"],
    "priorityImprovements": ["string"],
    "overallAssessment": "string",
    "lastAnalyzed": "ISO 8601 string"
  }
}
```

#### DELETE /api/students/{student_id}/resume
Delete student resume.

**Response:**
```json
{
  "message": "Resume deleted successfully"
}
```

### Student Management

#### GET /api/students
Get list of all students.

**Response:**
```json
{
  "students": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "university": "string",
      "major": "string",
      "graduationYear": 2024,
      "skills": ["string"],
      "interests": ["string"],
      "careerGoals": ["string"],
      "isActive": true,
      "createdAt": "ISO 8601 string"
    }
  ]
}
```

#### GET /api/students/{student_id}
Get specific student details.

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "university": "string",
  "major": "string",
  "graduationYear": 2024,
  "skills": ["string"],
  "interests": ["string"],
  "careerGoals": ["string"],
  "jobPreferences": {},
  "isActive": true,
  "createdAt": "ISO 8601 string",
  "lastLogin": "ISO 8601 string"
}
```

#### POST /api/students
Create new student.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "university": "string",
  "major": "string",
  "graduationYear": 2024,
  "skills": ["string"],
  "interests": ["string"],
  "careerGoals": ["string"],
  "jobPreferences": {}
}
```

**Response:**
```json
{
  "message": "Student created successfully",
  "student": {
    "id": "string",
    "name": "string",
    "email": "string",
    "university": "string",
    "major": "string"
  }
}
```

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": "Additional error details (development only)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `413` - Payload Too Large
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## Rate Limiting

- **Node.js Backend**: 100 requests per 15 minutes per IP
- **Python Backend**: No rate limiting currently implemented

---

## CORS Configuration

Both backends are configured to allow:
- Origins: `http://localhost:3000`, `http://localhost:5173`
- Methods: All HTTP methods
- Headers: All headers
- Credentials: Enabled

---

## Health Checks

### Node.js Backend
- **Endpoint**: `GET /health`
- **Response**: Server status, uptime, timestamp

### Python Backend
- **Endpoint**: `GET /health`
- **Response**: API status, database connection, version info

---

## API Documentation

- **Node.js Backend**: No automatic documentation (manual)
- **Python Backend**: Automatic OpenAPI docs at `/docs` and `/redoc`
