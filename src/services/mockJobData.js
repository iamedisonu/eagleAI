/*
============================================================================
FILE: src/services/mockJobData.js
============================================================================
PURPOSE:
  Mock job data service that simulates job scraping from intern-list.com
  and other job boards. Provides realistic job data for testing and
  demonstration purposes.

FEATURES:
  - Simulated job data from various sources
  - Match scoring based on skills and experience
  - Realistic job descriptions and requirements
  - Different job types and categories
  - Mock API responses for frontend testing

USAGE:
  Import and use getMockJobMatches() to get job data for the JobMatches component.
============================================================================
*/

// Mock job data simulating scraped jobs from intern-list.com and other sources
const mockJobs = [
  {
    _id: 'job-001',
    title: 'Software Engineering Intern',
    company: 'Google',
    location: 'Mountain View, CA',
    isRemote: false,
    jobType: 'internship',
    postedDate: '2024-01-15T10:00:00Z',
    applicationUrl: 'https://careers.google.com/jobs/results/1234567890',
    description: 'Join our team as a Software Engineering Intern and work on cutting-edge projects that impact billions of users worldwide.',
    shortDescription: 'Work on cutting-edge projects that impact billions of users worldwide.',
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    requirements: [
      'Currently enrolled in Computer Science or related field',
      'Strong programming skills in Python or JavaScript',
      'Experience with web development frameworks',
      'Good understanding of data structures and algorithms'
    ],
    categories: ['software-engineering'],
    experienceLevel: 'entry',
    salaryRange: { min: 6000, max: 8000 },
    studentMatch: {
      matchScore: 92,
      status: 'interested',
      applicationStatus: 'not-applied',
      matchedSkills: ['Python', 'JavaScript', 'React', 'Git'],
      missingSkills: ['Node.js', 'SQL']
    }
  },
  {
    _id: 'job-002',
    title: 'Data Science Intern',
    company: 'Microsoft',
    location: 'Seattle, WA',
    isRemote: true,
    jobType: 'internship',
    postedDate: '2024-01-14T14:30:00Z',
    applicationUrl: 'https://careers.microsoft.com/us/en/job/1234567890',
    description: 'Work with our data science team to analyze large datasets and build machine learning models that drive business decisions.',
    shortDescription: 'Analyze large datasets and build machine learning models for business decisions.',
    skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Pandas'],
    requirements: [
      'Pursuing degree in Data Science, Statistics, or Computer Science',
      'Experience with Python and data analysis libraries',
      'Understanding of machine learning concepts',
      'Strong analytical and problem-solving skills'
    ],
    categories: ['data-science'],
    experienceLevel: 'entry',
    salaryRange: { min: 5500, max: 7500 },
    studentMatch: {
      matchScore: 88,
      status: 'interested',
      applicationStatus: 'not-applied',
      matchedSkills: ['Python', 'Statistics'],
      missingSkills: ['R', 'SQL', 'Machine Learning', 'Pandas']
    }
  },
  {
    _id: 'job-003',
    title: 'Product Management Intern',
    company: 'Apple',
    location: 'Cupertino, CA',
    isRemote: false,
    jobType: 'internship',
    postedDate: '2024-01-13T09:15:00Z',
    applicationUrl: 'https://jobs.apple.com/en-us/details/1234567890',
    description: 'Join our product team to help shape the future of consumer technology and work on products used by millions worldwide.',
    shortDescription: 'Help shape the future of consumer technology and work on products used by millions.',
    skills: ['Product Management', 'Analytics', 'User Research', 'Agile', 'Figma', 'SQL'],
    requirements: [
      'Currently pursuing MBA or related business degree',
      'Strong analytical and communication skills',
      'Experience with product development processes',
      'Passion for technology and user experience'
    ],
    categories: ['product-management'],
    experienceLevel: 'entry',
    salaryRange: { min: 7000, max: 9000 },
    studentMatch: {
      matchScore: 75,
      status: 'interested',
      applicationStatus: 'not-applied',
      matchedSkills: ['Analytics'],
      missingSkills: ['Product Management', 'User Research', 'Agile', 'Figma', 'SQL']
    }
  },
  {
    _id: 'job-004',
    title: 'Marketing Intern',
    company: 'Meta',
    location: 'Menlo Park, CA',
    isRemote: true,
    jobType: 'internship',
    postedDate: '2024-01-12T16:45:00Z',
    applicationUrl: 'https://www.metacareers.com/jobs/1234567890',
    description: 'Support our marketing team in creating campaigns that connect people and build communities around the world.',
    shortDescription: 'Create campaigns that connect people and build communities around the world.',
    skills: ['Digital Marketing', 'Social Media', 'Analytics', 'Content Creation', 'SEO', 'Google Ads'],
    requirements: [
      'Pursuing degree in Marketing, Communications, or related field',
      'Experience with social media platforms',
      'Creative thinking and strong communication skills',
      'Familiarity with digital marketing tools'
    ],
    categories: ['marketing'],
    experienceLevel: 'entry',
    salaryRange: { min: 5000, max: 7000 },
    studentMatch: {
      matchScore: 82,
      status: 'interested',
      applicationStatus: 'not-applied',
      matchedSkills: ['Social Media', 'Content Creation'],
      missingSkills: ['Digital Marketing', 'Analytics', 'SEO', 'Google Ads']
    }
  },
  {
    _id: 'job-005',
    title: 'UX Design Intern',
    company: 'Adobe',
    location: 'San Jose, CA',
    isRemote: false,
    jobType: 'internship',
    postedDate: '2024-01-11T11:20:00Z',
    applicationUrl: 'https://careers.adobe.com/us/en/job/1234567890',
    description: 'Design intuitive and beautiful user experiences for creative professionals using our industry-leading design tools.',
    shortDescription: 'Design intuitive and beautiful user experiences for creative professionals.',
    skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'UI/UX Design', 'Sketch'],
    requirements: [
      'Pursuing degree in Design, HCI, or related field',
      'Portfolio demonstrating design skills',
      'Experience with design tools like Figma or Adobe Creative Suite',
      'Understanding of user-centered design principles'
    ],
    categories: ['design'],
    experienceLevel: 'entry',
    salaryRange: { min: 5800, max: 7800 },
    studentMatch: {
      matchScore: 90,
      status: 'interested',
      applicationStatus: 'not-applied',
      matchedSkills: ['Figma', 'UI/UX Design'],
      missingSkills: ['Adobe Creative Suite', 'User Research', 'Prototyping', 'Sketch']
    }
  },
  {
    _id: 'job-006',
    title: 'Finance Intern',
    company: 'Goldman Sachs',
    location: 'New York, NY',
    isRemote: false,
    jobType: 'internship',
    postedDate: '2024-01-10T08:30:00Z',
    applicationUrl: 'https://www.goldmansachs.com/careers/opportunities/1234567890',
    description: 'Gain hands-on experience in investment banking and financial analysis while working with industry experts.',
    shortDescription: 'Gain hands-on experience in investment banking and financial analysis.',
    skills: ['Financial Modeling', 'Excel', 'VBA', 'SQL', 'Python', 'Bloomberg Terminal'],
    requirements: [
      'Pursuing degree in Finance, Economics, or related field',
      'Strong analytical and quantitative skills',
      'Proficiency in Excel and financial modeling',
      'Interest in investment banking and financial markets'
    ],
    categories: ['finance'],
    experienceLevel: 'entry',
    salaryRange: { min: 8000, max: 10000 },
    studentMatch: {
      matchScore: 70,
      status: 'interested',
      applicationStatus: 'not-applied',
      matchedSkills: ['Excel'],
      missingSkills: ['Financial Modeling', 'VBA', 'SQL', 'Python', 'Bloomberg Terminal']
    }
  },
  {
    _id: 'job-007',
    title: 'Consulting Intern',
    company: 'McKinsey & Company',
    location: 'Chicago, IL',
    isRemote: false,
    jobType: 'internship',
    postedDate: '2024-01-09T13:15:00Z',
    applicationUrl: 'https://www.mckinsey.com/careers/search-jobs/1234567890',
    description: 'Work with Fortune 500 companies to solve complex business challenges and develop strategic solutions.',
    shortDescription: 'Work with Fortune 500 companies to solve complex business challenges.',
    skills: ['Strategy', 'Analytics', 'PowerPoint', 'Excel', 'Problem Solving', 'Communication'],
    requirements: [
      'Pursuing MBA or advanced degree in business',
      'Strong analytical and problem-solving skills',
      'Excellent communication and presentation abilities',
      'Experience with business case analysis'
    ],
    categories: ['consulting'],
    experienceLevel: 'entry',
    salaryRange: { min: 9000, max: 12000 },
    studentMatch: {
      matchScore: 65,
      status: 'interested',
      applicationStatus: 'not-applied',
      matchedSkills: ['Analytics', 'Communication'],
      missingSkills: ['Strategy', 'PowerPoint', 'Excel', 'Problem Solving']
    }
  },
  {
    _id: 'job-008',
    title: 'AI/ML Research Intern',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    isRemote: true,
    jobType: 'internship',
    postedDate: '2024-01-08T15:45:00Z',
    applicationUrl: 'https://openai.com/careers/1234567890',
    description: 'Contribute to cutting-edge AI research and help develop the next generation of artificial intelligence systems.',
    shortDescription: 'Contribute to cutting-edge AI research and develop next-generation AI systems.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP'],
    requirements: [
      'Pursuing PhD or advanced degree in AI/ML or related field',
      'Strong background in machine learning and deep learning',
      'Experience with frameworks like TensorFlow or PyTorch',
      'Published research papers preferred'
    ],
    categories: ['data-science'],
    experienceLevel: 'entry',
    salaryRange: { min: 10000, max: 15000 },
    studentMatch: {
      matchScore: 95,
      status: 'interested',
      applicationStatus: 'not-applied',
      matchedSkills: ['Python', 'Machine Learning'],
      missingSkills: ['TensorFlow', 'PyTorch', 'Deep Learning', 'NLP']
    }
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Import resume matching function
import { getResumeForMatching } from './mockResumeStorage';

