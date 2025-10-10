# 🧠 RAG (Retrieval-Augmented Generation) System

## Overview

The EagleAI RAG system combines vector embeddings with AI-generated responses to provide intelligent job matching, semantic search, and personalized career advice. This system transforms the job search experience from simple keyword matching to intelligent, context-aware recommendations.

## ✨ Key Features

### 🔍 **Semantic Search**
- **Vector-based job search** using Google AI embeddings
- **Natural language queries** (e.g., "software engineer internship")
- **Context-aware matching** beyond keyword matching
- **Relevance scoring** with similarity percentages

### 🎯 **AI-Powered Recommendations**
- **Personalized job recommendations** based on student profiles
- **AI-generated explanations** for why jobs are recommended
- **Key benefits and skill gaps** analysis
- **Career advice** tailored to each opportunity

### 💡 **Intelligent Insights**
- **Job market analysis** and positioning
- **Career growth potential** assessment
- **Application strategy** recommendations
- **Salary expectations** and negotiation tips

### 🔗 **Vector Similarity**
- **Find similar jobs** using vector embeddings
- **Student-job matching** with semantic understanding
- **Related opportunities** discovery
- **Contextual recommendations** based on job content

## 🛠️ Technical Architecture

### **Core Components:**

1. **VectorEmbeddings Service**
   - Generates embeddings using Google AI text-embedding-004
   - Manages embedding cache for performance
   - Handles batch processing for large datasets
   - Calculates cosine similarity for matching

2. **RAGService**
   - Combines vector search with AI generation
   - Uses Google AI Gemini for text generation
   - Provides intelligent recommendations and insights
   - Manages context and prompt engineering

3. **Database Integration**
   - MongoDB storage for embeddings
   - Indexed vector fields for fast queries
   - Efficient similarity search algorithms
   - Batch processing capabilities

### **AI Models Used:**
- **Google AI text-embedding-004**: Vector embeddings
- **Google AI Gemini-1.5-flash**: Text generation
- **Custom prompt engineering**: Context-aware responses

## 📊 Database Schema

### **Job Model Enhancements:**
```javascript
{
  // ... existing fields
  embedding: [Number],           // Vector embedding
  embeddingUpdatedAt: Date       // Last embedding update
}
```

### **Student Model Enhancements:**
```javascript
{
  // ... existing fields
  embedding: [Number],           // Vector embedding
  embeddingUpdatedAt: Date       // Last embedding update
}
```

### **Indexes for Performance:**
```javascript
// Job embeddings index
jobSchema.index({ embedding: 1 });

// Student embeddings index
studentSchema.index({ embedding: 1 });
```

## 🚀 API Endpoints

### **Job Recommendations**
```http
POST /api/rag/recommendations
{
  "studentId": "student_id",
  "options": {
    "limit": 10,
    "includeExplanation": true,
    "categories": ["software-engineering"],
    "jobTypes": ["internship"],
    "locations": ["Remote"]
  }
}
```

### **Semantic Search**
```http
POST /api/rag/search
{
  "query": "software engineer internship",
  "options": {
    "limit": 20,
    "categories": ["software-engineering"],
    "jobTypes": ["internship"]
  }
}
```

### **Job Insights**
```http
GET /api/rag/insights/:jobId?studentId=student_id
```

### **Career Advice**
```http
POST /api/rag/career-advice
{
  "studentId": "student_id",
  "focusArea": "Software Engineering"
}
```

### **Embedding Management**
```http
POST /api/rag/embeddings/update
{
  "type": "all",  // "jobs", "students", or "all"
  "batchSize": 50
}
```

## 📋 Usage Commands

### **Update Embeddings**
```bash
# Update all embeddings
npm run update:embeddings

# Update only job embeddings
npm run update:embeddings -- --type=jobs

# Update only student embeddings
npm run update:embeddings -- --type=students

# Custom batch size
npm run update:embeddings -- --batch-size=25
```

### **Run RAG Demo**
```bash
# Comprehensive RAG system demo
npm run demo:rag-system
```

### **Backend Scripts**
```bash
# Update embeddings
cd backend && npm run update-embeddings

# Run with options
cd backend && npm run update-embeddings -- --type=jobs --batch-size=10
```

## 🎯 RAG Workflow

### **1. Data Preparation**
```javascript
// Generate embeddings for jobs
const jobEmbedding = await vectorEmbeddings.generateJobEmbedding(job);

// Generate embeddings for students
const studentEmbedding = await vectorEmbeddings.generateStudentEmbedding(student);
```

### **2. Semantic Search**
```javascript
// Search jobs using natural language
const results = await ragService.semanticJobSearch(
  "software engineer internship",
  { limit: 20 }
);
```

### **3. Intelligent Recommendations**
```javascript
// Get AI-powered recommendations
const recommendations = await ragService.generateJobRecommendations(
  studentId,
  { limit: 10, includeExplanation: true }
);
```

