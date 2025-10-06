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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    console.log('Starting file upload process for:', file.name);
    setUploadedFile(file);
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('Extracting text from PDF...');
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      console.log('Extracted text length:', text.length);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text found in PDF. Please ensure the PDF contains selectable text.');
      }
      
      console.log('Analyzing resume with AI...');
      // Analyze resume with AI
      const analysis = await analyzeResume(text);
      console.log('AI analysis completed:', analysis);
      
      // Enhance bullets with job context
      console.log('Enhancing bullets with job context...');
      const enhancedBullets = await Promise.all(
        analysis.bullets.map(async (bullet, index) => {
          try {
            const jobContext = await extractJobContext(text, bullet.original);
            return {
              ...bullet,
              id: index + 1,
              jobTitle: jobContext.jobTitle,
              company: jobContext.company
            };
          } catch (error) {
            console.warn('Failed to extract job context for bullet:', error);
            return {
              ...bullet,
              id: index + 1,
              jobTitle: bullet.category === 'Experience' ? 'Software Developer' : 'Project',
              company: 'Company'
            };
          }
        })
      );
      
      console.log('Setting analysis data...');
      setAnalysisData({
        ...analysis,
        bullets: enhancedBullets
      });
      console.log('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setError(error.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewUpload = () => {
    setUploadedFile(null);
    setAnalysisData(null);
    setIsAnalyzing(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Column - Resume Review */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Resume Review</h1>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Currently, the resume review tool will only give feedback on your bullet points for experiences and projects. 
              This does not serve as a complete resume review, so you should still seek feedback from peers. 
              Additionally, this tool relies on AI and may not always provide the best feedback, so take it with a grain of salt.
            </p>
            
            {!uploadedFile ? (
              <ResumeUpload onFileUpload={handleFileUpload} />
            ) : (
              <div className="text-center py-8">
                {error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-red-700">
                      <AlertCircle size={20} />
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <CheckCircle size={20} />
                      <span className="font-medium">File uploaded successfully</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleNewUpload}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Upload a different file
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Feedback */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Feedback</h1>
            
            {!uploadedFile ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FileText size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500">Upload your resume to see feedback</p>
              </div>
            ) : isAnalyzing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing your resume...</p>
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
      </div>
    </div>
  );
};

export default ResumeReview;