// Helper function to calculate match score based on resume data
const calculateMatchScore = (resumeData, job) => {
  let score = 0;
  const studentSkills = resumeData.skills || [];
  const jobSkills = job.skills || [];
  
  // Skill matching (70% of score)
  const matchedSkills = studentSkills.filter(skill => 
    jobSkills.some(jobSkill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );
  score += (matchedSkills.length / jobSkills.length) * 70;
  
  // Experience level matching (15% of score)
  if (resumeData.experienceLevel === job.experienceLevel) {
    score += 15;
  } else if (resumeData.experienceLevel === 'entry' && job.experienceLevel === 'mid') {
    score += 10; // Entry level can apply to mid-level with some penalty
  }
  
  // Job type preference (10% of score)
  if (resumeData.jobTypes && resumeData.jobTypes.includes(job.jobType)) {
    score += 10;
  }
  
  // Location preference (5% of score)
  if (job.isRemote || 
      (resumeData.preferredLocations && 
       resumeData.preferredLocations.some(loc => 
         job.location.toLowerCase().includes(loc.toLowerCase())
       ))) {
    score += 5;
  }
  
  return Math.min(Math.round(score), 100);
};

// Helper function to get matched skills
const getMatchedSkills = (studentSkills, jobSkills) => {
  return studentSkills.filter(skill => 
    jobSkills.some(jobSkill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );
};

// Helper function to get missing skills
const getMissingSkills = (studentSkills, jobSkills) => {
  return jobSkills.filter(jobSkill => 
    !studentSkills.some(skill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );
};

// Mock API functions
export const getMockJobMatches = async (studentId, options = {}) => {
  await delay(500); // Simulate network delay
  
  const {
    page = 1,
    limit = 12,
    sortBy = 'matchScore',
    sortOrder = 'desc',
    categories = [],
    jobTypes = [],
    minMatchScore = 0,
    locations = [],
    isRemote = false
  } = options;

  let filteredJobs = [...mockJobs];

  // Get resume data for better matching
  const resumeData = await getResumeForMatching(studentId);
  
  // Calculate match scores based on resume data
  if (resumeData) {
    filteredJobs = filteredJobs.map(job => {
      const matchScore = calculateMatchScore(resumeData, job);
      return {
        ...job,
        studentMatch: {
          matchScore: matchScore,
          status: 'interested',
          applicationStatus: 'not-applied',
          matchedSkills: getMatchedSkills(resumeData.skills, job.skills),
          missingSkills: getMissingSkills(resumeData.skills, job.skills)
        }
      };
    });
  } else {
    // Use default match scores if no resume data
    filteredJobs = filteredJobs.map(job => ({
      ...job,
      studentMatch: job.studentMatch || {
        matchScore: Math.floor(Math.random() * 30) + 65, // 65-95 range
        status: 'interested',
        applicationStatus: 'not-applied',
        matchedSkills: job.skills.slice(0, 3),
        missingSkills: job.skills.slice(3)
      }
    }));
  }

  // Apply filters
  if (categories.length > 0) {
    filteredJobs = filteredJobs.filter(job => 
      job.categories.some(category => categories.includes(category))
    );
  }

  if (jobTypes.length > 0) {
    filteredJobs = filteredJobs.filter(job => 
      jobTypes.includes(job.jobType)
    );
  }

  if (minMatchScore > 0) {
    filteredJobs = filteredJobs.filter(job => 
      job.studentMatch?.matchScore >= minMatchScore
    );
  }

  if (locations.length > 0) {
    filteredJobs = filteredJobs.filter(job => 
      locations.some(location => 
        job.location.toLowerCase().includes(location.toLowerCase())
      ) || job.isRemote
    );
  }

  if (isRemote) {
    filteredJobs = filteredJobs.filter(job => job.isRemote);
  }

  // Apply sorting
  filteredJobs.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'matchScore':
        aValue = a.studentMatch?.matchScore || 0;
        bValue = b.studentMatch?.matchScore || 0;
        break;
      case 'postedDate':
        aValue = new Date(a.postedDate);
        bValue = new Date(b.postedDate);
        break;
      case 'company':
        aValue = a.company.toLowerCase();
        bValue = b.company.toLowerCase();
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        aValue = a.studentMatch?.matchScore || 0;
        bValue = b.studentMatch?.matchScore || 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  return {
    matches: paginatedJobs,
    total: filteredJobs.length,
    page,
    limit,
    pages: Math.ceil(filteredJobs.length / limit)
  };
};

export const updateJobMatchStatus = async (studentId, jobId, status) => {
  await delay(200); // Simulate network delay
  
  // Find and update the job in mock data
  const jobIndex = mockJobs.findIndex(job => job._id === jobId);
  if (jobIndex !== -1) {
    mockJobs[jobIndex].studentMatch = {
      ...mockJobs[jobIndex].studentMatch,
      status: status.status,
      applicationStatus: status.applicationStatus
    };
  }
  
  return { success: true };
};

export const saveJob = async (studentId, jobId, isSaved) => {
  await delay(200); // Simulate network delay
  
  // In a real app, this would save to a database
  console.log(`${isSaved ? 'Saving' : 'Unsaving'} job ${jobId} for student ${studentId}`);
  
  return { success: true };
};

export default {
  getMockJobMatches,
  updateJobMatchStatus,
  saveJob
};