### **4. Vector Similarity**
```javascript
// Find similar jobs
const similarJobs = await vectorEmbeddings.findSimilarJobs(jobId, 10);

// Find jobs for student
const studentMatches = await vectorEmbeddings.findJobsForStudent(studentId, 20);
```

## 🧪 Example Usage

### **Semantic Job Search**
```javascript
// Search for remote software engineering jobs
const results = await ragService.semanticJobSearch(
  "remote software engineering internship",
  {
    limit: 10,
    jobTypes: ["internship"],
    locations: ["Remote"]
  }
);

console.log(`Found ${results.length} relevant jobs`);
results.forEach(job => {
  console.log(`${job.title} at ${job.company} (${job.relevanceScore}% match)`);
});
```

### **AI-Powered Recommendations**
```javascript
// Get personalized recommendations
const recommendations = await ragService.generateJobRecommendations(
  "student_id",
  {
    limit: 5,
    includeExplanation: true,
    categories: ["software-engineering", "data-science"]
  }
);

recommendations.recommendations.forEach(rec => {
  console.log(`${rec.title} at ${rec.company}`);
  console.log(`Score: ${rec.recommendationScore}%`);
  console.log(`Reasoning: ${rec.reasoning}`);
  console.log(`Benefits: ${rec.keyBenefits.join(', ')}`);
});
```

### **Job Insights Generation**
```javascript
// Get detailed job analysis
const insights = await ragService.generateJobInsights(
  "job_id",
  "student_id" // optional
);

console.log("Job Market Analysis:");
console.log(insights);
```

## 📈 Performance Optimization

### **Caching Strategy**
- **Embedding cache** for frequently accessed texts
- **Batch processing** to reduce API calls
- **Rate limiting** to respect API limits
- **Efficient similarity calculations**

### **Database Optimization**
- **Vector indexes** for fast similarity search
- **Batch updates** for embedding generation
- **Connection pooling** for concurrent requests
- **Query optimization** for large datasets

### **API Management**
- **Request batching** for multiple embeddings
- **Error handling** and retry logic
- **Progress tracking** for long operations
- **Resource cleanup** and memory management

## 🔧 Configuration

### **Environment Variables**
```bash
GOOGLE_AI_API_KEY=your_google_ai_api_key
MONGODB_URI=mongodb://localhost:27017/eagleai-jobs
```

### **Service Configuration**
```javascript
const vectorEmbeddings = new VectorEmbeddings();
vectorEmbeddings.batchSize = 10;        // Batch size for processing
vectorEmbeddings.embeddingCache = new Map(); // Cache for embeddings

const ragService = new RAGService();
// Uses Google AI Gemini with optimized settings
```

## 📊 Monitoring and Analytics

### **System Statistics**
```javascript
const stats = await ragService.getRAGStats();
console.log({
  jobs: stats.jobs,
  students: stats.embeddings.students,
  systemStatus: stats.systemStatus
});
```

### **Performance Metrics**
- **Embedding generation time**
- **Similarity search performance**
- **AI response generation time**
- **Cache hit rates**
- **Error rates and types**

## 🚨 Error Handling

### **Common Issues and Solutions**

1. **API Rate Limits**
   - Implement exponential backoff
   - Use batch processing
   - Cache frequently accessed data

2. **Memory Management**
   - Clear embedding cache periodically
   - Process large datasets in batches
   - Monitor memory usage

3. **Database Performance**
   - Optimize vector indexes
   - Use connection pooling
   - Monitor query performance

## 🔮 Future Enhancements

### **Planned Features**
- **Multi-modal embeddings** (text + images)
- **Real-time embedding updates**
- **Advanced similarity algorithms**
- **Custom embedding models**
- **A/B testing for recommendations**

### **Integration Opportunities**
- **Real-time job matching**
- **Push notifications** for new matches
- **Mobile app integration**
- **Third-party job board APIs**
- **Advanced analytics dashboard**

## 🎉 Benefits

### **For Students**
- **Intelligent job matching** beyond keyword search
- **Personalized recommendations** with explanations
- **Career insights** and growth opportunities
- **Context-aware search** results

### **For the System**
- **Improved matching accuracy** with semantic understanding
- **Better user engagement** with AI explanations
- **Scalable architecture** for large datasets
- **Future-proof design** for advanced AI features

---

## 🚀 Quick Start

1. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add your GOOGLE_AI_API_KEY
   ```

2. **Update embeddings**:
   ```bash
   npm run update:embeddings
   ```

3. **Run the demo**:
   ```bash
   npm run demo:rag-system
   ```

4. **Test the API**:
   ```bash
   curl -X POST http://localhost:3001/api/rag/search \
     -H "Content-Type: application/json" \
     -d '{"query": "software engineer internship"}'
   ```

The RAG system is now ready to provide intelligent, AI-powered job recommendations and insights! 🎉
