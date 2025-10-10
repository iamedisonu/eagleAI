/*
============================================================================
FILE: backend/services/RAGService.js
============================================================================
PURPOSE:
  RAG (Retrieval-Augmented Generation) service that combines vector search
  with AI-generated responses for intelligent job matching and recommendations.

FEATURES:
  - Semantic job search and matching
  - AI-generated job recommendations with explanations
  - Contextual job insights and analysis
  - Personalized career advice
  - Intelligent job filtering and ranking

TECHNOLOGY:
  - Vector embeddings for semantic search
  - Google AI Gemini for text generation
  - MongoDB for data retrieval
  - Advanced prompt engineering
============================================================================
*/

import { GoogleGenerativeAI } from '@google/generative-ai';
import VectorEmbeddings from './VectorEmbeddings.js';
import Job from '../models/Job.js';
import Student from '../models/Student.js';
import logger from '../utils/logger.js';

class RAGService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.geminiModel = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    this.vectorEmbeddings = new VectorEmbeddings();
  }

  /**
   * Generate personalized job recommendations with RAG
   */
  async generateJobRecommendations(studentId, options = {}) {
    try {
      const {
        limit = 10,
        includeExplanation = true,
        categories = null,
        jobTypes = null,
        locations = null
      } = options;

      // Get student profile
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Retrieve relevant jobs using vector search
      const relevantJobs = await this.retrieveRelevantJobs(student, {
        limit: limit * 2, // Get more jobs for better context
        categories,
        jobTypes,
        locations
      });

      if (relevantJobs.length === 0) {
        return {
          recommendations: [],
          explanation: "No relevant jobs found based on your profile and preferences.",
          totalJobs: 0
        };
      }

      // Generate AI-powered recommendations
      const recommendations = await this.generateAIRecommendations(
        student, 
        relevantJobs, 
        limit
      );

      // Generate explanation if requested
      let explanation = null;
      if (includeExplanation) {
        explanation = await this.generateRecommendationExplanation(
          student, 
          recommendations
        );
      }

      return {
        recommendations,
        explanation,
        totalJobs: relevantJobs.length,
        generatedAt: new Date()
      };

    } catch (error) {
      logger.error('Error generating job recommendations:', error);
      throw error;
    }
  }

  /**
   * Retrieve relevant jobs using vector similarity
   */
  async retrieveRelevantJobs(student, options = {}) {
    try {
      const {
        limit = 20,
        categories = null,
        jobTypes = null,
        locations = null
      } = options;

      // Build query filters
      const query = { 
        status: 'active',
        embedding: { $exists: true }
      };

      if (categories && categories.length > 0) {
        query.categories = { $in: categories };
      }

      if (jobTypes && jobTypes.length > 0) {
        query.jobType = { $in: jobTypes };
      }

      if (locations && locations.length > 0) {
        query.location = { $in: locations };
      }

      // Get jobs with embeddings
      const jobs = await Job.find(query);

      if (jobs.length === 0) {
        return [];
      }

      // Calculate similarities if student has embedding
      if (student.embedding) {
        const similarities = jobs.map(job => ({
          job,
          similarity: this.vectorEmbeddings.calculateCosineSimilarity(
            student.embedding, 
            job.embedding
          )
        }));

        return similarities
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit)
          .map(item => ({
            ...item.job.toObject(),
            matchScore: Math.round(item.similarity * 100)
          }));
      } else {
        // Fallback to basic ranking if no student embedding
        return jobs.slice(0, limit).map(job => ({
          ...job.toObject(),
          matchScore: 50 // Default score
        }));
      }

    } catch (error) {
      logger.error('Error retrieving relevant jobs:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered job recommendations
   */
  async generateAIRecommendations(student, jobs, limit) {
    try {
      // Prepare context for AI
      const studentContext = this.buildStudentContext(student);
      const jobsContext = jobs.slice(0, 10).map(job => ({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description.substring(0, 200),
        skills: job.skills?.slice(0, 5) || [],
        matchScore: job.matchScore
      }));

      const prompt = `
You are an AI career advisor helping a student find the best job opportunities. 

STUDENT PROFILE:
${studentContext}

AVAILABLE JOBS:
${JSON.stringify(jobsContext, null, 2)}

Please analyze these jobs and provide personalized recommendations. For each recommended job, explain:
1. Why it's a good fit for this student
2. Key skills alignment
3. Career growth potential
4. Any concerns or considerations

Return your response as a JSON array with this structure:
[
  {
    "jobId": "job_id_here",
    "recommendationScore": 85,
    "reasoning": "Detailed explanation of why this job is recommended",
    "keyBenefits": ["benefit1", "benefit2", "benefit3"],
    "skillGaps": ["skill1", "skill2"],
    "careerAdvice": "Specific advice for this opportunity"
  }
]

Focus on the top ${limit} most relevant jobs. Be specific and actionable in your recommendations.
`;

      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse AI response
      const recommendations = this.parseAIResponse(text);
      
      // Merge with job data
      return recommendations.map(rec => {
        const job = jobs.find(j => j._id.toString() === rec.jobId);
        return {
          ...job,
          ...rec,
          aiGenerated: true
        };
      }).slice(0, limit);

    } catch (error) {
      logger.error('Error generating AI recommendations:', error);
      // Fallback to basic recommendations
      return jobs.slice(0, limit).map(job => ({
        ...job,
        recommendationScore: job.matchScore,
        reasoning: `This job matches your profile with a ${job.matchScore}% compatibility score.`,
        keyBenefits: ['Good skill alignment', 'Relevant experience'],
        skillGaps: [],
        careerAdvice: 'Consider applying if this role aligns with your career goals.',
        aiGenerated: false
      }));
    }
  }

  /**
   * Generate explanation for recommendations
   */
  async generateRecommendationExplanation(student, recommendations) {
    try {
      const studentContext = this.buildStudentContext(student);
      const recSummary = recommendations.map(rec => ({
        title: rec.title,
        company: rec.company,
        score: rec.recommendationScore || rec.matchScore
      }));

      const prompt = `
You are an AI career advisor. Based on the student profile and job recommendations, provide a comprehensive explanation of the matching strategy.

STUDENT PROFILE:
${studentContext}

RECOMMENDED JOBS:
${JSON.stringify(recSummary, null, 2)}

Provide a 2-3 paragraph explanation covering:
1. Overall matching strategy and approach
2. Key factors that influenced the recommendations
3. Career development opportunities and next steps

Be encouraging, specific, and actionable.
`;

      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      logger.error('Error generating explanation:', error);
      return "These recommendations are based on your profile, skills, and career preferences. Each job has been carefully matched to help advance your career goals.";
    }
  }

  /**
   * Generate job insights and analysis
   */
  async generateJobInsights(jobId, studentId = null) {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      let student = null;
      if (studentId) {
        student = await Student.findById(studentId);
      }

      const prompt = `
You are an AI career analyst. Analyze this job posting and provide detailed insights.

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description}
Skills Required: ${job.skills?.join(', ') || 'Not specified'}
Requirements: ${job.requirements?.join('. ') || 'Not specified'}
Job Type: ${job.jobType}
Experience Level: ${job.experienceLevel || 'Not specified'}

${student ? `
STUDENT CONTEXT:
Name: ${student.name}
Major: ${student.major}
Skills: ${student.skills?.join(', ') || 'Not specified'}
` : ''}

Provide analysis covering:
1. Job market positioning and competitiveness
2. Required skills and experience level
3. Career growth potential
4. Application strategy and tips
5. Salary expectations and negotiation points
6. Company culture insights (if available)

Format as structured insights with specific, actionable advice.
`;

      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      logger.error('Error generating job insights:', error);
      throw error;
    }
  }

  /**
   * Generate career advice based on job market analysis
   */
  async generateCareerAdvice(studentId, focusArea = null) {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Get relevant jobs for context
      const relevantJobs = await this.retrieveRelevantJobs(student, { limit: 20 });
      
      const prompt = `
You are an AI career advisor. Provide personalized career advice based on the student's profile and current job market.

STUDENT PROFILE:
${this.buildStudentContext(student)}

CURRENT JOB MARKET CONTEXT:
${relevantJobs.slice(0, 10).map(job => ({
  title: job.title,
  company: job.company,
  skills: job.skills?.slice(0, 5) || []
}))}

FOCUS AREA: ${focusArea || 'General career development'}

Provide comprehensive career advice covering:
1. Skills development recommendations
2. Career path suggestions
3. Industry trends and opportunities
4. Networking and professional development
5. Short-term and long-term goals
6. Specific action items

Be specific, actionable, and encouraging. Reference the current job market context.
`;

      const result = await this.geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      logger.error('Error generating career advice:', error);
      throw error;
    }
  }

  /**
   * Build student context for AI prompts
   */
  buildStudentContext(student) {
    return `
Name: ${student.name}
Major: ${student.major}
University: ${student.university}
Graduation Year: ${student.graduationYear}
Skills: ${student.skills?.join(', ') || 'Not specified'}
Interests: ${student.interests?.join(', ') || 'Not specified'}
Experience: ${student.experience?.join('. ') || 'Not specified'}
Projects: ${student.projects?.map(p => `${p.title}: ${p.description}`).join('. ') || 'Not specified'}
Career Goals: ${student.careerGoals || 'Not specified'}
Preferred Job Types: ${student.preferredJobTypes?.join(', ') || 'Not specified'}
Preferred Locations: ${student.preferredLocations?.join(', ') || 'Not specified'}
Resume Summary: ${student.resumeSummary || 'Not specified'}
`;
  }

  /**
   * Parse AI response and extract recommendations
   */
  parseAIResponse(text) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return empty array
      logger.warn('Could not parse AI response as JSON');
      return [];
    } catch (error) {
      logger.error('Error parsing AI response:', error);
      return [];
    }
  }

  /**
   * Search jobs using semantic search
   */
  async semanticJobSearch(query, options = {}) {
    try {
      const {
        limit = 20,
        categories = null,
        jobTypes = null,
        locations = null
      } = options;

      // Generate embedding for search query
      const queryEmbedding = await this.vectorEmbeddings.generateEmbedding(query);

      // Build query filters
      const mongoQuery = { 
        status: 'active',
        embedding: { $exists: true }
      };

      if (categories && categories.length > 0) {
        mongoQuery.categories = { $in: categories };
      }

      if (jobTypes && jobTypes.length > 0) {
        mongoQuery.jobType = { $in: jobTypes };
      }

      if (locations && locations.length > 0) {
        mongoQuery.location = { $in: locations };
      }

      // Get jobs with embeddings
      const jobs = await Job.find(mongoQuery);

      if (jobs.length === 0) {
        return [];
      }

      // Calculate similarities
      const similarities = jobs.map(job => ({
        job,
        similarity: this.vectorEmbeddings.calculateCosineSimilarity(
          queryEmbedding, 
          job.embedding
        )
      }));

      // Sort by similarity and return results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(item => ({
          ...item.job.toObject(),
          relevanceScore: Math.round(item.similarity * 100),
          searchQuery: query
        }));

    } catch (error) {
      logger.error('Error in semantic job search:', error);
      throw error;
    }
  }

  /**
   * Get RAG system statistics
   */
  async getRAGStats() {
    try {
      const embeddingStats = await this.vectorEmbeddings.getEmbeddingStats();
      
      const jobStats = await Job.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            withEmbeddings: { $sum: { $cond: [{ $ifNull: ['$embedding', false] }, 1, 0] } },
            avgMatchScore: { $avg: '$matchScore' }
          }
        }
      ]);

      return {
        embeddings: embeddingStats,
        jobs: jobStats[0] || { total: 0, withEmbeddings: 0, avgMatchScore: 0 },
        systemStatus: 'operational',
        lastUpdated: new Date()
      };

    } catch (error) {
      logger.error('Error getting RAG stats:', error);
      throw error;
    }
  }
}

export default RAGService;
