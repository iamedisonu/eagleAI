/*
============================================================================
FILE: src/components/jobs/JobScrapingSimulator.jsx
============================================================================
PURPOSE:
  Simulates the job scraping process from intern-list.com and other job boards.
  Shows how the scraping would work in a real implementation.

FEATURES:
  - Simulates scraping from intern-list.com categories
  - Shows real-time scraping progress
  - Displays scraped job statistics
  - Demonstrates the automation process
  - OC brand styling

USAGE:
  Used in the Career component to show how job scraping works.
============================================================================
*/

import { useState, useEffect } from 'react';
import { 
  Globe, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Database,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';

const JobScrapingSimulator = () => {
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [scrapedJobs, setScrapedJobs] = useState(0);
  const [scrapingStatus, setScrapingStatus] = useState('');
  const [lastScraped, setLastScraped] = useState(null);

  // Simulate scraping process
  const startScraping = async () => {
    setIsScraping(true);
    setScrapingProgress(0);
    setScrapedJobs(0);
    setScrapingStatus('Starting job scraping...');

    const scrapingSteps = [
      { status: 'Connecting to intern-list.com...', progress: 10, jobs: 0 },
      { status: 'Scraping Software Engineering jobs...', progress: 25, jobs: 12 },
      { status: 'Scraping Data Science jobs...', progress: 40, jobs: 18 },
      { status: 'Scraping Product Management jobs...', progress: 55, jobs: 25 },
      { status: 'Scraping Marketing jobs...', progress: 70, jobs: 32 },
      { status: 'Scraping Design jobs...', progress: 85, jobs: 28 },
      { status: 'Processing and matching jobs...', progress: 95, jobs: 35 },
      { status: 'Scraping completed successfully!', progress: 100, jobs: 42 }
    ];

    for (let i = 0; i < scrapingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setScrapingStatus(scrapingSteps[i].status);
      setScrapingProgress(scrapingSteps[i].progress);
      setScrapedJobs(scrapingSteps[i].jobs);
    }

    setLastScraped(new Date());
    setIsScraping(false);
  };

  // Auto-start scraping on component mount
  useEffect(() => {
    startScraping();
  }, []);

  return (
    <div className="bg-brand-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-brand-maroon p-3 rounded-lg">
          <Globe className="text-brand-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Job Scraping Simulator</h3>
          <p className="text-gray-600 text-sm">
            Simulating automated job scraping from intern-list.com
          </p>
        </div>
      </div>

      {/* Scraping Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isScraping ? (
              <RefreshCw className="animate-spin text-brand-maroon" size={20} />
            ) : (
              <CheckCircle className="text-green-600" size={20} />
            )}
            <span className="font-medium text-gray-900">
              {isScraping ? 'Scraping in progress...' : 'Scraping completed'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {scrapedJobs} jobs found
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-brand-maroon h-3 rounded-full transition-all duration-500"
            style={{ width: `${scrapingProgress}%` }}
          ></div>
        </div>

        {/* Status Message */}
        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          {scrapingStatus}
        </div>

        {/* Scraping Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="text-blue-600" size={16} />
              <span className="font-medium text-blue-900">intern-list.com</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• Software Engineering: 12 jobs</div>
              <div>• Data Science: 6 jobs</div>
              <div>• Product Management: 4 jobs</div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="text-green-600" size={16} />
              <span className="font-medium text-green-900">Other Sources</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <div>• Company websites: 15 jobs</div>
              <div>• Job boards: 8 jobs</div>
              <div>• LinkedIn: 5 jobs</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-brand-maroon">{scrapedJobs}</div>
            <div className="text-sm text-gray-600">Total Jobs</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <div className="text-sm text-gray-600">Companies</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">92%</div>
            <div className="text-sm text-gray-600">Match Rate</div>
          </div>
        </div>

        {/* Last Scraped Time */}
        {lastScraped && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Clock size={16} />
            <span>Last scraped: {lastScraped.toLocaleString()}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={startScraping}
            disabled={isScraping}
            className="flex-1 bg-brand-maroon text-white px-4 py-3 rounded-lg font-semibold hover:bg-brand-crimson transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isScraping ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Scraping...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Start Scraping
              </>
            )}
          </button>
          
          <button
            className="px-4 py-3 border border-brand-maroon text-brand-maroon rounded-lg font-semibold hover:bg-brand-maroon hover:text-white transition-colors duration-200"
          >
            View Logs
          </button>
        </div>

        {/* Technical Details */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Technical Implementation</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <div>• <strong>Scraping Tool:</strong> Python with BeautifulSoup & Selenium</div>
            <div>• <strong>Schedule:</strong> Every 6 hours via cron job</div>
            <div>• <strong>Data Processing:</strong> NLP matching with student profiles</div>
            <div>• <strong>Storage:</strong> MongoDB for job data persistence</div>
            <div>• <strong>Notifications:</strong> Real-time updates via WebSocket</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobScrapingSimulator;
