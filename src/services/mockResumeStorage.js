/*
============================================================================
FILE: src/services/mockResumeStorage.js
============================================================================
PURPOSE:
  Mock resume storage service that simulates resume upload, storage, and
  analysis for job matching. Provides realistic resume data for testing
  and demonstration purposes.

FEATURES:
  - Simulated resume upload and storage
  - Mock resume analysis with AI scoring
  - Resume data persistence in localStorage
  - Integration with job matching system
  - Realistic resume analysis results

USAGE:
  Import and use the functions to manage resume data in the frontend.
============================================================================
*/

// Mock resume data stored in localStorage
const STORAGE_KEY = 'eagleai_resume_data';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get stored resume data
const getStoredResume = (userId) => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting stored resume:', error);
    return null;
  }
};

// Save resume data to localStorage
const saveResume = (userId, resumeData) => {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(resumeData));
    return true;
  } catch (error) {
    console.error('Error saving resume:', error);
    return false;
  }
};

// Mock resume analysis using AI
const analyzeResumeWithAI = async (resumeText) => {
  await delay(2000); // Simulate AI processing time
  
  // Mock analysis results based on resume content
  const analysis = {
    overallScore: Math.floor(Math.random() * 4) + 7, // 7-10 range
    categoryScores: {
      contentQuality: Math.floor(Math.random() * 3) + 7,
      formatting: Math.floor(Math.random() * 3) + 6,
      experience: Math.floor(Math.random() * 3) + 7,
      education: Math.floor(Math.random() * 3) + 8,
      skills: Math.floor(Math.random() * 3) + 7,
      achievements: Math.floor(Math.random() * 3) + 6,
      language: Math.floor(Math.random() * 3) + 8,
      targeting: Math.floor(Math.random() * 3) + 7
    },
    strengths: [
      'Strong technical skills highlighted',
      'Clear work experience progression',
      'Relevant project experience',
      'Good use of action verbs',
      'Quantified achievements included'
    ],
    improvements: [
      'Consider adding more specific metrics',
      'Expand on leadership experience',
      'Include relevant certifications',
      'Optimize for ATS keywords',
      'Add a professional summary'
    ],
    extractedSkills: [
      'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git',
      'Project Management', 'Team Leadership', 'Data Analysis',
      'Problem Solving', 'Communication', 'Agile Methodologies'
    ],
    experienceLevel: 'entry', // entry, mid, senior
    industries: ['Technology', 'Software Development'],
    jobTypes: ['internship', 'full-time'],
    preferredLocations: ['Remote', 'San Francisco, CA', 'New York, NY']
  };

  return analysis;
};

// Mock API functions
export const getResume = async (userId) => {
  await delay(500); // Simulate network delay
  
  const resume = getStoredResume(userId);
  if (resume && resume.file) {
    try {
      return {
        ...resume,
        fileUrl: URL.createObjectURL(resume.file) // Create blob URL for preview
      };
    } catch (error) {
      console.error('Error creating object URL:', error);
      // Return resume without fileUrl if createObjectURL fails
      return {
        ...resume,
        fileUrl: null
      };
    }
  }
  
  return null;
};

export const uploadResume = async (userId, file) => {
  await delay(1500); // Simulate upload time
  
  // Validate file
  if (file.type !== 'application/pdf') {
    throw new Error('Please upload a PDF file only.');
  }
  
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB.');
  }
  
  // Create resume data
  const resumeData = {
    id: `resume_${Date.now()}`,
    fileName: file.name,
    fileSize: file.size,
    file: file,
    uploadedAt: new Date().toISOString(),
    userId: userId,
    analysis: null
  };
  
  // Save to localStorage
  if (saveResume(userId, resumeData)) {
    return resumeData;
  } else {
    throw new Error('Failed to save resume data');
  }
};

export const analyzeResume = async (userId) => {
  await delay(1000); // Simulate network delay
  
  const resume = getStoredResume(userId);
  if (!resume) {
    throw new Error('No resume found to analyze');
  }
  
  // Simulate AI analysis
  const analysis = await analyzeResumeWithAI('mock resume text');
  
  // Update resume with analysis
  const updatedResume = {
    ...resume,
    analysis: analysis,
    analyzedAt: new Date().toISOString()
  };
  
  if (saveResume(userId, updatedResume)) {
    return updatedResume;
  } else {
    throw new Error('Failed to save analysis results');
  }
};

export const deleteResume = async (userId) => {
  await delay(500); // Simulate network delay
  
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${userId}`);
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete resume');
  }
};

export const updateResume = async (userId, updates) => {
  await delay(500); // Simulate network delay
  
  const resume = getStoredResume(userId);
  if (!resume) {
    throw new Error('No resume found to update');
  }
  
  const updatedResume = {
    ...resume,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  if (saveResume(userId, updatedResume)) {
    return updatedResume;
  } else {
    throw new Error('Failed to update resume');
  }
};

// Get resume for job matching
export const getResumeForMatching = async (userId) => {
  const resume = getStoredResume(userId);
  if (!resume || !resume.analysis) {
    return null;
  }
  
  return {
    skills: resume.analysis.extractedSkills || [],
    experienceLevel: resume.analysis.experienceLevel || 'entry',
    industries: resume.analysis.industries || [],
    jobTypes: resume.analysis.jobTypes || ['internship'],
    preferredLocations: resume.analysis.preferredLocations || [],
    overallScore: resume.analysis.overallScore || 0
  };
};

export default {
  getResume,
  uploadResume,
  analyzeResume,
  deleteResume,
  updateResume,
  getResumeForMatching
};
