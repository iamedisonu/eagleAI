/*
============================================================================
FILE: src/components/resume/ResumeStorage.jsx
============================================================================
PURPOSE:
  Resume storage and management component that allows users to upload,
  store, and manage their resume in the database for job matching.

FEATURES:
  - Upload and store resume in database
  - Replace existing resume
  - Preview current stored resume
  - Resume analysis and scoring
  - Integration with job matching system
  - OC brand styling

PROPS:
  - userId: Current user ID for database operations
  - onResumeUpdate: Callback when resume is updated
============================================================================
*/

import { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Download,
  Trash2,
  Eye,
  Star,
  Calendar,
  Database
} from 'lucide-react';

const ResumeStorage = ({ userId, onResumeUpdate }) => {
  const [currentResume, setCurrentResume] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useState(null);

  // Load current resume on component mount
  useEffect(() => {
    loadCurrentResume();
  }, [userId]);

  const loadCurrentResume = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/students/${userId}/resume`);
      
      // Check if response is ok and has content
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setCurrentResume(data);
        } else {
          console.warn('Response is not JSON:', response);
          setError('Invalid response format from server');
        }
      } else if (response.status === 404) {
        // No resume found, this is normal
        setCurrentResume(null);
      } else {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      setError(`Failed to load current resume: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError('');
    setSuccess('');
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }
    
    setUploadedFile(file);
  };

  const uploadResume = async () => {
    if (!uploadedFile) return;
    
    setIsUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);
      
      const response = await fetch(`/api/students/${userId}/resume`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setCurrentResume(data);
          setSuccess('Resume uploaded successfully!');
          setUploadedFile(null);
          if (onResumeUpdate) {
            onResumeUpdate(data);
          }
        } else {
          throw new Error('Invalid response format from server');
        }
      } else {
        const errorText = await response.text();
        let errorMessage = 'Failed to upload resume';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError(error.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeResume = async () => {
    if (!currentResume) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const response = await fetch(`/api/students/${userId}/resume/analyze`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentResume(prev => ({ ...prev, analysis: data }));
        setSuccess('Resume analyzed successfully!');
        if (onResumeUpdate) {
          onResumeUpdate({ ...currentResume, analysis: data });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError(error.message || 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteResume = async () => {
    if (!currentResume) return;
    
    if (!window.confirm('Are you sure you want to delete your current resume? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/students/${userId}/resume`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCurrentResume(null);
        setSuccess('Resume deleted successfully!');
        if (onResumeUpdate) {
          onResumeUpdate(null);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      setError(error.message || 'Failed to delete resume');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResume = () => {
    if (currentResume && currentResume.fileUrl) {
      window.open(currentResume.fileUrl, '_blank');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="bg-brand-white rounded-xl p-8 shadow-lg text-center">
        <RefreshCw className="text-brand-maroon animate-spin mx-auto mb-4" size={32} />
        <p className="text-gray-600">Loading resume data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Resume Status */}
      {currentResume ? (
        <div className="bg-brand-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Resume</h3>
                <p className="text-sm text-gray-600">
                  Uploaded on {formatDate(currentResume.uploadedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadResume}
                className="p-2 text-gray-600 hover:text-brand-maroon hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Download resume"
              >
                <Download size={20} />
              </button>
              <button
                onClick={deleteResume}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete resume"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Resume Analysis */}
          {currentResume.analysis ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Resume Analysis</h4>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(currentResume.analysis.overallScore)}`}>
                  {currentResume.analysis.overallScore}/10
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(currentResume.analysis.categoryScores || {}).map(([category, score]) => (
                  <div key={category} className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                      {score}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle size={20} />
                <span className="font-medium">Resume not analyzed yet</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Analyze your resume to get detailed feedback and improve job matching.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={analyzeResume}
              disabled={isAnalyzing}
              className="flex-1 bg-brand-maroon text-white px-4 py-3 rounded-lg font-semibold hover:bg-brand-crimson transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Star size={16} />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-brand-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
          <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto mb-4">
            <Database className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resume Stored</h3>
          <p className="text-gray-600 mb-4">
            Upload your resume to enable job matching and get personalized recommendations.
          </p>
        </div>
      )}

      {/* Upload New/Replace Resume */}
      <div className="bg-brand-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {currentResume ? 'Replace Resume' : 'Upload Resume'}
        </h3>
        
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
            dragActive
              ? 'border-brand-maroon bg-brand-maroon/5'
              : 'border-gray-300 hover:border-brand-maroon hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-brand-maroon/10 p-4 rounded-full mb-4">
              <Upload className="text-brand-maroon" size={32} />
            </div>
            
            <p className="text-gray-700 mb-2">
              Drag and drop or <span 
                className="text-brand-maroon font-semibold cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
              >
                browse
              </span> to upload your resume
            </p>
            
            <p className="text-gray-500 text-sm">
              PDF format only • Max size: 5MB
            </p>
          </div>
        </div>

        {/* File Preview */}
        {uploadedFile && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-brand-maroon/10 p-2 rounded-lg">
                <FileText className="text-brand-maroon" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-brand-maroon font-medium">{uploadedFile.name}</p>
                <p className="text-gray-600 text-sm">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <CheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        )}

        {/* Upload Button */}
        {uploadedFile && (
          <div className="mt-4 text-center">
            <button
              onClick={uploadResume}
              disabled={isUploading}
              className="bg-brand-maroon text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-crimson transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {isUploading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {currentResume ? 'Replace Resume' : 'Upload Resume'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle size={20} />
            <span className="font-medium">{success}</span>
          </div>
        )}
      </div>

      {/* Job Matching Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Star className="text-blue-600" size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Job Matching Enabled</h4>
            <p className="text-sm text-blue-800">
              Your stored resume will be automatically matched with relevant job opportunities. 
              Update your resume anytime to improve matching accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeStorage;
