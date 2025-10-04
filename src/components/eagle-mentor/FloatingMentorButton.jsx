import React from 'react';
import { MessageCircle, X, Bot, MessageSquare, Sparkles, Brain } from 'lucide-react';
import { useEagleMentor } from '../../context/EagleMentorProvider';

const FloatingMentorButton = () => {
  const { 
    isOpen, 
    isMinimized, 
    unreadCount, 
    toggleMentor, 
    minimizeMentor 
  } = useEagleMentor();

  if (isOpen) {
    return null; // No floating controls when panel is open
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <button
          onClick={toggleMentor}
          className="group relative bg-gradient-to-br from-brand-maroon to-brand-crimson text-white p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          title="Open Eagle Mentor"
        >
          {/* AI Assistant Icon */}
          <div className="flex items-center justify-center">
            <Brain size={24} className="text-white" />
          </div>
        </button>
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-accent-gold text-brand-maroon text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Brain size={14} />
            <span className="font-medium">Eagle Mentor</span>
          </div>
          <p className="text-xs text-gray-300 mt-1">Your AI career assistant</p>
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default FloatingMentorButton;
