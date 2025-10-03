/*
============================================================================
FILE: src/context/AppProvider.jsx
============================================================================
PURPOSE:
  Provider component that wraps the app and supplies mock data through context.
  Separated from AppContext.jsx to maintain Vite Fast Refresh compatibility.
  
DATA STRUCTURE:
  - careers: Career recommendations with match scores and gaps
  - mentorship: Mentor profiles with compatibility ratings
  - projects: Student projects with AI-generated insights
  - roadmap: Course planning with AI recommendations
  - skills: Skill tracking, recommendations, and certifications
============================================================================
*/

import { AppContext } from './AppContext.js';

// Mock data representing the complete application state
// In production, this would be fetched from an API or database
const mockData = {
  // Career recommendations with AI-powered matching
  careers: [
    {
      title: "Software Engineer",
      match: 92, // AI-calculated compatibility score
      avgSalary: "$85,000 - $120,000",
      outlook: "Very High (25% growth)",
      localJobs: 247,
      aiInsight: "High demand in your area with strong growth projections. Your current skills align well with 92% of job requirements.",
      // Skills the student needs to acquire for this career
      gaps: ["React Native", "Docker", "AWS", "GraphQL"]
    },
    {
      title: "Data Scientist",
      match: 78,
      avgSalary: "$95,000 - $140,000",
      outlook: "High (18% growth)",
      localJobs: 89,
      aiInsight: "Growing field with excellent opportunities. Focus on machine learning and Python to increase your match score.",
      gaps: ["Machine Learning", "Python", "TensorFlow", "Statistics"]
    },
    {
      title: "UX Designer",
      match: 65,
      avgSalary: "$70,000 - $100,000",
      outlook: "Medium (12% growth)",
      localJobs: 34,
      aiInsight: "Creative field with steady demand. Consider building a portfolio and learning Figma to improve your prospects.",
      gaps: ["Figma", "User Research", "Prototyping", "Design Systems"]
    }
  ],
  
  // Mentorship matches based on career goals and interests
  mentorship: [
    {
      name: "Sarah Chen",
      role: "Senior Software Engineer at Google",
      match: 94, // Compatibility score based on student profile
      reason: "Perfect alignment with your career goals and technical interests. Sarah has 8 years of experience in full-stack development and has mentored 15+ students successfully.",
      // AI-generated insight about mentor effectiveness
      aiInsight: "Sarah's mentees have seen 85% faster career progression and 40% higher salary increases within 2 years."
    },
    {
      name: "Michael Rodriguez",
      role: "Data Science Lead at Microsoft",
      match: 87,
      reason: "Strong match in data science and AI. Michael specializes in machine learning and has helped 20+ students transition into data roles.",
      aiInsight: "Michael's mentees have achieved 90% success rate in landing data science positions and average 60% salary increase."
    },
    {
      name: "Emily Johnson",
      role: "UX Design Director at Apple",
      match: 72,
      reason: "Good match for design-focused career path. Emily has extensive experience in user research and design systems.",
      aiInsight: "Emily's mentees have improved their design portfolios by 200% and increased job interview success rate by 75%."
    }
  ],
  
  // Student projects with AI-generated guidance
  projects: [
    {
      id: 1,
      title: "E-Commerce Web Application",
      status: "active", // Current project being worked on
      progress: 65,
      skills: ["React", "Node.js", "MongoDB", "Stripe"],
      // AI suggestion for improving project competitiveness
      aiSuggestion: "Consider implementing user authentication and adding product search functionality to make it more competitive.",
      // Next immediate action step
      aiNextStep: "Set up user registration and login system using JWT tokens.",
      // Career impact explanation
      aiImpact: "This project demonstrates full-stack development skills and will significantly boost your portfolio for software engineering roles."
    },
    {
      id: 2,
      title: "Machine Learning Price Predictor",
      status: "planned", // Project not yet started
      progress: 0,
      skills: ["Python", "Scikit-learn", "Pandas", "Flask"],
      aiSuggestion: "Start with a simple linear regression model and gradually add more complex algorithms.",
      aiNextStep: "Set up your development environment and collect housing price data from APIs.",
      aiImpact: "This project showcases your data science skills and will be highly valuable for data analyst/scientist positions."
    },
    {
      id: 3,
      title: "Mobile Fitness Tracker",
      status: "idea", // Just an idea, not started
      progress: 0,
      skills: ["React Native", "Firebase", "Charts.js"],
      aiSuggestion: "Focus on core features like step counting and workout logging before adding advanced features.",
      aiNextStep: "Research React Native development and create a basic project structure.",
      aiImpact: "Mobile development experience is highly sought after and will differentiate you in the job market."
    }
  ],
  
  // Academic roadmap with AI-powered course recommendations
  roadmap: {
    // Required and high-priority courses
    upcoming: [
      {
        id: 1,
        course: "Advanced Data Structures and Algorithms",
        semester: "Fall 2024",
        priority: "high",
        // AI explanation for why this course is important
        aiReason: "Critical for technical interviews and software engineering roles. This course will improve your problem-solving skills significantly."
      },
      {
        id: 2,
        course: "Database Systems",
        semester: "Spring 2025",
        priority: "core", // Core requirement for degree
        aiReason: "Essential for full-stack development. Database knowledge is required for 90% of software engineering positions."
      },
      {
        id: 3,
        course: "Software Engineering",
        semester: "Fall 2025",
        priority: "high",
        aiReason: "Covers industry best practices, version control, and team collaboration - directly applicable to your career goals."
      }
    ],
    
    // AI-recommended elective courses
    electives: [
      {
        id: 1,
        name: "Machine Learning Fundamentals",
        relevance: 88, // Relevance score to student's career path
        aiConfidence: "High", // AI confidence in recommendation
        reason: "High demand in job market with 25% growth. Complements your data science interests and increases career options."
      },
      {
        id: 2,
        name: "Cloud Computing and DevOps",
        relevance: 76,
        aiConfidence: "Medium",
        reason: "Growing field with excellent salary prospects. AWS and Docker skills are highly valued by employers."
      },
      {
        id: 3,
        name: "Cybersecurity Fundamentals",
        relevance: 65,
        aiConfidence: "Medium",
        reason: "Important for software engineering roles. Security knowledge is becoming increasingly important in all tech positions."
      }
    ]
  },
  
  // Skills tracking and development recommendations
  skills: {
    // AI-recommended skills to learn next
    recommended: [
      {
        name: "React.js",
        priority: "High",
        weeks: 8, // Estimated learning time
        aiMatch: 95, // Match with career goals
        reason: "Most in-demand frontend framework. 70% of frontend jobs require React knowledge."
      },
      {
        name: "Python",
        priority: "High",
        weeks: 6,
        aiMatch: 88,
        reason: "Versatile language used in web development, data science, and AI. High market demand across multiple fields."
      },
      {
        name: "AWS Cloud Services",
        priority: "Medium",
        weeks: 10,
        aiMatch: 82,
        reason: "Cloud computing is the future. AWS skills can increase salary by 20-30% and open many opportunities."
      }
    ],
    
    // Current skills being tracked
    current: [
      {
        name: "JavaScript",
        level: 75, // Proficiency level (0-100)
        demand: "Essential",
        aiGrowth: "+15%", // Projected job market growth
        jobs: "12,450" // Available jobs requiring this skill
      },
      {
        name: "HTML/CSS",
        level: 85,
        demand: "Essential",
        aiGrowth: "+8%",
        jobs: "8,920"
      },
      {
        name: "Java",
        level: 60,
        demand: "High",
        aiGrowth: "+12%",
        jobs: "9,340"
      },
      {
        name: "SQL",
        level: 45,
        demand: "High",
        aiGrowth: "+18%",
        jobs: "6,780"
      }
    ],
    
    // Certification preparation tracking
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        deadline: "December 2024",
        prep: "Not Started",
        aiReady: "25%", // AI-calculated readiness score
        // AI guidance for preparation
        aiAdvice: "Focus on EC2, S3, and VPC fundamentals first. Complete AWS free tier practice labs."
      },
      {
        name: "Google Data Analytics Certificate",
        deadline: "March 2025",
        prep: "In Progress",
        aiReady: "60%",
        aiAdvice: "Great progress! Complete SQL and Tableau modules to reach 80% readiness."
      },
      {
        name: "React Developer Certification",
        deadline: "June 2025",
        prep: "Planning",
        aiReady: "15%",
        aiAdvice: "Start with React fundamentals and build 2-3 projects before attempting certification."
      }
    ]
  }
};

/**
 * Provider component that supplies app-wide context data
 * 
 * WHY THIS FILE IS SEPARATE:
 * Vite's Fast Refresh requires component-only exports in .jsx files.
 * Mixing components with hooks causes "can't detect preamble" errors.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {React.ReactElement} Context provider wrapping children
 * 
 * @example
 * // In your main App.jsx or index.jsx
 * <AppProvider>
 *   <App />
 * </AppProvider>
 */
export const AppProvider = ({ children }) => {
  return (
    <AppContext.Provider value={mockData}>
      {children}
    </AppContext.Provider>
  );
};
