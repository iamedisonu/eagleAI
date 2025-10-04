import React, { useState } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Clock, 
  Trash2, 
  Star, 
  Search,
  Filter,
  MoreVertical,
  Download,
  Share
} from 'lucide-react';

const CoachingSessions = ({ sessions, currentSession, onSelectSession, onDeleteSession, onExportSession }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredSessions = sessions
    .filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.summary?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastMessage) - new Date(a.lastMessage);
        case 'oldest':
          return new Date(a.lastMessage) - new Date(b.lastMessage);
        case 'mostMessages':
          return b.messageCount - a.messageCount;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getSessionStatus = (session) => {
    const daysSinceLastMessage = Math.floor(
      (new Date() - new Date(session.lastMessage)) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastMessage === 0) return 'active';
    if (daysSinceLastMessage <= 7) return 'recent';
    if (daysSinceLastMessage <= 30) return 'inactive';
    return 'archived';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      recent: 'text-blue-600 bg-blue-100',
      inactive: 'text-yellow-600 bg-yellow-100',
      archived: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || colors.inactive;
  };

  const formatDate = (date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffTime = Math.abs(now - sessionDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return sessionDate.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Coaching Sessions</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download size={16} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Share size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            >
              <option value="all">All Sessions</option>
              <option value="active">Active</option>
              <option value="recent">Recent</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="mostMessages">Most Messages</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No sessions found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSessions.map((session) => {
              const status = getSessionStatus(session);
              const isActive = currentSession?.id === session.id;
              
              return (
                <div
                  key={session.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isActive ? 'bg-brand-maroon/5 border-l-4 border-brand-maroon' : ''
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium truncate ${
                          isActive ? 'text-brand-maroon' : 'text-gray-800'
                        }`}>
                          {session.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MessageSquare size={12} />
                          {session.messageCount} messages
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(session.lastMessage)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {session.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {session.summary}
                        </p>
                      )}

                      {session.tags && session.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {session.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {session.starred && (
                        <Star size={16} className="text-yellow-500 fill-current" />
                      )}
                      
                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                        
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportSession(session);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Download size={14} />
                              Export Session
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Toggle starred status
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Star size={14} />
                              {session.starred ? 'Remove Star' : 'Star Session'}
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Delete Session
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-800">{sessions.length}</div>
            <div className="text-xs text-gray-500">Total Sessions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {sessions.reduce((sum, session) => sum + session.messageCount, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Messages</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800">
              {sessions.filter(s => getSessionStatus(s) === 'active').length}
            </div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachingSessions;
