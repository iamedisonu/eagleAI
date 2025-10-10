/*
============================================================================
FILE: src/components/resume/ResumeReview.jsx
============================================================================
PURPOSE:
  Main container for the AI Resume Review screen. Provides intelligent
  feedback on resume bullet points with scoring and improvement suggestions.

FEATURES:
  - PDF file upload with validation
  - AI-powered bullet point analysis
  - Scoring system (1-10 scale)
  - Actionable improvement suggestions
  - Copy-paste functionality for improved bullets
  - Responsive design with OC branding

CHILD COMPONENTS:
  - ResumeUpload: File upload interface
  - ResumeAnalysis: AI feedback display
  - ResumeFeedback: Individual bullet point analysis

USAGE:
  Rendered when user navigates to "Resume Review" tab in main navigation.
============================================================================
*/

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Download, Copy, CheckCircle, AlertCircle, Upload, Database, Briefcase, Target } from 'lucide-react';
import ResumeUpload from './ResumeUpload';
import ResumeAnalysis from './ResumeAnalysis';
import MockResumeStorage from './MockResumeStorage';
import MatchingJobs from './MatchingJobs';
import { extractTextFromPDF, analyzeResume, extractJobContext } from '../../services/googleAI';
import { useNotifications } from '../../context/NotificationProvider';

