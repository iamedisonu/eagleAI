/*
============================================================================
FILE: src/components/shared/UniversalSearch.jsx
============================================================================
PURPOSE:
  Universal search component that allows users to search across all EagleAI
  features from one place with live suggestions and filtering.

FEATURES:
  - Live search suggestions as user types
  - Filter by category (All, Projects, Mentorship, Skills, Resume, Roadmap)
  - Click to navigate to relevant modules
  - Mock data with realistic search results
  - OC brand styling

PROPS:
  - isOpen: Boolean for search overlay state
  - onToggle: Function to toggle search overlay
  - onClose: Function to close search overlay
============================================================================
*/

import { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  Users, 
  Briefcase, 
  Brain, 
  Code,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';

const UniversalSearch = ({ isOpen, onToggle, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState([]);

  // Mock search data
  const mockData = [
    {
      id: 1,
      title: "Mentor: Sarah Chen",
      subtitle: "Upcoming Session - Software Engineering",
      type: "mentorship",
      icon: Users,
      category: "Mentorship",
      lastActivity: "2 hours ago"
    },
    {
      id: 2,
      title: "Project: ML Resume Screener",
      subtitle: "Python, Machine Learning, Flask",
      type: "projects",
      icon: Briefcase,
      category: "Projects",
      lastActivity: "1 day ago"
    },
    {
      id: 3,
      title: "Skill: System Design",
      subtitle: "Level 3 - Advanced Concepts",
      type: "skills",
      icon: Code,
      category: "Skills",
      lastActivity: "3 days ago"
    },
    {
      id: 4,
      title: "Resume: Software Engineer",
      subtitle: "Last reviewed 2 days ago",
      type: "resume",
      icon: FileText,
      category: "Resume Review",
      lastActivity: "2 days ago"
    },
    {
      id: 5,
      title: "Roadmap: Full-Stack Development",
      subtitle: "65% Complete - Next: React Advanced",
      type: "roadmap",
      icon: Brain,
      category: "Roadmap",
      lastActivity: "1 week ago"
    },
    {
      id: 6,
      title: "Mentor: John Smith",
      subtitle: "Data Science Expert",
      type: "mentorship",
      icon: Users,
      category: "Mentorship",
      lastActivity: "1 week ago"
    },
    {
      id: 7,
      title: "Project: E-commerce Platform",
      subtitle: "React, Node.js, MongoDB",
      type: "projects",
      icon: Briefcase,
      category: "Projects",
      lastActivity: "2 weeks ago"
    },
    {
      id: 8,
      title: "Skill: React Hooks",
      subtitle: "Level 2 - Intermediate",
      type: "skills",
      icon: Code,
      category: "Skills",
      lastActivity: "2 weeks ago"
    }
  ];

  const filters = [
    { id: 'all', label: 'All', count: mockData.length },
    { id: 'projects', label: 'Projects', count: mockData.filter(item => item.type === 'projects').length },
    { id: 'mentorship', label: 'Mentorship', count: mockData.filter(item => item.type === 'mentorship').length },
    { id: 'skills', label: 'Skills', count: mockData.filter(item => item.type === 'skills').length },
    { id: 'resume', label: 'Resume', count: mockData.filter(item => item.type === 'resume').length },
    { id: 'roadmap', label: 'Roadmap', count: mockData.filter(item => item.type === 'roadmap').length }
  ];

  // Filter and search logic
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    let filtered = mockData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
    );

    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === activeFilter);
    }

    setSearchResults(filtered.slice(0, 8)); // Limit to 8 results
  }, [query, activeFilter]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'resume': return 'text-brand-maroon';
      case 'mentorship': return 'text-accent-teal';
      case 'projects': return 'text-accent-gold';
      case 'skills': return 'text-brand-crimson';
      case 'roadmap': return 'text-accent-bluegray';
      default: return 'text-gray-600';
    }
  };

  const getTypeBg = (type) => {
    switch (type) {
      case 'resume': return 'bg-brand-maroon/10';
      case 'mentorship': return 'bg-accent-teal/10';
      case 'projects': return 'bg-accent-gold/10';
      case 'skills': return 'bg-brand-crimson/10';
      case 'roadmap': return 'bg-accent-bluegray/10';
      default: return 'bg-gray-100';
    }
  };

  const handleResultClick = (result) => {
    console.log(`Navigate to ${result.type} page:`, result.title);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-brand-white/10 text-brand-white rounded-lg hover:bg-brand-white/20 transition-colors duration-200"
      >
        <Search size={18} />
        <span className="hidden sm:inline">Search...</span>
      </button>

      {/* Search Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50" 
            onClick={onClose}
          />
          
          {/* Search Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 bg-brand-white rounded-xl shadow-2xl z-50">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <Search className="text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search across all features..."
                className="w-80 text-lg outline-none placeholder-gray-400 text-[#811429]"
                autoFocus
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 overflow-x-auto">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-brand-maroon text-brand-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.trim() === '' ? (
                <div className="p-8 text-center text-gray-500">
                  <Search size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Search across all features</p>
                  <p className="text-sm">Find projects, mentors, skills, and more</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No results found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((result) => {
                    const Icon = result.icon;
                    return (
                      <div
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getTypeBg(result.type)}`}>
                            <Icon className={getTypeColor(result.type)} size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 truncate">
                              {result.title}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {result.subtitle}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {result.category}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {result.lastActivity}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="text-gray-400" size={16} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Press Enter to search, Esc to close</span>
                <span>{searchResults.length} results</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UniversalSearch;
