/*
============================================================================
FILE: backend/services/ResumeMatcher.js
============================================================================
PURPOSE:
  AI-powered resume matching service that analyzes student resumes and
  matches them with relevant job postings using Google AI and custom algorithms.

FEATURES:
  - Resume analysis using Google AI
  - Job-resume matching algorithm
  - Skill extraction and comparison
  - Match scoring and ranking
  - Batch processing for efficiency
  - Notification generation for matches
============================================================================
*/

import { GoogleGenerativeAI } from '@google/generative-ai';
import Student from '../models/Student.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

class ResumeMatcher {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.minMatchScore = 60; // Minimum score to consider a match
    this.batchSize = 10; // Process students in batches
  }

  /**
   * Match all active students with available jobs
   */
  async matchAllStudents() {
    try {
      logger.info('Starting resume matching process...');
      
      const students = await Student.find({ isActive: true });
      logger.info(`Found ${students.length} active students to match`);
      
      let totalMatches = 0;
      let processedStudents = 0;
      
      // Process students in batches
      for (let i = 0; i < students.length; i += this.batchSize) {
        const batch = students.slice(i, i + this.batchSize);
        
        logger.info(`Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(students.length / this.batchSize)}`);
        
        const batchPromises = batch.map(student => this.matchStudent(student));
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            totalMatches += result.value;
            processedStudents++;
          } else {
            logger.error(`Error matching student ${batch[index].email}:`, result.reason);
          }
        });
        
        // Small delay between batches to avoid overwhelming the AI service
        if (i + this.batchSize < students.length) {
          await this.delay(1000);
        }
      }
      
      logger.info(`Resume matching completed. Processed: ${processedStudents}, Total matches: ${totalMatches}`);
      return { processedStudents, totalMatches };
      
    } catch (error) {
      logger.error('Error in resume matching process:', error);
      throw error;
    }
  }

  /**
   * Match a single student with available jobs
   */
  async matchStudent(student) {
    try {
      // Check if student has a stored resume file or resume text
      if (!student.resumeFile && (!student.resumeText || student.resumeText.trim().length < 50)) {
        logger.warn(`Student ${student.email} has no resume stored, skipping...`);
        return 0;
      }
      
      logger.info(`Matching student: ${student.email}`);
      
      // Get active jobs that match student preferences
      const jobs = await this.getRelevantJobs(student);
      logger.info(`Found ${jobs.length} relevant jobs for ${student.email}`);
      
      let matchCount = 0;
      
      // Match with each job
      for (const job of jobs) {
        try {
          const matchScore = await this.calculateMatchScore(student, job);
          
          if (matchScore >= this.minMatchScore) {
            // Add match to student
            await student.addJobMatch(job._id, matchScore);
            
            // Add match to job
            await job.addStudentMatch(student._id, matchScore);
            
            // Create notification
            await this.createMatchNotification(student, job, matchScore);
            
            matchCount++;
            logger.info(`Match found: ${student.email} <-> ${job.title} (${matchScore}%)`);
          }
          
        } catch (error) {
          logger.error(`Error matching student ${student.email} with job ${job.title}:`, error);
        }
      }
      
      return matchCount;
      
    } catch (error) {
      logger.error(`Error matching student ${student.email}:`, error);
      return 0;
    }
  }

  /**
   * Get jobs relevant to student preferences
   */
  async getRelevantJobs(student) {
    const query = { status: 'active' };
    
    // Filter by preferred categories
    if (student.jobPreferences?.categories?.length > 0) {
      query.categories = { $in: student.jobPreferences.categories };
    }
    
    // Filter by preferred job types
    if (student.jobPreferences?.jobTypes?.length > 0) {
      query.jobType = { $in: student.jobPreferences.jobTypes };
    }
    
    // Filter by location preferences
    if (student.jobPreferences?.locations?.length > 0) {
      query.$or = [
        { location: { $in: student.jobPreferences.locations } },
        { isRemote: true }
      ];
    }
    
    // Exclude jobs already matched to this student
    query['matchedStudents.studentId'] = { $ne: student._id };
    
    return await Job.find(query)
      .sort({ postedDate: -1 })
      .limit(50); // Limit to most recent 50 jobs
  }

  /**
   * Calculate match score between student and job
   */
  async calculateMatchScore(student, job) {
    try {
      // Basic score calculation
      let score = 0;
      let factors = 0;
      
      // 1. Skills matching (40% weight)
      const skillsScore = this.calculateSkillsMatch(student.skills, job.skills);
      score += skillsScore * 0.4;
      factors += 0.4;
      
      // 2. Category preference (20% weight)
      const categoryScore = this.calculateCategoryMatch(student, job);
      score += categoryScore * 0.2;
      factors += 0.2;
      
      // 3. Experience level (15% weight)
      const experienceScore = this.calculateExperienceMatch(student, job);
      score += experienceScore * 0.15;
      factors += 0.15;
      
      // 4. Location preference (10% weight)
      const locationScore = this.calculateLocationMatch(student, job);
      score += locationScore * 0.1;
      factors += 0.1;
      
      // 5. AI-powered content matching (15% weight)
      const aiScore = await this.calculateAIMatch(student, job);
      score += aiScore * 0.15;
      factors += 0.15;
      
      // Normalize score
      const finalScore = factors > 0 ? Math.round(score / factors) : 0;
      
      return Math.min(100, Math.max(0, finalScore));
      
    } catch (error) {
      logger.error('Error calculating match score:', error);
      return 0;
    }
  }

  /**
   * Calculate skills match score
   */
  calculateSkillsMatch(studentSkills, jobSkills) {
    if (!studentSkills?.length || !jobSkills?.length) {
      return 50; // Neutral score if no skills data
    }
    
    const studentSkillNames = studentSkills.map(s => s.name.toLowerCase());
    const jobSkillNames = jobSkills.map(s => s.toLowerCase());
    
    const matchingSkills = jobSkillNames.filter(skill => 
      studentSkillNames.some(studentSkill => 
        studentSkill.includes(skill) || skill.includes(studentSkill)
      )
    );
    
    const matchRatio = matchingSkills.length / jobSkillNames.length;
    return Math.round(matchRatio * 100);
  }

  /**
   * Calculate category match score
   */
  calculateCategoryMatch(student, job) {
    if (!student.jobPreferences?.categories?.length) {
      return 50; // Neutral score if no preferences
    }
    
    const hasMatchingCategory = job.categories.some(category => 
      student.jobPreferences.categories.includes(category)
    );
    
    return hasMatchingCategory ? 100 : 0;
  }

  /**
   * Calculate experience level match
   */
  calculateExperienceMatch(student, job) {
    // Simple logic based on graduation year and job requirements
    const currentYear = new Date().getFullYear();
    const yearsToGraduation = (student.graduationYear || currentYear + 1) - currentYear;
    
    if (job.experienceLevel === 'entry' && yearsToGraduation <= 2) {
      return 100;
    } else if (job.experienceLevel === 'mid' && yearsToGraduation <= 1) {
      return 80;
    } else if (job.experienceLevel === 'senior' && yearsToGraduation <= 0) {
      return 60;
    }
    
    return 50; // Neutral score
  }

  /**
   * Calculate location match score
   */
  calculateLocationMatch(student, job) {
    if (!student.jobPreferences?.locations?.length) {
      return 50; // Neutral score if no location preferences
    }
    
    if (job.isRemote) {
      return 100; // Remote jobs match all locations
    }
    
    const hasMatchingLocation = student.jobPreferences.locations.some(location => 
      job.location.toLowerCase().includes(location.toLowerCase())
    );
    
    return hasMatchingLocation ? 100 : 0;
  }

  /**
   * Calculate AI-powered content match score
   */
  async calculateAIMatch(student, job) {
    try {
      const prompt = `
Analyze the compatibility between this student's resume and job posting. Consider:
1. Skills alignment
2. Experience relevance
3. Career goals alignment
4. Overall fit

Student Resume:
${student.resumeText}

Job Posting:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Requirements: ${job.requirements.join(', ')}

Rate the compatibility on a scale of 0-100 and provide a brief explanation.

Return only a JSON object with this structure:
{
  "score": number (0-100),
  "explanation": "Brief explanation of the match"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.score || 50;
      }
      
      return 50; // Default score if parsing fails
      
    } catch (error) {
      logger.error('Error in AI matching:', error);
      return 50; // Default score on error
    }
  }

  /**
   * Create notification for job match
   */
  async createMatchNotification(student, job, matchScore) {
    try {
      const notification = new Notification({
        studentId: student._id,
        title: `New Job Match: ${job.title}`,
        message: `We found a ${matchScore}% match for you at ${job.company}. ${job.shortDescription}`,
        type: 'job-match',
        relatedJobId: job._id,
        priority: matchScore >= 80 ? 'high' : 'medium',
        relatedData: {
          matchScore,
          jobTitle: job.title,
          company: job.company,
          location: job.location
        }
      });
      
      await notification.save();
      logger.info(`Created notification for student ${student.email} about job ${job.title}`);
      
    } catch (error) {
      logger.error('Error creating match notification:', error);
    }
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get matching statistics
   */
  async getMatchingStats() {
    try {
      const totalStudents = await Student.countDocuments({ isActive: true });
      const totalJobs = await Job.countDocuments({ status: 'active' });
      const totalMatches = await Job.aggregate([
        { $match: { status: 'active' } },
        { $project: { matchCount: { $size: '$matchedStudents' } } },
        { $group: { _id: null, total: { $sum: '$matchCount' } } }
      ]);
      
      return {
        totalStudents,
        totalJobs,
        totalMatches: totalMatches[0]?.total || 0
      };
      
    } catch (error) {
      logger.error('Error getting matching stats:', error);
      return { totalStudents: 0, totalJobs: 0, totalMatches: 0 };
    }
  }
}

export default ResumeMatcher;

