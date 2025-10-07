// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the eagleai-jobs database
db = db.getSiblingDB('eagleai-jobs');

// Create collections with validation
db.createCollection('jobs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'company', 'description', 'applicationUrl', 'source', 'sourceId'],
      properties: {
        title: { bsonType: 'string' },
        company: { bsonType: 'string' },
        location: { bsonType: 'string' },
        description: { bsonType: 'string' },
        applicationUrl: { bsonType: 'string' },
        source: { 
          bsonType: 'string',
          enum: ['intern-list', 'linkedin', 'indeed', 'glassdoor', 'company-website']
        },
        sourceId: { bsonType: 'string' },
        status: {
          bsonType: 'string',
          enum: ['active', 'expired', 'filled', 'flagged']
        }
      }
    }
  }
});

db.createCollection('students', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email'],
      properties: {
        name: { bsonType: 'string' },
        email: { 
          bsonType: 'string',
          pattern: '^[^@]+@[^@]+\\.[^@]+$'
        },
        university: { bsonType: 'string' },
        major: { bsonType: 'string' },
        isActive: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('notifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['studentId', 'title', 'message', 'type'],
      properties: {
        studentId: { bsonType: 'objectId' },
        title: { bsonType: 'string' },
        message: { bsonType: 'string' },
        type: {
          bsonType: 'string',
          enum: ['job-match', 'resume-analysis', 'mentorship', 'projects', 'skills', 'roadmap', 'system', 'reminder']
        },
        read: { bsonType: 'bool' }
      }
    }
  }
});

// Create indexes for better performance
db.jobs.createIndex({ "title": "text", "company": "text", "description": "text" });
db.jobs.createIndex({ "categories": 1, "jobType": 1 });
db.jobs.createIndex({ "location": 1 });
db.jobs.createIndex({ "postedDate": -1 });
db.jobs.createIndex({ "status": 1, "postedDate": -1 });
db.jobs.createIndex({ "sourceId": 1 }, { unique: true });
db.jobs.createIndex({ "matchedStudents.studentId": 1 });

db.students.createIndex({ "email": 1 }, { unique: true });
db.students.createIndex({ "skills": 1 });
db.students.createIndex({ "jobPreferences.categories": 1 });
db.students.createIndex({ "university": 1, "major": 1 });
db.students.createIndex({ "isActive": 1, "lastLogin": -1 });

db.notifications.createIndex({ "studentId": 1, "read": 1, "createdAt": -1 });
db.notifications.createIndex({ "type": 1, "status": 1 });
db.notifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
db.notifications.createIndex({ "createdAt": -1 });

// Insert sample data for testing
db.jobs.insertMany([
  {
    title: "Software Engineering Intern",
    company: "Google",
    location: "Mountain View, CA",
    description: "Join our team as a software engineering intern and work on cutting-edge projects using modern technologies like React, Node.js, and cloud platforms.",
    shortDescription: "Software engineering internship at Google with modern tech stack...",
    applicationUrl: "https://careers.google.com/jobs/results/1234567890",
    postedDate: new Date(),
    requirements: [
      "Currently pursuing a degree in Computer Science or related field",
      "Experience with JavaScript, Python, or Java",
      "Strong problem-solving skills",
      "Previous internship experience preferred"
    ],
    skills: ["javascript", "python", "react", "node.js", "aws"],
    categories: ["software-engineering"],
    jobType: "internship",
    experienceLevel: "entry",
    source: "intern-list",
    sourceId: "intern-list-google-swe-intern-001",
    status: "active",
    isRemote: false,
    matchScore: 0,
    matchedStudents: []
  },
  {
    title: "Data Science Intern",
    company: "Microsoft",
    location: "Seattle, WA",
    description: "Work with our data science team to analyze large datasets and build machine learning models using Python, R, and cloud computing platforms.",
    shortDescription: "Data science internship at Microsoft with ML and analytics focus...",
    applicationUrl: "https://careers.microsoft.com/us/en/job/1234567890",
    postedDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    requirements: [
      "Pursuing degree in Data Science, Statistics, or Computer Science",
      "Experience with Python, R, or SQL",
      "Knowledge of machine learning concepts",
      "Experience with data visualization tools"
    ],
    skills: ["python", "r", "sql", "machine learning", "pandas", "tensorflow"],
    categories: ["data-science"],
    jobType: "internship",
    experienceLevel: "entry",
    source: "intern-list",
    sourceId: "intern-list-microsoft-ds-intern-001",
    status: "active",
    isRemote: true,
    matchScore: 0,
    matchedStudents: []
  }
]);

db.students.insertMany([
  {
    name: "John Doe",
    email: "john.doe@example.com",
    university: "Stanford University",
    major: "Computer Science",
    graduationYear: 2025,
    resumeText: "Computer Science student at Stanford University with experience in full-stack web development using JavaScript, React, Node.js, and Python. Completed multiple projects including a machine learning application and a social media platform. Strong problem-solving skills and passion for technology.",
    skills: [
      { name: "javascript", level: 85, category: "technical" },
      { name: "react", level: 80, category: "technical" },
      { name: "node.js", level: 75, category: "technical" },
      { name: "python", level: 70, category: "technical" },
      { name: "sql", level: 60, category: "technical" }
    ],
    interests: ["web development", "machine learning", "artificial intelligence"],
    careerGoals: ["Software Engineer", "Full-stack Developer", "Tech Lead"],
    jobPreferences: {
      categories: ["software-engineering", "data-science"],
      jobTypes: ["internship", "full-time"],
      locations: ["San Francisco, CA", "Seattle, WA", "Remote"],
      remotePreference: "any"
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      frequency: "daily",
      categories: ["software-engineering", "data-science"]
    },
    isActive: true,
    lastLogin: new Date(),
    profileCompletion: 90,
    jobMatches: []
  }
]);

print("Database initialization completed successfully!");
print("Created collections: jobs, students, notifications");
print("Created indexes for optimal performance");
print("Inserted sample data for testing");

