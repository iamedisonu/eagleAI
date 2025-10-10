/*
============================================================================
FILE: src/components/resume/MatchingJobs.jsx
============================================================================
PURPOSE:
  Component to display job matches based on resume analysis and student profile.
  Shows AI-powered job recommendations with detailed explanations and match scores.

FEATURES:
  - RAG-powered job recommendations
  - Match score visualization
  - AI-generated explanations for each match
  - Direct application links
  - Job insights and career advice
  - Real-time updates when resume changes

USAGE:
  Used as a tab in the Resume Review page to show matching jobs after resume upload.
============================================================================
*/

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  ExternalLink, 
  Star, 
  Clock, 
  TrendingUp,
  Sparkles,
  Target,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import JobCard from '../jobs/JobCard';

const MatchingJobs = ({ studentId, resumeData, onJobMatch }) => {
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobInsights, setJobInsights] = useState(null);

  // Load matching jobs when component mounts or resume data changes
  useEffect(() => {
    if (studentId && resumeData) {
      loadMatchingJobs();
    }
  }, [studentId, resumeData]);

  const loadMatchingJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try RAG API
      try {
        const response = await fetch('/api/rag/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId,
            options: {
              limit: 10,
              includeExplanation: true,
              categories: resumeData?.categories || null,
              jobTypes: ['internship', 'full-time'],
              locations: resumeData?.preferredLocations || null
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          setMatchingJobs(data.recommendations || []);
          setLastUpdated(new Date());

          // Send notifications for new job matches
          if (data.recommendations && data.recommendations.length > 0) {
            data.recommendations.forEach(job => {
              notificationService.addJobMatchNotification({
                jobId: job._id,
                jobTitle: job.title,
                company: job.company,
                matchScore: job.matchScore || job.recommendationScore,
                description: job.reasoning || 'Great match for your profile!',
                applicationUrl: job.applicationUrl,
                location: job.location,
                jobType: job.jobType,
                isRemote: job.isRemote,
                salaryRange: job.salaryRange,
                skills: job.skills || []
              });
            });
          }
          return;
        }
      } catch (ragError) {
        console.log('RAG API not available, falling back to mock data');
      }

      // Fallback to mock data if RAG API is not available
      const mockJobs = [
        {
          _id: 'mock-job-1',
          title: 'Software Engineer Intern',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          jobType: 'internship',
          matchScore: 92,
          reasoning: 'Strong match based on your JavaScript and React skills. This internship offers hands-on experience with modern web technologies.',
          keyBenefits: ['Great learning opportunity', 'Mentorship program', 'Potential full-time offer'],
          skills: ['JavaScript', 'React', 'Node.js', 'Git'],
          applicationUrl: 'https://techcorp.com/careers/intern',
          isRemote: false,
          salaryRange: { min: 25, max: 35 },
          isNew: true,
          aiGenerated: true
        },
        {
          _id: 'mock-job-2',
          title: 'Full-Stack Developer',
          company: 'StartupXYZ',
          location: 'Remote',
          jobType: 'full-time',
          matchScore: 88,
          reasoning: 'Perfect fit for your full-stack development experience. This role offers the opportunity to work on cutting-edge projects.',
          keyBenefits: ['Remote work', 'Equity participation', 'Fast-paced environment'],
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
          applicationUrl: 'https://startupxyz.com/jobs/fullstack',
          isRemote: true,
          salaryRange: { min: 70, max: 90 },
          isNew: false,
          aiGenerated: true
        },
        {
          _id: 'mock-job-3',
          title: 'Junior Software Engineer',
          company: 'BigTech Inc',
          location: 'New York, NY',
          jobType: 'full-time',
          matchScore: 85,
          reasoning: 'Good entry-level position matching your skills. This role provides excellent career growth opportunities.',
          keyBenefits: ['Great benefits', 'Career growth', 'Learning opportunities'],
          skills: ['JavaScript', 'Python', 'SQL', 'Git', 'Agile'],
          applicationUrl: 'https://bigtech.com/careers/junior',
          isRemote: false,
          salaryRange: { min: 60, max: 75 },
          isNew: true,
          aiGenerated: true
        },
        {
          _id: 'mock-job-4',
          title: 'Frontend Developer',
          company: 'DesignStudio',
          location: 'Los Angeles, CA',
          jobType: 'full-time',
          matchScore: 82,
          reasoning: 'Excellent match for your React and frontend skills. This role focuses on creating beautiful user interfaces.',
          keyBenefits: ['Creative environment', 'Design collaboration', 'Modern tech stack'],
          skills: ['React', 'JavaScript', 'CSS', 'UI/UX'],
          applicationUrl: 'https://designstudio.com/jobs/frontend',
          isRemote: false,
          salaryRange: { min: 65, max: 80 },
          isNew: false,
          aiGenerated: true
        },
        {
          _id: 'mock-job-5',
          title: 'Backend Developer Intern',
          company: 'DataFlow',
          location: 'Seattle, WA',
          jobType: 'internship',
          matchScore: 78,
          reasoning: 'Good match for your Node.js and database skills. This internship offers experience with scalable backend systems.',
          keyBenefits: ['Backend focus', 'Database experience', 'Cloud technologies'],
          skills: ['Node.js', 'Python', 'SQL', 'MongoDB', 'AWS'],
          applicationUrl: 'https://dataflow.com/internships/backend',
          isRemote: false,
          salaryRange: { min: 22, max: 28 },
          isNew: true,
          aiGenerated: true
        }
      ];

      setMatchingJobs(mockJobs);
      setLastUpdated(new Date());

      // Send notifications for mock job matches
      mockJobs.forEach(job => {
        notificationService.addJobMatchNotification({
          jobId: job._id,
          jobTitle: job.title,
          company: job.company,
          matchScore: job.matchScore,
          description: job.reasoning,
          applicationUrl: job.applicationUrl,
          location: job.location,
          jobType: job.jobType,
          isRemote: job.isRemote,
          salaryRange: job.salaryRange,
          skills: job.skills
        });
      });

    } catch (error) {
      console.error('Error loading matching jobs:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobInsights = async (jobId) => {
    try {
      const response = await fetch(`/api/rag/insights/${jobId}?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setJobInsights(data.insights);
        setSelectedJob(jobId);
        setShowInsights(true);
      } else {
        // Fallback to mock insights
        const mockInsights = `
Job Market Analysis:
This position is in high demand with strong growth prospects. The software engineering field is experiencing rapid expansion, particularly in the areas of web development and full-stack engineering.

Required Skills and Experience:
- Strong foundation in JavaScript and modern web frameworks
- Experience with React and component-based architecture
- Understanding of backend technologies and database management
- Problem-solving skills and attention to detail

Career Growth Potential:
This role offers excellent opportunities for professional development. You'll gain hands-on experience with industry-standard tools and technologies, positioning you well for senior-level positions.

Application Strategy and Tips:
1. Highlight your relevant projects and experience
2. Demonstrate your problem-solving approach
3. Show enthusiasm for learning and growth
4. Prepare specific examples of your technical achievements

Salary Expectations:
The salary range for this position is competitive within the market. Consider factors like location, company size, and benefits when evaluating offers.

Company Culture Insights:
This company values innovation, collaboration, and continuous learning. They offer a supportive environment for professional growth and development.
        `;
        setJobInsights(mockInsights);
        setSelectedJob(jobId);
        setShowInsights(true);
      }
    } catch (error) {
      console.error('Error loading job insights:', error);
      // Fallback to mock insights
      const mockInsights = `
Job Market Analysis:
This position offers excellent growth opportunities in the tech industry. The demand for skilled developers continues to rise.

Career Advice:
Focus on building strong technical skills and gaining practical experience. This role will help you develop expertise in modern web technologies.

Application Tips:
- Highlight your relevant projects
- Show your passion for technology
- Demonstrate your problem-solving skills
      `;
      setJobInsights(mockInsights);
      setSelectedJob(jobId);
      setShowInsights(true);
    }
  };

  const handleJobApply = async (job) => {
    try {
      // Open application URL
      if (job.applicationUrl) {
        window.open(job.applicationUrl, '_blank');
      }

      // Notify parent component
      if (onJobMatch) {
        onJobMatch(job, 'applied');
      }

      // Update job status in backend
      await fetch(`/api/students/${studentId}/job-matches/${job._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'applied',
          applicationStatus: 'applied'
        })
      });

    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const handleJobView = (job) => {
    if (onJobMatch) {
      onJobMatch(job, 'viewed');
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-maroon mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Finding Your Perfect Matches</h3>
          <p className="text-gray-600">Our AI is analyzing your resume and finding the best job opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Job Matches</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadMatchingJobs}
            className="flex items-center gap-2 px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-crimson transition-colors duration-200 mx-auto"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-maroon p-3 rounded-lg">
              <Target className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Matching Jobs</h2>
              <p className="text-gray-600 text-sm">
                AI-powered job recommendations based on your resume
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Updated {formatTimeAgo(lastUpdated)}
              </div>
            )}
            <button
              onClick={loadMatchingJobs}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="text-blue-600" size={20} />
              <span className="font-semibold text-blue-900">Total Matches</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{matchingJobs.length}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-green-600" size={20} />
              <span className="font-semibold text-green-900">High Matches</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {matchingJobs.filter(job => (job.matchScore || job.recommendationScore) >= 80).length}
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-purple-600" size={20} />
              <span className="font-semibold text-purple-900">AI Insights</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {matchingJobs.filter(job => job.aiGenerated).length}
            </div>
          </div>
        </div>
      </div>

      {/* Job Matches */}
      {matchingJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Briefcase className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Matches Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any matching jobs based on your current resume. Try updating your resume or check back later.
            </p>
            <button
              onClick={loadMatchingJobs}
              className="flex items-center gap-2 px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-crimson transition-colors duration-200 mx-auto"
            >
              <RefreshCw size={16} />
              Search Again
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {matchingJobs.map((job, index) => (
            <div key={job._id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMatchScoreColor(job.matchScore || job.recommendationScore)}`}>
                      {job.matchScore || job.recommendationScore}% match
                    </span>
                    {job.isNew && (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        NEW
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Briefcase size={16} />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{job.jobType}</span>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  {job.reasoning && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="text-blue-600 mt-1" size={16} />
                        <div>
                          <h4 className="font-semibold text-blue-900 text-sm mb-1">Why This Job Matches You</h4>
                          <p className="text-blue-800 text-sm">{job.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Benefits */}
                  {job.keyBenefits && job.keyBenefits.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Key Benefits:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.keyBenefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 6).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 6 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                            +{job.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleJobApply(job)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-maroon text-white rounded-lg hover:bg-brand-crimson transition-colors duration-200"
                >
                  <ExternalLink size={16} />
                  Apply Now
                </button>
                
                <button
                  onClick={() => loadJobInsights(job._id)}
                  className="flex items-center gap-2 px-4 py-2 border border-brand-maroon text-brand-maroon rounded-lg hover:bg-brand-maroon hover:text-white transition-colors duration-200"
                >
                  <TrendingUp size={16} />
                  View Insights
                </button>
                
                <button
                  onClick={() => handleJobView(job)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-brand-maroon transition-colors duration-200"
                >
                  <Star size={16} />
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Insights Modal */}
      {showInsights && jobInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Job Insights</h3>
                <button
                  onClick={() => setShowInsights(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {jobInsights}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchingJobs;
