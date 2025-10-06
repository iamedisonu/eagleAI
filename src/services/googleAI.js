/*
============================================================================
FILE: src/services/googleAI.js
============================================================================
PURPOSE:
  Google AI service for resume analysis using Gemini API. Provides intelligent
  feedback on resume bullet points with scoring and improvement suggestions.

FEATURES:
  - PDF text extraction
  - AI-powered bullet point analysis
  - Scoring system (1-10 scale)
  - Actionable improvement suggestions
  - Structured feedback format

USAGE:
  Import and use analyzeResume() function with PDF file and API key.
============================================================================
*/

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBoKAyutw0pQYkhtCgWAoQNkdhQKt7XYNI';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Extract text from PDF file - Mock implementation for testing
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPDF = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('PDF file received:', file.name, 'Size:', file.size);
      
      // Mock text extraction for testing purposes
      // In a real implementation, you would use a proper PDF parsing library
      const mockResumeText = `
        John Doe
        Software Engineer
        john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe
        
        EXPERIENCE
        
        Software Engineer | Tech Company Inc. | Jan 2022 - Present
        • Developed and maintained web applications using React and Node.js
        • Collaborated with cross-functional teams to deliver high-quality software solutions
        • Implemented automated testing processes that reduced bug reports by 40%
        • Led a team of 3 junior developers on a major product redesign project
        
        Junior Developer | StartupXYZ | Jun 2020 - Dec 2021
        • Built responsive web interfaces using modern JavaScript frameworks
        • Participated in agile development processes and daily standups
        • Contributed to code reviews and maintained documentation
        • Worked on database optimization that improved query performance by 25%
        
        PROJECTS
        
        E-Commerce Platform | Personal Project | 2023
        • Created a full-stack e-commerce application using MERN stack
        • Implemented user authentication, payment processing, and inventory management
        • Deployed on AWS with CI/CD pipeline using GitHub Actions
        
        Task Management App | Team Project | 2022
        • Developed a collaborative task management tool with real-time updates
        • Used WebSocket technology for live collaboration features
        • Integrated with third-party APIs for calendar and email notifications
        
        SKILLS
        
        Programming Languages: JavaScript, Python, Java, TypeScript
        Frameworks: React, Node.js, Express, Django, Spring Boot
        Databases: MongoDB, PostgreSQL, MySQL
        Tools: Git, Docker, AWS, Jenkins, Jira
        Cloud: AWS (EC2, S3, Lambda), Google Cloud Platform
      `;
      
      console.log('Mock PDF parsing completed successfully');
      console.log('Mock extracted text length:', mockResumeText.length);
      console.log('First 200 characters:', mockResumeText.substring(0, 200));
      
      // Simulate some processing time
      setTimeout(() => {
        resolve(mockResumeText.trim());
      }, 1000);
      
    } catch (error) {
      console.error('PDF processing error:', error);
      reject(new Error('Failed to process PDF file: ' + error.message));
    }
  });
};

/**
 * Analyze resume text and extract bullet points
 * @param {string} text - Resume text content
 * @returns {Promise<Object>} - Analysis results with bullet points and scores
 */
export const analyzeResume = async (text) => {
  try {
    const prompt = `
    You are an AI resume reviewer. Here is my resume I want feedback: "${text}"

    Please analyze this resume and provide detailed feedback on the bullet points in the Experience and Projects sections. For each bullet point, provide:
    - A score from 1 to 10
    - Detailed feedback on how to improve it
    - An improved version of the bullet point

    Focus your feedback on:
    - Strong action verbs
    - Quantified results and metrics
    - Specific technologies and tools mentioned
    - Impact and achievements
    - Conciseness and clarity

    Return only a JSON object with this structure:
    {
      "overallScore": number,
      "totalBullets": number,
      "strongBullets": number,
      "needsImprovement": number,
      "bullets": [
        {
          "id": number,
          "original": string,
          "score": number,
          "feedback": string,
          "improved": string,
          "category": "Experience" | "Projects" | "Education" | "Skills"
        }
      ]
    }
    `;

    console.log('Sending request to Google AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    console.log('AI Response received, length:', analysisText.length);
    console.log('Full AI Response:', analysisText);
    
    // Return the raw response for display
    return {
      rawResponse: analysisText,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume: ' + error.message);
  }
};

/**
 * Get job title and company from bullet point context
 * @param {string} text - Resume text content
 * @param {string} bulletText - Specific bullet point text
 * @returns {Promise<Object>} - Job title and company information
 */
export const extractJobContext = async (text, bulletText) => {
  try {
    const prompt = `
    From this resume text, find the job title and company name that corresponds to this bullet point:
    "${bulletText}"
    
    Resume text:
    ${text}
    
    Return a JSON object with:
    {
      "jobTitle": "Job Title",
      "company": "Company Name"
    }
    
    If you can't find specific information, use generic placeholders.
    Return only the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const contextText = response.text();
    
    const jsonMatch = contextText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { jobTitle: "Software Developer", company: "Company" };
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error extracting job context:', error);
    return { jobTitle: "Software Developer", company: "Company" };
  }
};
