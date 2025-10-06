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

import { useState } from 'react';
import { FileText, Sparkles, Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import ResumeUpload from './ResumeUpload';
import ResumeAnalysis from './ResumeAnalysis';
import { extractTextFromPDF, analyzeResume, extractJobContext } from '../../services/googleAI';

const ResumeReview = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const [fetchedText, setFetchedText] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [retryStatus, setRetryStatus] = useState(null);

  const handleFileUpload = async (file) => {
    console.log('=== FILE UPLOAD STARTED ===');
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });
    
    setUploadedFile(file);
    setIsAnalyzing(true);
    setError(null);
    setRetryStatus(null);
    setAnalysisData(null); // Clear previous analysis
    
    try {
      console.log('Step 1: Extracting text from PDF...');
      // Extract text from PDF
      const extractionResult = await extractTextFromPDF(file);
      console.log('Step 1 Complete: Extraction result:', extractionResult);
      
      if (!extractionResult || !extractionResult.fetchedText || extractionResult.fetchedText.trim().length === 0) {
        throw new Error('No text found in PDF. Please ensure the PDF contains selectable text.');
      }
      
      // Store extracted text for display
      setExtractedText(extractionResult.originalText);
      setFetchedText(extractionResult.fetchedText);
      
      console.log('Step 2: Analyzing resume with AI...');
      setRetryStatus('Connecting to AI service...');
      
      // Analyze resume with AI using the fetched text
      const analysis = await analyzeResume(extractionResult.fetchedText);
      console.log('Step 2 Complete: AI analysis completed:', analysis);
      
      // Check if analysis was successful
      if (analysis && analysis.parsedResponse) {
        console.log('Step 3: Setting analysis data...');
        setAnalysisData(analysis);
        setError(null); // Clear any previous errors
        console.log('=== FILE UPLOAD COMPLETE ===');
      } else {
        throw new Error('AI analysis returned invalid data. Please try again.');
      }
    } catch (error) {
      console.error('=== FILE UPLOAD ERROR ===');
      console.error('Error details:', error);
      
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
    } finally {
      setIsAnalyzing(false);
      setRetryStatus(null);
    }
  };

  const handleNewUpload = () => {
    setUploadedFile(null);
    setAnalysisData(null);
    setExtractedText(null);
    setFetchedText(null);
    setIsAnalyzing(false);
    setError(null);
    setRetryStatus(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">

        {!uploadedFile ? (
          /* Initial Upload State - Two Column Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Column - Resume Review */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Resume Review</h1>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                Currently, the resume review tool will only give feedback on your bullet points for experiences and projects. 
                This does not serve as a complete resume review, so you should still seek feedback from peers. 
                Additionally, this tool relies on AI and may not always provide the best feedback, so take it with a grain of salt.
              </p>
              <ResumeUpload onFileUpload={handleFileUpload} />
            </div>

            {/* Right Column - Instructions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">How It Works</h1>
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
                  <h1 className="text-xl font-bold text-gray-900">Resume Analysis Results</h1>
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
                  {retryStatus && (
                    <p className="text-sm text-gray-500">{retryStatus}</p>
                  )}
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
    </div>
  );
};

export default ResumeReview;
