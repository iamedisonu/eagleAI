/*
============================================================================
FILE: src/context/AppContext.jsx
============================================================================
PURPOSE:
  Global state management for the EagleAI application. Provides mock data
  for all components including careers, mentorship, projects, roadmap, and skills.

FEATURES:
  - React Context API for global state
  - Mock data for all application sections
  - useApp hook for easy context consumption
  - Realistic data structure matching component expectations

DATA STRUCTURE:
  - careers: Array of career objects with match %, salary, outlook, etc.
  - mentorship: Array of mentor profiles with compatibility scores
  - projects: Array of project objects with status, progress, AI insights
  - roadmap: Object with upcoming courses and elective recommendations
  - skills: Object with recommended, current, and certification data
============================================================================
*/

import { createContext, useContext } from 'react';

// Create the context
const AppContext = createContext();

// Mock data for the application
const mockData = {
  careers: [
    {
      title: "Software Engineer",
      match: 92,
      avgSalary: "$85,000 - $120,000",
      outlook: "Very High (25% growth)",
      localJobs: 247,
      aiInsight: "High demand in your area with strong growth projections. Your current skills align well with 92% of job requirements.",
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
  
  mentorship: [
    {
      name: "Sarah Chen",
      role: "Senior Software Engineer at Google",
      match: 94,
      reason: "Perfect alignment with your career goals and technical interests. Sarah has 8 years of experience in full-stack development and has mentored 15+ students successfully.",
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
  
  projects: [
    {
      id: 1,
      title: "E-Commerce Web Application",
      status: "active",
      progress: 65,
      skills: ["React", "Node.js", "MongoDB", "Stripe"],
      aiSuggestion: "Consider implementing user authentication and adding product search functionality to make it more competitive.",
      aiNextStep: "Set up user registration and login system using JWT tokens.",
      aiImpact: "This project demonstrates full-stack development skills and will significantly boost your portfolio for software engineering roles."
    },
    {
      id: 2,
      title: "Machine Learning Price Predictor",
      status: "planned",
      progress: 0,
      skills: ["Python", "Scikit-learn", "Pandas", "Flask"],
      aiSuggestion: "Start with a simple linear regression model and gradually add more complex algorithms.",
      aiNextStep: "Set up your development environment and collect housing price data from APIs.",
      aiImpact: "This project showcases your data science skills and will be highly valuable for data analyst/scientist positions."
    },
    {
      id: 3,
      title: "Mobile Fitness Tracker",
      status: "idea",
      progress: 0,
      skills: ["React Native", "Firebase", "Charts.js"],
      aiSuggestion: "Focus on core features like step counting and workout logging before adding advanced features.",
      aiNextStep: "Research React Native development and create a basic project structure.",
      aiImpact: "Mobile development experience is highly sought after and will differentiate you in the job market."
    }
  ],
  
  roadmap: {
    upcoming: [
      {
        id: 1,
        course: "Advanced Data Structures and Algorithms",
        semester: "Fall 2024",
        priority: "high",
        aiReason: "Critical for technical interviews and software engineering roles. This course will improve your problem-solving skills significantly."
      },
      {
        id: 2,
        course: "Database Systems",
        semester: "Spring 2025",
        priority: "core",
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
    electives: [
      {
        id: 1,
        name: "Machine Learning Fundamentals",
        relevance: 88,
        aiConfidence: "High",
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
  
  skills: {
    recommended: [
      {
        name: "React.js",
        priority: "High",
        weeks: 8,
        aiMatch: 95,
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
    current: [
      {
        name: "JavaScript",
        level: 75,
        demand: "Essential",
        aiGrowth: "+15%",
        jobs: "12,450"
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
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        deadline: "December 2024",
        prep: "Not Started",
        aiReady: "25%",
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

// Context provider component
export const AppProvider = ({ children }) => {
  return (
    <AppContext.Provider value={mockData}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
