/*
============================================================================
FILE: src/components/jobs/JobMatches.jsx
============================================================================
PURPOSE:
  Main component for displaying job matches for students. Shows matched jobs
  with filtering, sorting, and search capabilities.

FEATURES:
  - List of matched jobs with match scores
  - Filtering by category, job type, and match score
  - Sorting by match score, date, or company
  - Search functionality
  - Pagination for large result sets
  - Real-time updates via WebSocket
  - OC brand styling
============================================================================
*/

import { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc,
  Briefcase,
  MapPin,
  Calendar,
  Star,
  RefreshCw
} from 'lucide-react';
import JobCard from './JobCard';
import JobFilters from './JobFilters';
import { getMockJobMatches, updateJobMatchStatus, saveJob } from '../../services/mockJobData';

const JobMatches = ({ studentId }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('matchScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    categories: [],
    jobTypes: [],
    minMatchScore: 0,
    locations: [],
    isRemote: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Fetch job matches using mock data
  const fetchJobMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const options = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        categories: filters.categories,
        jobTypes: filters.jobTypes,
        minMatchScore: filters.minMatchScore,
        locations: filters.locations,
        isRemote: filters.isRemote
      };

      const data = await getMockJobMatches(studentId, options);
      setJobs(data.matches || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        pages: Math.ceil((data.total || 0) / pagination.limit)
      }));

    } catch (err) {
      setError(err.message);
      console.error('Error fetching job matches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply search and filters
  useEffect(() => {
    let filtered = [...jobs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(job => 
        job.categories.some(category => filters.categories.includes(category))
      );
    }

    // Apply job type filter
    if (filters.jobTypes.length > 0) {
      filtered = filtered.filter(job => 
        filters.jobTypes.includes(job.jobType)
      );
    }

    // Apply match score filter
    if (filters.minMatchScore > 0) {
      filtered = filtered.filter(job => 
        job.studentMatch?.matchScore >= filters.minMatchScore
      );
    }

    // Apply location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(job => 
        filters.locations.some(location => 
          job.location.toLowerCase().includes(location.toLowerCase())
        ) || job.isRemote
      );
    }

    // Apply remote filter
    if (filters.isRemote) {
      filtered = filtered.filter(job => job.isRemote);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'matchScore':
          aValue = a.studentMatch?.matchScore || 0;
          bValue = b.studentMatch?.matchScore || 0;
          break;
        case 'postedDate':
          aValue = new Date(a.postedDate);
          bValue = new Date(b.postedDate);
          break;
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = a.studentMatch?.matchScore || 0;
          bValue = b.studentMatch?.matchScore || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredJobs(filtered);

  }, [jobs, searchTerm, filters, sortBy, sortOrder]);

  // Initial load
  useEffect(() => {
    if (studentId) {
      fetchJobMatches();
    }
  }, [studentId, pagination.page, sortBy, sortOrder]);

  const handleApply = async (job) => {
    try {
      // Update job match status to 'applied' using mock service
      await updateJobMatchStatus(studentId, job._id, {
        status: 'applied',
        applicationStatus: 'applied'
      });

      // Update local state
      setJobs(prev => prev.map(j => 
        j._id === job._id 
          ? { 
              ...j, 
              studentMatch: { 
                ...j.studentMatch, 
                status: 'applied',
                applicationStatus: 'applied'
              }
            }
          : j
      ));
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleSave = async (job, isSaved) => {
    try {
      // Use mock service for save/unsave functionality
      await saveJob(studentId, job._id, isSaved);
      console.log(`${isSaved ? 'Saving' : 'Unsaving'} job:`, job.title);
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleViewDetails = (job) => {
    // Implement job details modal or navigation
    console.log('Viewing job details:', job.title);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleRefresh = () => {
    fetchJobMatches();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin text-brand-maroon" size={24} />
          <span className="text-gray-600">Loading job matches...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Briefcase size={48} className="mx-auto mb-2" />
          <p className="text-lg font-semibold">Error Loading Jobs</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-brand-maroon text-white px-4 py-2 rounded-lg hover:bg-brand-crimson transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Job Matches</h2>
          <p className="text-gray-600">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} matched to your profile
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-brand-maroon hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh matches"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-brand-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-maroon focus:border-transparent"
            >
              <option value="matchScore-desc">Best Match</option>
              <option value="postedDate-desc">Newest First</option>
              <option value="postedDate-asc">Oldest First</option>
              <option value="company-asc">Company A-Z</option>
              <option value="company-desc">Company Z-A</option>
            </select>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-brand-maroon text-white border-brand-maroon' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <JobFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>

      {/* Results */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Matches Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.values(filters).some(f => f.length > 0 || f > 0)
              ? 'Try adjusting your search or filters'
              : 'We\'re working on finding more jobs that match your profile'
            }
          </p>
          {(searchTerm || Object.values(filters).some(f => f.length > 0 || f > 0)) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  categories: [],
                  jobTypes: [],
                  minMatchScore: 0,
                  locations: [],
                  isRemote: false
                });
              }}
              className="bg-brand-maroon text-white px-4 py-2 rounded-lg hover:bg-brand-crimson transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={handleApply}
              onSave={handleSave}
              onViewDetails={handleViewDetails}
              showMatchScore={true}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default JobMatches;

