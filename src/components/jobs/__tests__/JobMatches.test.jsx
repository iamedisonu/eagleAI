/*
============================================================================
FILE: src/components/jobs/__tests__/JobMatches.test.jsx
============================================================================
PURPOSE:
  Unit tests for JobMatches component.
  Tests job listing, filtering, sorting, and user interactions.

TEST COVERAGE:
  - Component rendering with different states
  - Loading state with skeleton loaders
  - Error state handling
  - Search functionality
  - Filter application
  - Sorting functionality
  - Pagination
  - User interactions (apply, save, view details)
============================================================================
*/

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobMatches from '../JobMatches';

// Mock the services
jest.mock('../../services/mockJobData', () => ({
  getMockJobMatches: jest.fn(),
  updateJobMatchStatus: jest.fn(),
  saveJob: jest.fn()
}));

// Mock the JobCard component
jest.mock('../JobCard', () => {
  return function MockJobCard({ job, onApply, onSave, onViewDetails }) {
    return (
      <div data-testid={`job-card-${job._id}`}>
        <h3>{job.title}</h3>
        <p>{job.company}</p>
        <button onClick={() => onApply(job)}>Apply</button>
        <button onClick={() => onSave(job, true)}>Save</button>
        <button onClick={() => onViewDetails(job)}>View Details</button>
      </div>
    );
  };
});

// Mock the JobFilters component
jest.mock('../JobFilters', () => {
  return function MockJobFilters({ filters, onFiltersChange, onClose }) {
    return (
      <div data-testid="job-filters">
        <button onClick={() => onFiltersChange({ ...filters, categories: ['software-engineering'] })}>
          Filter by Software Engineering
        </button>
        <button onClick={onClose}>Close Filters</button>
      </div>
    );
  };
});

import { getMockJobMatches, updateJobMatchStatus, saveJob } from '../../services/mockJobData';

const mockJobs = [
  {
    _id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    description: 'Great opportunity for software engineers',
    location: 'San Francisco, CA',
    jobType: 'full-time',
    categories: ['software-engineering'],
    postedDate: '2024-01-15',
    isRemote: false,
    studentMatch: {
      matchScore: 85,
      status: 'new',
      applicationStatus: 'not-applied'
    }
  },
  {
    _id: '2',
    title: 'Data Scientist',
    company: 'Data Inc',
    description: 'Looking for data science expertise',
    location: 'New York, NY',
    jobType: 'full-time',
    categories: ['data-science'],
    postedDate: '2024-01-14',
    isRemote: true,
    studentMatch: {
      matchScore: 92,
      status: 'viewed',
      applicationStatus: 'not-applied'
    }
  }
];

describe('JobMatches', () => {
  const mockStudentId = 'student-123';

  beforeEach(() => {
    jest.clearAllMocks();
    getMockJobMatches.mockResolvedValue({
      matches: mockJobs,
      total: mockJobs.length,
      page: 1,
      pages: 1
    });
  });

  it('renders loading state initially', () => {
    render(<JobMatches studentId={mockStudentId} />);
    
    expect(screen.getByText('Loading job matches...')).toBeInTheDocument();
  });

  it('renders job list after loading', async () => {
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Job Matches')).toBeInTheDocument();
    });
    
    expect(screen.getByText('2 jobs matched to your profile')).toBeInTheDocument();
    expect(screen.getByTestId('job-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('job-card-2')).toBeInTheDocument();
  });

  it('displays job information correctly', async () => {
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Data Scientist')).toBeInTheDocument();
      expect(screen.getByText('Data Inc')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Job Matches')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search jobs, companies, or skills...');
    await user.type(searchInput, 'software');
    
    // Should filter jobs based on search term
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Data Scientist')).not.toBeInTheDocument();
  });

  it('handles filter toggle', async () => {
    const user = userEvent.setup();
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Job Matches')).toBeInTheDocument();
    });
    
    const filterButton = screen.getByText('Filters');
    await user.click(filterButton);
    
    expect(screen.getByTestId('job-filters')).toBeInTheDocument();
  });

  it('handles sorting', async () => {
    const user = userEvent.setup();
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Job Matches')).toBeInTheDocument();
    });
    
    const sortSelect = screen.getByDisplayValue('Best Match');
    await user.selectOptions(sortSelect, 'company-asc');
    
    // Should trigger re-fetch with new sort order
    expect(getMockJobMatches).toHaveBeenCalledWith(
      mockStudentId,
      expect.objectContaining({
        sortBy: 'company',
        sortOrder: 'asc'
      })
    );
  });

  it('handles job application', async () => {
    const user = userEvent.setup();
    updateJobMatchStatus.mockResolvedValue({});
    
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Job Matches')).toBeInTheDocument();
    });
    
    const applyButton = screen.getAllByText('Apply')[0];
    await user.click(applyButton);
    
    expect(updateJobMatchStatus).toHaveBeenCalledWith(
      mockStudentId,
      '1',
      {
        status: 'applied',
        applicationStatus: 'applied'
      }
    );
  });

  it('handles job saving', async () => {
    const user = userEvent.setup();
    saveJob.mockResolvedValue({});
    
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Job Matches')).toBeInTheDocument();
    });
    
    const saveButton = screen.getAllByText('Save')[0];
    await user.click(saveButton);
    
    expect(saveJob).toHaveBeenCalledWith(mockStudentId, '1', true);
  });

  it('handles job details view', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Job Matches')).toBeInTheDocument();
    });
    
    const viewDetailsButton = screen.getAllByText('View Details')[0];
    await user.click(viewDetailsButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Viewing job details:', 'Software Engineer');
    
    consoleSpy.mockRestore();
  });

  it('handles refresh functionality', async () => {
    const user = userEvent.setup();
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Job Matches')).toBeInTheDocument();
    });
    
    const refreshButton = screen.getByTitle('Refresh matches');
    await user.click(refreshButton);
    
    expect(getMockJobMatches).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  it('displays error state when fetch fails', async () => {
    getMockJobMatches.mockRejectedValue(new Error('Failed to fetch jobs'));
    
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Jobs')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch jobs')).toBeInTheDocument();
    });
  });

  it('displays empty state when no jobs match filters', async () => {
    getMockJobMatches.mockResolvedValue({
      matches: [],
      total: 0,
      page: 1,
      pages: 0
    });
    
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('No Job Matches Found')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    getMockJobMatches.mockResolvedValue({
      matches: mockJobs,
      total: 50,
      page: 1,
      pages: 3
    });
    
    render(<JobMatches studentId={mockStudentId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).not.toBeDisabled();
  });
});
