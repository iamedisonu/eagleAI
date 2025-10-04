/*
============================================================================
FILE: src/components/dashboard/Dashboard.jsx
============================================================================
PURPOSE:
  Main dashboard component providing users with a smart home screen that
  summarizes everything happening in their EagleAI environment.

FEATURES:
  - Welcome banner with personalized greeting
  - Quick-stats cards showing key metrics
  - "What's next" section with upcoming tasks
  - "Recommended for you" section with AI insights
  - Direct navigation to detailed modules

CHILD COMPONENTS:
  - DashboardStats: Quick statistics cards
  - DashboardTasks: Upcoming tasks and meetings
  - DashboardRecommendations: AI-curated suggestions

USAGE:
  Rendered when user navigates to "Dashboard" tab in main navigation.
============================================================================
*/

import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Brain, 
  Code, 
  FileText,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = ({ onNavigate }) => {
  // Mock user data
  const userName = "Edison Uwamungu";
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Function to handle navigation with scroll to top
  const handleNavigation = (tab) => {
    if (onNavigate) {
      onNavigate(tab);
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Mock dashboard data
  const statsData = {
    activeProjects: 3,
    upcomingMentorship: 2,
    roadmapProgress: 65,
    skillsPracticed: 8
  };

  const upcomingTasks = [
    {
      id: 1,
      title: "Mentorship Session with Sarah Chen",
      time: "2:00 PM",
      type: "mentorship",
      icon: Users,
      priority: "high"
    },
    {
      id: 2,
      title: "Resume Review - Software Engineer Position",
      time: "3:30 PM",
      type: "resume",
      icon: FileText,
      priority: "medium"
    },
    {
      id: 3,
      title: "Complete System Design Skill Assessment",
      time: "Tomorrow",
      type: "skills",
      icon: Code,
      priority: "low"
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: "New AI Learning Path Available",
      description: "Advanced React patterns based on your current skills",
      type: "skills",
      icon: Brain,
      action: "View Path"
    },
    {
      id: 2,
      title: "Mentor Match Found",
      description: "Sarah Chen has 95% compatibility with your goals",
      type: "mentorship",
      icon: Star,
      action: "Connect"
    },
    {
      id: 3,
      title: "Project Suggestion",
      description: "Build a full-stack e-commerce app to showcase your skills",
      type: "projects",
      icon: Briefcase,
      action: "Start Project"
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-brand-crimson';
      case 'medium': return 'text-accent-gold';
      case 'low': return 'text-accent-teal';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'high': return 'bg-brand-crimson/10';
      case 'medium': return 'bg-accent-gold/10';
      case 'low': return 'bg-accent-teal/10';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-maroon to-brand-crimson text-brand-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {userName}!
            </h1>
            <p className="text-brand-nearwhite-1">
              Here's what's happening with your career development today
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{currentTime}</div>
            <div className="text-brand-nearwhite-1 text-sm">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Projects</p>
              <p className="text-3xl font-bold text-brand-maroon">{statsData.activeProjects}</p>
            </div>
            <div className="bg-brand-maroon/10 p-3 rounded-lg">
              <Briefcase className="text-brand-maroon" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-brand-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Mentorship Sessions</p>
              <p className="text-3xl font-bold text-accent-teal">{statsData.upcomingMentorship}</p>
            </div>
            <div className="bg-accent-teal/10 p-3 rounded-lg">
              <Users className="text-accent-teal" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-brand-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Roadmap Progress</p>
              <p className="text-3xl font-bold text-accent-gold">{statsData.roadmapProgress}%</p>
            </div>
            <div className="bg-accent-gold/10 p-3 rounded-lg">
              <Brain className="text-accent-gold" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-brand-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Skills Practiced</p>
              <p className="text-3xl font-bold text-brand-crimson">{statsData.skillsPracticed}</p>
            </div>
            <div className="bg-brand-crimson/10 p-3 rounded-lg">
              <Code className="text-brand-crimson" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What's Next Section */}
        <div className="bg-brand-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-brand-maroon" size={20} />
            <h2 className="text-lg font-bold text-gray-800">What's Next</h2>
          </div>
          
          <div className="space-y-3">
            {upcomingTasks.map((task) => {
              const Icon = task.icon;
              return (
                <button 
                  key={task.id} 
                  onClick={() => handleNavigation(task.type)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 w-full text-left"
                >
                  <div className={`p-2 rounded-lg ${getPriorityBg(task.priority)}`}>
                    <Icon className={getPriorityColor(task.priority)} size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={12} />
                      {task.time}
                    </p>
                  </div>
                  <ArrowRight className="text-gray-400" size={16} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recommended for You Section */}
        <div className="bg-brand-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Star className="text-accent-gold" size={20} />
            <h2 className="text-lg font-bold text-gray-800">Recommended for You</h2>
          </div>
          
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              return (
                <button 
                  key={rec.id} 
                  onClick={() => handleNavigation(rec.type)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-brand-maroon hover:shadow-md transition-all duration-200 w-full text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-brand-maroon/10 p-2 rounded-lg">
                      <Icon className="text-brand-maroon" size={16} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{rec.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <span className="text-brand-maroon text-sm font-medium hover:text-brand-crimson transition-colors duration-200">
                        {rec.action} →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-brand-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => handleNavigation('resume')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="bg-brand-maroon/10 p-3 rounded-lg">
              <FileText className="text-brand-maroon" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700">Review Resume</span>
          </button>
          
          <button 
            onClick={() => handleNavigation('mentorship')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="bg-accent-teal/10 p-3 rounded-lg">
              <Users className="text-accent-teal" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700">Find Mentor</span>
          </button>
          
          <button 
            onClick={() => handleNavigation('projects')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="bg-accent-gold/10 p-3 rounded-lg">
              <Briefcase className="text-accent-gold" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700">Start Project</span>
          </button>
          
          <button 
            onClick={() => handleNavigation('roadmap')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="bg-brand-crimson/10 p-3 rounded-lg">
              <Brain className="text-brand-crimson" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700">View Roadmap</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
