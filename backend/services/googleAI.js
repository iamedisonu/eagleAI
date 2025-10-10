/*
============================================================================
FILE: backend/services/googleAI.js
============================================================================
PURPOSE:
  Google AI service for resume analysis and AI-powered features.
  Provides integration with Google's Generative AI API for text analysis.

FEATURES:
  - Resume analysis and parsing
  - Skills extraction
  - Career recommendations
  - Text processing and analysis

DEPENDENCIES:
  - @google/generative-ai: Google's Generative AI SDK
  - dotenv: Environment variable management
============================================================================
*/

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'demo-key');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Analyze resume text and extract structured information
 * @param {string} resumeText - The resume text to analyze
 * @returns {Object} Analysis result with structured data
 */
export async function analyzeResume(resumeText) {
  try {
    if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'demo-key') {
      // Return mock data if no API key is provided
      return {
        success: true,
        parsedResponse: {
          personalInfo: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            location: 'New York, NY'
          },
          summary: 'Experienced software developer with 3+ years of experience in full-stack development.',
          skills: {
            technical: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
            soft: ['Leadership', 'Communication', 'Problem Solving']
          },
          experience: [
            {
              title: 'Software Developer',
              company: 'Tech Corp',
              duration: '2021-2023',
              description: 'Developed web applications using React and Node.js'
            }
          ],
          education: [
            {
              degree: 'Bachelor of Science in Computer Science',
              institution: 'University of Technology',
              year: '2021'
            }
          ],
          overallScore: 85,
          strengths: ['Strong technical skills', 'Good project experience'],
          improvements: ['Add more specific achievements', 'Include quantifiable results']
        }
      };
    }

    const prompt = `
    Analyze the following resume text and extract structured information in JSON format:
    
    Resume Text:
    ${resumeText}
    
    Please provide a JSON response with the following structure:
    {
      "personalInfo": {
        "name": "string",
        "email": "string", 
        "phone": "string",
        "location": "string"
      },
      "summary": "string",
      "skills": {
        "technical": ["string"],
        "soft": ["string"]
      },
      "experience": [
        {
          "title": "string",
          "company": "string",
          "duration": "string",
          "description": "string"
        }
      ],
      "education": [
        {
          "degree": "string",
          "institution": "string",
          "year": "string"
        }
      ],
      "overallScore": number,
      "strengths": ["string"],
      "improvements": ["string"]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const parsedResponse = JSON.parse(text);
    
    return {
      success: true,
      parsedResponse
    };

  } catch (error) {
    console.error('Error analyzing resume:', error);
    return {
      success: false,
      error: error.message,
      parsedResponse: null
    };
  }
}

/**
 * Generate career recommendations based on resume analysis
 * @param {Object} resumeAnalysis - The analyzed resume data
 * @returns {Object} Career recommendations
 */
export async function generateCareerRecommendations(resumeAnalysis) {
  try {
    if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'demo-key') {
      // Return mock recommendations
      return {
        success: true,
        recommendations: {
          careerPaths: [
            {
              title: 'Senior Software Developer',
              matchScore: 85,
              description: 'Based on your technical skills and experience',
              requirements: ['Advanced JavaScript', 'System Design', 'Team Leadership']
            },
            {
              title: 'Full Stack Engineer',
              matchScore: 90,
              description: 'Perfect match for your full-stack experience',
              requirements: ['React', 'Node.js', 'Database Design']
            }
          ],
          skillGaps: [
            'Cloud Computing (AWS/Azure)',
            'DevOps Practices',
            'Machine Learning Basics'
          ],
          nextSteps: [
            'Complete a cloud certification',
            'Build a portfolio project',
            'Apply to senior developer positions'
          ]
        }
      };
    }

    const prompt = `
    Based on the following resume analysis, provide career recommendations:
    
    Resume Analysis:
    ${JSON.stringify(resumeAnalysis, null, 2)}
    
    Please provide recommendations in JSON format with career paths, skill gaps, and next steps.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const recommendations = JSON.parse(text);
    
    return {
      success: true,
      recommendations
    };

  } catch (error) {
    console.error('Error generating career recommendations:', error);
    return {
      success: false,
      error: error.message,
      recommendations: null
    };
  }
}

/**
 * Generate job matching analysis
 * @param {Object} resumeAnalysis - The analyzed resume data
 * @param {Object} jobDescription - The job description to match against
 * @returns {Object} Job matching analysis
 */
export async function analyzeJobMatch(resumeAnalysis, jobDescription) {
  try {
    if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'demo-key') {
      // Return mock job match analysis
      return {
        success: true,
        matchAnalysis: {
          overallMatch: 78,
          skillMatch: 85,
          experienceMatch: 70,
          educationMatch: 80,
          matchedSkills: ['JavaScript', 'React', 'Node.js'],
          missingSkills: ['TypeScript', 'Docker'],
          recommendations: [
            'Learn TypeScript to improve your match',
            'Gain experience with containerization'
          ]
        }
      };
    }

    const prompt = `
    Analyze the job match between this resume and job description:
    
    Resume Analysis:
    ${JSON.stringify(resumeAnalysis, null, 2)}
    
    Job Description:
    ${jobDescription}
    
    Provide a detailed match analysis in JSON format.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const matchAnalysis = JSON.parse(text);
    
    return {
      success: true,
      matchAnalysis
    };

  } catch (error) {
    console.error('Error analyzing job match:', error);
    return {
      success: false,
      error: error.message,
      matchAnalysis: null
    };
  }
}

export default {
  analyzeResume,
  generateCareerRecommendations,
  analyzeJobMatch
};