const ResumeReview = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const [fetchedText, setFetchedText] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  
  // Mock student ID for resume storage
  const studentId = 'mock-student-id';
  const { addNotification } = useNotifications();

  // Auto-trigger job matching after resume analysis
  useEffect(() => {
    if (analysisData && !isAnalyzing) {
      triggerJobMatching();
      updateNotificationCenter();
    }
  }, [analysisData, isAnalyzing]);

  // Provide mock resume data for demo purposes
  useEffect(() => {
    if (!resumeData && studentId) {
      setResumeData({
        extractedText: 'Experienced software developer with 2+ years of experience in JavaScript, React, and Node.js. Built multiple full-stack applications and have strong problem-solving skills.',
        analysisData: {
          overallScore: 8.5,
          extractedSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
          experience: [
            {
              title: 'Software Developer',
              company: 'Tech Startup',
              duration: '2 years',
              description: 'Built full-stack applications using React and Node.js'
            }
          ],
          education: [
            {
              degree: 'Bachelor of Science in Computer Science',
              university: 'Demo University',
              year: '2024'
            }
          ]
        },
        uploadedAt: new Date().toISOString(),
        categories: ['software-engineering'],
        preferredLocations: ['Remote', 'San Francisco', 'New York']
      });
    }
  }, [studentId, resumeData]);

  const handleFileUpload = async (file) => {
    setUploadedFile(file);
    setIsAnalyzing(true);
    setError(null);
    setAnalysisData(null); // Clear previous analysis
    
    try {
      // Extract text from PDF
      const extractionResult = await extractTextFromPDF(file);
      
      if (!extractionResult || !extractionResult.fetchedText || extractionResult.fetchedText.trim().length === 0) {
        throw new Error('No text found in PDF. Please ensure the PDF contains selectable text.');
      }
      
      // Store extracted text for display
      setExtractedText(extractionResult.originalText);
      setFetchedText(extractionResult.fetchedText);
      
      // Analyze resume with AI using the fetched text
      const analysis = await analyzeResume(extractionResult.fetchedText);
      
      // Check if analysis was successful
      if (analysis && analysis.parsedResponse) {
        setAnalysisData(analysis);
        setResumeData({
          extractedText,
          analysisData: analysis,
          uploadedAt: new Date().toISOString()
        });
        setError(null); // Clear any previous errors
      } else {
        throw new Error('AI analysis returned invalid data. Please try again.');
      }
    } catch (error) {
      
      // Set a more specific error message
      let errorMessage = 'Failed to analyze resume. Please try again.';
      
      if (error.message.includes('No text found')) {
        errorMessage = 'No text found in PDF. Please ensure the PDF contains selectable text.';
      } else if (error.message.includes('Invalid file type')) {
        errorMessage = 'Please upload a PDF file only.';
      } else if (error.message.includes('File size')) {
        errorMessage = 'File size too large. Please upload a smaller PDF.';
      } else if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('not supported')) {
        errorMessage = 'AI model is not available. Please try again later or contact support if the issue persists.';
      } else if (error.message.includes('503') || error.message.includes('overloaded')) {
        errorMessage = 'AI service is currently overloaded. We\'re automatically retrying with different models. Please wait a moment and try again.';
      } else if (error.message.includes('All models and retry attempts failed')) {
        errorMessage = 'AI service is temporarily unavailable. All retry attempts have been exhausted. Please try again in a few minutes.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('API')) {
        errorMessage = 'AI service temporarily unavailable. Please try again in a few minutes.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Create a fallback analysis for display
      const fallbackAnalysis = {
        rawResponse: `Error: ${errorMessage}`,
        parsedResponse: {
          overallScore: 3,
          categoryScores: {
            bulletPoints: 3,
            header: 3,
            education: 3,
            experience: 3,
            secondarySections: 3,
            formatting: 3,
            language: 3,
            contentQuality: 3,
            targeting: 3,
            universalStandards: 3
          },
          strengths: ["Resume uploaded successfully"],
          priorityImprovements: ["Analysis encountered an error - please try again"],
          overallAssessment: `Analysis failed: ${errorMessage}`,
          detailedFeedback: [{
            category: "System",
            location: "Overall",
            currentProblem: "Analysis failed to complete",
            whyItMatters: "Unable to provide detailed feedback due to technical issues",
            solution: "Please try uploading your resume again",
            rephrasedExample: "Retry the analysis process",
            score: 3
          }]
        },
        timestamp: new Date().toISOString()
      };
      
      setAnalysisData(fallbackAnalysis);
      setResumeData({
        extractedText,
        analysisData: fallbackAnalysis,
        uploadedAt: new Date().toISOString()
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewUpload = () => {
    setUploadedFile(null);
    setAnalysisData(null);
    setExtractedText(null);
    setFetchedText(null);
    setIsAnalyzing(false);
    setError(null);
  };

  // Trigger automatic job matching after resume analysis
  const triggerJobMatching = async () => {
    try {
      // Update student profile with resume data
      const profileData = {
        resumeText: extractedText,
        skills: analysisData?.extractedSkills || [],
        experience: analysisData?.experience || [],
        education: analysisData?.education || [],
        lastUpdated: new Date().toISOString()
      };

      // Update student profile in backend
      await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      // Generate embeddings for the student
      await fetch(`/api/rag/embedding/student/${studentId}`, {
        method: 'POST'
      });

      // Switch to matching jobs tab automatically
      setActiveTab('matching');
      
      // Add notification about job matching
      addNotification({
        id: `job-matching-${Date.now()}`,
        title: "Job Matching Started",
        message: "We're finding the best job matches based on your resume analysis.",
        type: "system",
        time: "Just now",
        read: false
      });

    } catch (error) {
      console.error('Error triggering job matching:', error);
    }
  };

  // Update notification center with resume analysis results
  const updateNotificationCenter = () => {
    if (analysisData) {
      // Add resume analysis completion notification
      addNotification({
        id: `resume-analysis-${Date.now()}`,
        title: "Resume Analysis Complete",
        message: `Your resume scored ${analysisData.overallScore}/10. ${analysisData.priorityImprovements.length} improvements suggested.`,
        type: "resume-analysis",
        time: "Just now",
        read: false
      });

      // Add job matching notification
      addNotification({
        id: `job-matching-ready-${Date.now()}`,
        title: "Job Matches Ready",
        message: "We've found personalized job recommendations based on your resume. Check the Matching Jobs tab!",
        type: "job-match",
        time: "Just now",
        read: false
      });
    }
  };

  // Handle job match interactions
  const handleJobMatch = (job, action) => {
    setJobMatches(prev => {
      const existing = prev.find(match => match._id === job._id);
      if (existing) {
        return prev.map(match => 
          match._id === job._id 
            ? { ...match, status: action, lastInteraction: new Date() }
            : match
        );
      } else {
        return [...prev, { ...job, status: action, lastInteraction: new Date() }];
      }
    });

    // Add notification for job interaction
    addNotification({
      id: `job-${action}-${job._id}-${Date.now()}`,
      title: `Job ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `You ${action} the ${job.title} position at ${job.company}.`,
      type: "job-interaction",
      time: "Just now",
      read: false
    });
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-maroon p-3 rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Review & Storage</h1>
              <p className="text-gray-600 text-sm">
                AI-powered resume analysis and storage for job matching
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold transition-all duration-200 ${
                activeTab === 'analysis'
                  ? 'bg-white text-brand-maroon shadow-sm'
                  : 'text-gray-600 hover:text-brand-maroon hover:bg-white/50'
              }`}
            >
              <Sparkles size={18} />
              AI Analysis
            </button>
            <button
              onClick={() => setActiveTab('matching')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold transition-all duration-200 ${
                activeTab === 'matching'
                  ? 'bg-white text-brand-maroon shadow-sm'
                  : 'text-gray-600 hover:text-brand-maroon hover:bg-white/50'
              }`}
            >
              <Target size={18} />
              Matching Jobs
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold transition-all duration-200 ${
                activeTab === 'storage'
                  ? 'bg-white text-brand-maroon shadow-sm'
                  : 'text-gray-600 hover:text-brand-maroon hover:bg-white/50'
              }`}
            >
              <Database size={18} />
              Resume Storage
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'analysis' && (
          <div>
            {!uploadedFile ? (
              /* Initial Upload State - Two Column Layout */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Left Column - Resume Review */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">AI Resume Analysis</h2>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Get AI-powered feedback on your resume bullet points for experiences and projects. 
                    This tool provides detailed scoring and improvement suggestions.
                  </p>
                  <ResumeUpload 
                    onFileUpload={handleFileUpload} 
                    isAnalyzing={isAnalyzing}
                    maxFileSize={10}
                  />
                </div>

                {/* Right Column - Instructions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">How It Works</h2>
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <FileText size={40} className="mx-auto" />
                    </div>
                    <p className="text-gray-500">Upload your resume to see AI-powered feedback</p>
                  </div>
                </div>
              </div>
            ) : (
              /* After Upload - Full Screen Feedback */
              <div className="w-full">
                {/* Top Navigation Bar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">Resume Analysis Results</h2>
                      {error ? (
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertCircle size={18} />
                          <span className="font-medium text-sm">{error}</span>
                        </div>
                      ) : isAnalyzing ? (
                        <div className="flex items-center gap-2 text-blue-700">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="font-medium text-sm">Analyzing...</span>
                        </div>
                      ) : analysisData ? (
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle size={18} />
                          <span className="font-medium text-sm">Analysis Complete</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText size={18} />
                          <span className="font-medium text-sm">Ready for Analysis</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleNewUpload}
                      className="flex items-center gap-2 px-3 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-crimson transition-colors duration-200 text-sm"
                    >
                      <FileText size={14} />
                      Upload New Resume
                    </button>
                  </div>
                </div>

                {/* Full Screen Feedback */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  {isAnalyzing ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon mx-auto mb-4"></div>
                      <p className="text-gray-600 mb-2">Analyzing your resume...</p>
                    </div>
                  ) : analysisData ? (
                    <ResumeAnalysis 
                      file={uploadedFile}
                      analysisData={analysisData}
                      isAnalyzing={isAnalyzing}
                      onNewUpload={handleNewUpload}
                    />
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matching' && (
          <MatchingJobs 
            studentId={studentId}
            resumeData={resumeData}
            onJobMatch={handleJobMatch}
          />
        )}

        {activeTab === 'storage' && (
          <MockResumeStorage 
            userId={studentId} 
            onResumeUpdate={(resume) => {
              // Resume updated successfully
              setResumeData(resume);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default ResumeReview;
