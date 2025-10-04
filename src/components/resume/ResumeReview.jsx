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
    totalBullets: 12,
    strongBullets: 8,
    needsImprovement: 4,
    bullets: [
      {
        id: 1,
        original: "Worked on web development projects using React and Node.js",
        score: 4,
        feedback: "Too generic and lacks specific impact. Missing quantified results and technical depth.",
        improved: "Developed 3 full-stack web applications using React and Node.js, serving 500+ daily active users and reducing page load time by 40%",
        category: "Experience"
      },
      {
        id: 2,
        original: "Led a team of 5 developers to deliver a mobile app",
        score: 8,
        feedback: "Good leadership mention and team size. Could benefit from specific timeline and technical details.",
        improved: "Led a cross-functional team of 5 developers to deliver a React Native mobile app in 6 months, resulting in 10K+ downloads and 4.8-star rating",
        category: "Experience"
      },
      {
        id: 3,
        original: "Implemented database optimization techniques",
        score: 3,
        feedback: "Vague and lacks context. What techniques? What was the impact?",
        improved: "Optimized PostgreSQL database queries using indexing and query optimization, reducing average response time from 2.3s to 0.8s and improving system performance by 65%",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-brand-white rounded-lg md:rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-brand-maroon p-3 rounded-xl shadow-md">
            <FileText className="text-brand-white" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-maroon">AI Resume Review</h2>
            <p className="text-gray-600 mt-1">
              Get instant, AI-powered feedback on your resume bullet points
            </p>
          </div>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="text-accent-teal" size={16} />
            <span>Bullet point scoring (1-10)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="text-accent-teal" size={16} />
            <span>Actionable improvement suggestions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="text-accent-teal" size={16} />
            <span>Quantified impact recommendations</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      {!uploadedFile ? (
        <ResumeUpload onFileUpload={handleFileUpload} />
      ) : (
        <ResumeAnalysis 
          file={uploadedFile}
          analysisData={analysisData}
          isAnalyzing={isAnalyzing}
          onNewUpload={handleNewUpload}
        />
      )}
    </div>
  );
};

export default ResumeReview;
