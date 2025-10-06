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
import { FileText, Sparkles, Download, Copy, CheckCircle } from 'lucide-react';
import ResumeUpload from './ResumeUpload';
import ResumeAnalysis from './ResumeAnalysis';

const ResumeReview = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock analysis data for demonstration
  const mockAnalysisData = {
    overallScore: 7.2,
    totalBullets: 3,
    strongBullets: 2,
    needsImprovement: 1,
    bullets: [
      {
        id: 1,
        original: "Developed a Python script to automate the generation of report cards, reducing manual time from days to seconds.",
        score: 10,
        feedback: "This is a strong bullet point with a clear action verb, specific technology, and quantified impact. The time reduction from 'days to seconds' is impressive and shows significant value. This is nearly perfect as written.",
        improved: "Developed a Python script to automate the generation of report cards, reducing manual time from days to seconds.",
        category: "Experience"
      },
      {
        id: 2,
        original: "Developed a WhatsApp learning chatbot using GPT-4 API and Manychat, improving content delivery for 198 students and reducing grading time by 85% through automatic feedback.",
        score: 10,
        feedback: "Excellent bullet point! It has a strong action verb, specific technologies (GPT-4 API, Manychat), clear beneficiaries (198 students), and quantified impact (85% reduction). This demonstrates both technical skills and measurable business value.",
        improved: "Developed a WhatsApp learning chatbot using GPT-4 API and Manychat, improving content delivery for 198 students and reducing grading time by 85% through automatic feedback.",
        category: "Experience"
      },
      {
        id: 3,
        original: "Worked on various software development projects",
        score: 4,
        feedback: "This bullet point is too vague and generic. It lacks specific technologies, quantifiable results, and doesn't demonstrate the impact of your work. Consider adding specific projects, technologies used, and measurable outcomes.",
        improved: "Developed 3 full-stack web applications using React and Node.js, serving 500+ daily active users and reducing page load time by 40%",
        category: "Projects"
      }
    ]
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      setAnalysisData(mockAnalysisData);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleNewUpload = () => {
    setUploadedFile(null);
    setAnalysisData(null);
    setIsAnalyzing(false);
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <CheckCircle size={20} />
                    <span className="font-medium">File uploaded successfully</span>
                  </div>
                </div>
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
