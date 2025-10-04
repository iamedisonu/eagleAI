import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  Target, 
  CheckCircle, 
  Clock, 
  User, 
  Bot, 
  X, 
  MessageSquare,
  Calendar,
  BookOpen,
  Briefcase,
  FileText,
  Users,
  Code,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Edit3,
  Check,
  MoreVertical,
  Trash2,
  Brain
} from 'lucide-react';
import { useEagleMentor } from '../../context/EagleMentorProvider';
import TaskCreator from './TaskCreator';

const EagleMentorPanel = () => {
  const {
    isOpen,
    isMinimized,
    currentSession,
    sessions,
    messages,
    isTyping,
    unreadCount,
    userProfile,
    toggleMentor,
    closeMentor,
    sendMessage,
    createNewSession,
    switchSession,
    createTaskFromMessage,
    getContextualGreeting,
    updateSessionTitle,
    startRenamingSession
  } = useEagleMentor();

  const [inputMessage, setInputMessage] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [taskMessage, setTaskMessage] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-hide quick actions when there are messages (except welcome message)
  useEffect(() => {
    const hasRealMessages = messages.some(msg => msg.type === 'user' || (msg.type === 'ai' && !msg.id.includes('welcome')));
    if (hasRealMessages) {
      setShowQuickActions(false);
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      'resume': "Help me improve my resume",
      'projects': "Review my current projects",
      'skills': "Suggest skills I should learn",
      'career': "Give me career advice",
      'mentor': "Help me prepare for mentorship"
    };
    
    const message = actionMessages[action] || action;
    sendMessage(message);
    // Auto-hide quick actions after using one
    setShowQuickActions(false);
  };

  const handleCreateTask = (message) => {
    setTaskMessage(message);
    setShowTaskCreator(true);
  };

  const handleSaveTask = (task) => {
    // In a real app, this would save to a task management system
    console.log('Task created:', task);
    
    // Add a system message about the task creation
    const taskMessage = {
      id: `task-created-${Date.now()}`,
      type: 'system',
      content: `✅ Task created: "${task.title}"`,
      timestamp: new Date(),
      sessionId: currentSession?.id
    };
    
    setMessages(prev => [...prev, taskMessage]);
  };

  const handleStartRename = (session) => {
    setEditingTitle(session.title);
    startRenamingSession(session.id);
  };

  const handleSaveRename = (sessionId) => {
    if (editingTitle.trim()) {
      updateSessionTitle(sessionId, editingTitle.trim());
    }
    setEditingTitle('');
  };

  const handleCancelRename = () => {
    setEditingTitle('');
    startRenamingSession('');
  };

  const handleNewSession = () => {
    createNewSession();
    setShowQuickActions(true); // Show quick actions for new sessions
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'user':
        return <User size={16} className="text-brand-maroon" />;
      case 'ai':
        return <Brain size={16} className="text-accent-teal" />;
      case 'system':
        return <CheckCircle size={16} className="text-accent-gold" />;
      default:
        return <MessageSquare size={16} className="text-gray-500" />;
    }
  };

  const getMessageBg = (type) => {
    switch (type) {
      case 'user':
        return 'bg-brand-maroon text-white';
      case 'ai':
        return 'bg-gray-100 text-gray-800';
      case 'system':
        return 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`bg-white shadow-2xl transform transition-all duration-500 ease-in-out z-40 border-l border-gray-200 ${
      isMinimized 
        ? 'fixed right-0 top-0 h-16 w-[420px] shadow-lg rounded-bl-lg' 
        : 'fixed right-0 top-0 h-full w-[420px] shadow-2xl'
    } ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      {isMinimized ? (
        // Minimized view - professional header bar
        <div 
          className="h-full flex items-center justify-between bg-gradient-to-r from-brand-maroon to-brand-crimson text-white px-6 cursor-pointer hover:from-brand-crimson hover:to-brand-maroon transition-all duration-300 group shadow-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            minimizeMentor();
          }}
          title="Click to expand Eagle Mentor"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-sm">
              <Brain size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-base tracking-tight">Eagle Mentor</h3>
              <p className="text-xs opacity-80 font-medium">AI Career Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs opacity-80">Online</span>
            </div>
            
            {/* Unread count badge */}
            {unreadCount > 0 && (
              <div className="bg-accent-gold text-brand-maroon text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
            
            {/* Expand icon */}
            <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-all duration-300">
              <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        // Full panel view
        <div className="h-full flex flex-col bg-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-maroon to-brand-crimson text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Brain size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl tracking-tight">Eagle Mentor</h3>
                  <p className="text-sm opacity-90">Your AI career assistant</p>
                </div>
              </div>
              
                    <div className="flex items-center gap-2">
                      {!showQuickActions && (
                        <button
                          onClick={() => setShowQuickActions(true)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                          title="Show Quick Actions"
                        >
                          <Sparkles size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => setShowSessions(!showSessions)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                        title="Sessions"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button
                        onClick={handleNewSession}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                        title="New Session"
                      >
                        <Plus size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          closeMentor();
                        }}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                        title="Close Eagle Mentor"
                      >
                        <X size={18} />
                      </button>
                    </div>
            </div>
          </div>

          {/* Sessions Sidebar */}
          {showSessions && (
            <div className="bg-gray-50 border-b border-gray-200 p-4 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Chat History</h4>
                <button
                  onClick={handleNewSession}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="New Chat"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative p-2 rounded-lg transition-colors ${
                      currentSession?.id === session.id
                        ? 'bg-brand-maroon text-white'
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {session.isRenaming ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(session.id);
                            if (e.key === 'Escape') handleCancelRename();
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(session.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={handleCancelRename}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => switchSession(session.id)}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium truncate text-sm">{session.title}</div>
                          <div className="text-xs opacity-75">
                            {session.messageCount} messages • {new Date(session.lastMessage).toLocaleDateString()}
                          </div>
                        </button>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartRename(session)}
                            className="p-1 hover:bg-white/20 rounded"
                            title="Rename"
                          >
                            <Edit3 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions - Collapsible */}
          <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100/50 transition-colors"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent-gold" />
                <h4 className="text-sm font-semibold text-gray-700">Quick Start</h4>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  {showQuickActions ? 'Hide' : 'Show'}
                </span>
              </div>
              <div className={`transform transition-transform duration-200 ${showQuickActions ? 'rotate-180' : 'rotate-0'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </div>
            </div>
            
            {showQuickActions && (
              <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {[
                  { key: 'resume', icon: FileText, label: 'Resume Review', color: 'from-brand-maroon to-brand-crimson', desc: 'Get AI feedback on your resume' },
                  { key: 'projects', icon: Briefcase, label: 'Project Planning', color: 'from-accent-teal to-accent-teal/80', desc: 'Plan and organize your projects' },
                  { key: 'skills', icon: Code, label: 'Skills Development', color: 'from-accent-gold to-accent-gold/80', desc: 'Identify and learn new skills' },
                  { key: 'career', icon: TrendingUp, label: 'Career Guidance', color: 'from-brand-crimson to-brand-maroon', desc: 'Get personalized career advice' },
                  { key: 'mentor', icon: Users, label: 'Mentorship Prep', color: 'from-gray-600 to-gray-700', desc: 'Prepare for mentor sessions' }
                ].map(({ key, icon: Icon, label, color, desc }) => (
                  <button
                    key={key}
                    onClick={() => handleQuickAction(key)}
                    className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-brand-maroon hover:shadow-md transition-all duration-200 group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-800 group-hover:text-brand-maroon transition-colors">{label}</div>
                      <div className="text-xs text-gray-500">{desc}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-brand-maroon rounded-full"></div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-maroon/10 to-brand-crimson/10 rounded-2xl flex items-center justify-center mb-4">
                  <Brain size={32} className="text-brand-maroon" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to Eagle Mentor!</h3>
                <p className="text-sm text-gray-600 mb-4">I'm your AI career assistant, here to help you succeed.</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-brand-maroon/10 text-brand-maroon text-xs rounded-full">Resume Building</span>
                  <span className="px-3 py-1 bg-accent-teal/10 text-accent-teal text-xs rounded-full">Career Advice</span>
                  <span className="px-3 py-1 bg-accent-gold/10 text-accent-gold text-xs rounded-full">Project Guidance</span>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-brand-maroon' 
                      : 'bg-gray-200'
                  }`}>
                    {getMessageIcon(message.type)}
                  </div>
                  
                  <div className={`flex-1 max-w-xs ${message.type === 'user' ? 'text-center' : 'text-left'}`}>
                    <div className={`p-3 rounded-lg ${getMessageBg(message.type)}`}>
                      <p className="text-sm">{message.content}</p>
                      
                      {/* Suggestions for AI messages */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleCreateTask(suggestion)}
                              className="block w-full text-left text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className={`text-xs text-gray-500 mt-1 ${
                      message.type === 'user' ? 'text-center' : 'text-left'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Brain size={16} className="text-accent-teal" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Eagle Mentor is thinking</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Eagle Mentor anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-brand-maroon text-white p-2 rounded-lg hover:bg-brand-crimson disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Task Creator Modal */}
      <TaskCreator
        isOpen={showTaskCreator}
        onClose={() => setShowTaskCreator(false)}
        onSave={handleSaveTask}
        initialMessage={taskMessage}
      />
    </div>
  );
};

export default EagleMentorPanel;

