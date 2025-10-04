import React, { createContext, useContext, useState, useEffect } from 'react';
import { Brain, MessageCircle, Plus, Target, CheckCircle, Clock } from 'lucide-react';

const EagleMentorContext = createContext();

export const useEagleMentor = () => {
  const context = useContext(EagleMentorContext);
  if (!context) {
    throw new Error('useEagleMentor must be used within an EagleMentorProvider');
  }
  return context;
};

export const EagleMentorProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock user profile data for context-aware responses
  const userProfile = {
    name: "Edison Uwamungu",
    currentPage: "dashboard", // This will be updated based on active tab
    skills: ["React", "JavaScript", "Node.js", "Python", "SQL"],
    currentProjects: [
      { name: "EagleAI Platform", status: "active", progress: 75 },
      { name: "Portfolio Website", status: "completed", progress: 100 },
      { name: "Mobile App", status: "planned", progress: 0 }
    ],
    upcomingMentorship: 2,
    skillsPracticed: 12,
    careerGoals: ["Software Engineer", "Full-Stack Developer", "Tech Lead"],
    recentActivity: [
      "Completed React course",
      "Updated resume with AI feedback",
      "Connected with mentor Sarah Chen"
    ]
  };

  // Update current page based on active tab (this would be passed from App.jsx)
  const updateCurrentPage = (page) => {
    userProfile.currentPage = page;
  };

  // Initialize with welcome message
  useEffect(() => {
    if (sessions.length === 0) {
      try {
        createNewSession();
      } catch (error) {
        console.error('Error creating initial session:', error);
      }
    }
  }, []);

  // Debug: Log context state changes
  useEffect(() => {
    console.log('EagleMentor Context - isOpen:', isOpen, 'isMinimized:', isMinimized);
  }, [isOpen, isMinimized]);

  const createNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: `New Chat`,
      createdAt: new Date(),
      lastMessage: new Date(),
      messageCount: 0,
      isRenaming: false
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    
    // Add welcome message
    const welcomeMessage = {
      id: `welcome-${Date.now()}`,
      type: 'ai',
      content: `Hi ${userProfile.name}! I'm Eagle Mentor, your personal AI career guide. I'm here to help you with your career development, skill building, and project guidance. What would you like to work on today?`,
      timestamp: new Date(),
      sessionId: newSession.id
    };
    
    setMessages([welcomeMessage]);
  };

  const generateSessionTitle = (messages) => {
    if (messages.length <= 1) return "New Chat";
    
    // Analyze the first few messages to generate a meaningful title
    const userMessages = messages.filter(msg => msg.type === 'user').slice(0, 3);
    const firstUserMessage = userMessages[0]?.content.toLowerCase() || '';
    
    // Simple keyword-based title generation
    if (firstUserMessage.includes('resume') || firstUserMessage.includes('cv')) {
      return "Resume Review & Improvement";
    } else if (firstUserMessage.includes('project') || firstUserMessage.includes('portfolio')) {
      return "Project Planning & Development";
    } else if (firstUserMessage.includes('skill') || firstUserMessage.includes('learn')) {
      return "Skills Development & Learning";
    } else if (firstUserMessage.includes('career') || firstUserMessage.includes('job')) {
      return "Career Guidance & Planning";
    } else if (firstUserMessage.includes('mentor') || firstUserMessage.includes('mentorship')) {
      return "Mentorship Preparation";
    } else if (firstUserMessage.includes('interview')) {
      return "Interview Preparation";
    } else if (firstUserMessage.includes('network') || firstUserMessage.includes('networking')) {
      return "Networking & Professional Growth";
    } else {
      // Generate title from first few words of the conversation
      const words = firstUserMessage.split(' ').slice(0, 4);
      return words.length > 0 ? words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') : "Career Discussion";
    }
  };

  const updateSessionTitle = (sessionId, newTitle) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, title: newTitle, isRenaming: false }
        : session
    ));
  };

  const startRenamingSession = (sessionId) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, isRenaming: true }
        : { ...session, isRenaming: false }
    ));
  };

  const getContextualGreeting = (page) => {
    const greetings = {
      dashboard: `Welcome back, ${userProfile.name}! I see you have ${userProfile.currentProjects.filter(p => p.status === 'active').length} active projects. How can I help you today?`,
      resume: `I notice you're working on your resume. I can help you improve your bullet points, suggest better action verbs, or review your overall structure. What specific area would you like to focus on?`,
      mentorship: `Great to see you in the mentorship section! You have ${userProfile.upcomingMentorship} upcoming sessions. Would you like help preparing for your next meeting or finding the right mentor?`,
      projects: `I see you're managing your projects. You have ${userProfile.currentProjects.length} total projects with ${userProfile.currentProjects.filter(p => p.status === 'active').length} active ones. Need help prioritizing or planning your next steps?`,
      skills: `You've practiced ${userProfile.skillsPracticed} skills recently! That's impressive. I can help you identify skill gaps, suggest learning paths, or recommend certifications. What's your focus?`,
      roadmap: `Looking at your learning roadmap? I can help you adjust your timeline, suggest additional courses, or create a personalized study plan. What are you working towards?`
    };
    
    return greetings[page] || greetings.dashboard;
  };

  const generateAIResponse = (userMessage, context) => {
    const responses = {
      // General responses
      greeting: [
        "I'm excited to help you on your career journey! What specific area would you like to focus on today?",
        "Great to connect! I can help with resume building, skill development, project planning, or career guidance. What's on your mind?",
        "Hello! I'm here to support your professional growth. How can I assist you today?"
      ],
      
      // Resume-related responses
      resume: [
        "For your resume, I'd suggest focusing on quantifiable achievements. Instead of 'Developed web applications,' try 'Built 3 full-stack applications serving 500+ users, improving performance by 30%.'",
        "Your resume looks strong! Consider adding more specific technologies and their impact. What's your strongest project that you'd like to highlight?",
        "I notice you could strengthen your action verbs. Instead of 'worked on,' try 'engineered,' 'architected,' or 'optimized.' What section would you like to improve?"
      ],
      
      // Project-related responses
      projects: [
        "Your project portfolio shows great diversity! For your next project, I'd recommend focusing on a technology you want to learn or a real-world problem you're passionate about.",
        "I see you have some active projects. Let's break down your next steps into smaller, manageable tasks. What's your biggest challenge right now?",
        "Your projects demonstrate strong technical skills. Consider adding more documentation and showcasing the business impact. How can I help you improve your project presentation?"
      ],
      
      // Skills-related responses
      skills: [
        `Based on your current skills (${userProfile.skills.join(', ')}), I'd recommend exploring cloud technologies like AWS or Azure to stay competitive.`,
        "Your skill progression looks great! Consider adding soft skills like leadership or project management to complement your technical abilities.",
        "I notice you're strong in frontend technologies. Have you considered learning DevOps or system design to become a more well-rounded developer?"
      ],
      
      // Career guidance responses
      career: [
        `Given your goals of becoming a ${userProfile.careerGoals[0]}, I'd suggest focusing on building a strong portfolio and networking. What's your timeline?`,
        "Your career path looks promising! Consider setting specific milestones for each role you're targeting. What's your biggest concern about reaching your goals?",
        "I can help you create a personalized career roadmap. What specific role or company are you most interested in pursuing?"
      ],
      
      // Mentorship responses
      mentorship: [
        "Mentorship is crucial for career growth! I can help you prepare questions for your next session or suggest topics to discuss with your mentor.",
        "Your upcoming mentorship sessions are a great opportunity. What specific challenges or goals would you like to discuss with your mentor?",
        "I can help you make the most of your mentorship relationships. What's the most valuable advice you've received so far?"
      ]
    };

    // Simple keyword matching for demo purposes
    const message = userMessage.toLowerCase();
    
    if (message.includes('resume') || message.includes('cv')) {
      return responses.resume[Math.floor(Math.random() * responses.resume.length)];
    } else if (message.includes('project') || message.includes('portfolio')) {
      return responses.projects[Math.floor(Math.random() * responses.projects.length)];
    } else if (message.includes('skill') || message.includes('learn') || message.includes('course')) {
      return responses.skills[Math.floor(Math.random() * responses.skills.length)];
    } else if (message.includes('career') || message.includes('job') || message.includes('interview')) {
      return responses.career[Math.floor(Math.random() * responses.career.length)];
    } else if (message.includes('mentor') || message.includes('mentorship')) {
      return responses.mentorship[Math.floor(Math.random() * responses.mentorship.length)];
    } else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    } else {
      return "That's an interesting question! I'd be happy to help you with that. Could you provide a bit more context so I can give you the most relevant advice?";
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      sessionId: currentSession?.id
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(content, userProfile);
      
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        sessionId: currentSession?.id,
        suggestions: generateSuggestions(content)
      };

      setMessages(prev => {
        const newMessages = [...prev, aiMessage];
        
        // Auto-generate session title after first user message
        if (currentSession && currentSession.messageCount === 0) {
          const newTitle = generateSessionTitle(newMessages);
          setSessions(prevSessions => prevSessions.map(session => 
            session.id === currentSession.id 
              ? { ...session, title: newTitle, lastMessage: new Date(), messageCount: session.messageCount + 1 }
              : session
          ));
        } else if (currentSession) {
          setSessions(prevSessions => prevSessions.map(session => 
            session.id === currentSession.id 
              ? { ...session, lastMessage: new Date(), messageCount: session.messageCount + 1 }
              : session
          ));
        }
        
        return newMessages;
      });
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  };

  const generateSuggestions = (userMessage) => {
    const suggestions = [
      "Create a task for this",
      "Add to my roadmap",
      "Schedule a mentor session",
      "Review my resume",
      "Update my skills"
    ];
    
    return suggestions.slice(0, 3);
  };

  const createTaskFromMessage = (message) => {
    // This would integrate with your task management system
    console.log('Creating task from message:', message);
    // For now, just show a success message
    const taskMessage = {
      id: `task-${Date.now()}`,
      type: 'system',
      content: `✅ Task created: "${message}"`,
      timestamp: new Date(),
      sessionId: currentSession?.id
    };
    
    setMessages(prev => [...prev, taskMessage]);
  };

  const toggleMentor = () => {
    try {
      console.log('Toggling mentor, current state:', isOpen);
      setIsOpen(!isOpen);
      if (!isOpen) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error toggling mentor:', error);
    }
  };

  const closeMentor = () => {
    try {
      console.log('Closing mentor');
      setIsOpen(false);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error closing mentor:', error);
    }
  };

  const minimizeMentor = () => {
    setIsMinimized(!isMinimized);
  };

  const switchSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      // In a real app, you'd load messages for this session
      setMessages([]);
    }
  };

  const value = {
    // State
    isOpen,
    isMinimized,
    currentSession,
    sessions,
    messages,
    isTyping,
    unreadCount,
    userProfile,
    
    // Actions
    toggleMentor,
    closeMentor,
    minimizeMentor,
    sendMessage,
    createNewSession,
    switchSession,
    createTaskFromMessage,
    getContextualGreeting,
    updateCurrentPage,
    updateSessionTitle,
    startRenamingSession
  };

  return (
    <EagleMentorContext.Provider value={value}>
      {children}
    </EagleMentorContext.Provider>
  );
};
