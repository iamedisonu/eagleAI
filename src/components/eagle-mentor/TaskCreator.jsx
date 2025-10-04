import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  X,
  Save
} from 'lucide-react';

const TaskCreator = ({ isOpen, onClose, onSave, initialMessage = '' }) => {
  const [task, setTask] = useState({
    title: initialMessage || '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: 'general',
    estimatedHours: 1
  });

  const [errors, setErrors] = useState({});

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'high', label: 'High', color: 'text-orange-600', bg: 'bg-orange-100' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600', bg: 'bg-red-100' }
  ];

  const categories = [
    { value: 'general', label: 'General', icon: Target },
    { value: 'resume', label: 'Resume', icon: CheckCircle },
    { value: 'project', label: 'Project', icon: Plus },
    { value: 'skill', label: 'Skill Development', icon: Target },
    { value: 'career', label: 'Career', icon: Target },
    { value: 'mentorship', label: 'Mentorship', icon: Target }
  ];

  const validateTask = () => {
    const newErrors = {};
    
    if (!task.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (task.estimatedHours < 0.5 || task.estimatedHours > 40) {
      newErrors.estimatedHours = 'Estimated hours must be between 0.5 and 40';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateTask()) {
      const newTask = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date(),
        status: 'pending',
        completed: false
      };
      
      onSave(newTask);
      onClose();
      
      // Reset form
      setTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        category: 'general',
        estimatedHours: 1
      });
    }
  };

  const handleQuickFill = (type) => {
    const quickFills = {
      resume: {
        title: 'Update resume with new achievements',
        description: 'Add recent projects and quantify impact',
        category: 'resume',
        priority: 'high'
      },
      project: {
        title: 'Start new project',
        description: 'Plan and begin development',
        category: 'project',
        priority: 'medium'
      },
      skill: {
        title: 'Learn new skill',
        description: 'Research and practice new technology',
        category: 'skill',
        priority: 'medium'
      },
      mentor: {
        title: 'Prepare for mentor session',
        description: 'Prepare questions and topics to discuss',
        category: 'mentorship',
        priority: 'high'
      }
    };
    
    const quickFill = quickFills[type];
    if (quickFill) {
      setTask(prev => ({ ...prev, ...quickFill }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-maroon to-brand-crimson text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Target size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Create Task</h3>
                <p className="text-sm opacity-90">Turn conversation into action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Fill Buttons */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Quick Templates</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'resume', label: 'Resume', icon: CheckCircle, color: 'bg-brand-maroon' },
                { key: 'project', label: 'Project', icon: Plus, color: 'bg-accent-teal' },
                { key: 'skill', label: 'Skill', icon: Target, color: 'bg-accent-gold' },
                { key: 'mentor', label: 'Mentor', icon: Target, color: 'bg-gray-600' }
              ].map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => handleQuickFill(key)}
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-brand-maroon hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Task Title *
            </label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => setTask(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent text-sm ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter task title..."
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Description
            </label>
            <textarea
              value={task.description}
              onChange={(e) => setTask(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent resize-none text-sm"
              rows={3}
              placeholder="Add task description..."
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) => setTask(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
              >
                {priorities.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Category
              </label>
              <select
                value={task.category}
                onChange={(e) => setTask(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
              >
                {categories.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Due Date
              </label>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => setTask(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Est. Hours
              </label>
              <input
                type="number"
                min="0.5"
                max="40"
                step="0.5"
                value={task.estimatedHours}
                onChange={(e) => setTask(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon focus:border-transparent ${
                  errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.estimatedHours && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.estimatedHours}
                </p>
              )}
            </div>
          </div>

          {/* Priority Preview */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${priorities.find(p => p.value === task.priority)?.bg}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {priorities.find(p => p.value === task.priority)?.label} Priority
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Title:</strong> {task.title || 'Untitled Task'}</p>
              <p><strong>Category:</strong> {categories.find(c => c.value === task.category)?.label}</p>
              <p><strong>Estimated Time:</strong> {task.estimatedHours} hours</p>
              {task.dueDate && (
                <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-3xl flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-crimson transition-colors duration-200"
          >
            <Save size={16} />
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCreator;
