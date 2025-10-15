/*
============================================================================
FILE: src/components/shared/__tests__/LoadingSpinner.test.jsx
============================================================================
PURPOSE:
  Unit tests for LoadingSpinner component and its variants.
  Tests rendering, accessibility, and different configurations.

TEST COVERAGE:
  - Basic rendering with different props
  - Size variants (small, medium, large, xl)
  - Color variants
  - Text display options
  - Skeleton loader components
  - Accessibility features
============================================================================
*/

import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner, { SkeletonLoader, CardSkeleton, TableSkeleton } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Custom loading text" />);
    
    expect(screen.getByText('Custom loading text')).toBeInTheDocument();
  });

  it('hides text when showText is false', () => {
    render(<LoadingSpinner showText={false} />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="medium" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-6', 'h-6');

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-8', 'h-8');

    rerender(<LoadingSpinner size="xl" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-12', 'h-12');
  });

  it('applies correct color classes', () => {
    const { rerender } = render(<LoadingSpinner color="brand-maroon" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('text-brand-maroon');

    rerender(<LoadingSpinner color="accent-teal" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('text-accent-teal');
  });

  it('renders with dots variant', () => {
    render(<LoadingSpinner variant="dots" />);
    
    // Should still render an icon (Loader2 for dots)
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    expect(screen.getByRole('img', { hidden: true }).parentElement).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner text="Loading data..." />);
    
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });
});

describe('SkeletonLoader', () => {
  it('renders with default props', () => {
    render(<SkeletonLoader />);
    
    // Should render 3 skeleton lines by default
    const skeletonLines = screen.getAllByRole('generic').filter(el => 
      el.className.includes('bg-gray-300')
    );
    expect(skeletonLines.length).toBeGreaterThan(0);
  });

  it('renders with custom number of lines', () => {
    render(<SkeletonLoader lines={5} />);
    
    const skeletonLines = screen.getAllByRole('generic').filter(el => 
      el.className.includes('bg-gray-300')
    );
    expect(skeletonLines.length).toBeGreaterThan(0);
  });

  it('renders with avatar when showAvatar is true', () => {
    render(<SkeletonLoader showAvatar={true} />);
    
    // Should have avatar skeleton (rounded-full)
    const avatarSkeleton = screen.getAllByRole('generic').find(el => 
      el.className.includes('rounded-full')
    );
    expect(avatarSkeleton).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SkeletonLoader className="custom-skeleton" />);
    
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('custom-skeleton');
  });
});

describe('CardSkeleton', () => {
  it('renders with default count', () => {
    render(<CardSkeleton />);
    
    // Should render 6 cards by default
    const cardContainers = screen.getAllByRole('generic').filter(el => 
      el.className.includes('bg-white') && el.className.includes('rounded-xl')
    );
    expect(cardContainers.length).toBe(6);
  });

  it('renders with custom count', () => {
    render(<CardSkeleton count={3} />);
    
    const cardContainers = screen.getAllByRole('generic').filter(el => 
      el.className.includes('bg-white') && el.className.includes('rounded-xl')
    );
    expect(cardContainers.length).toBe(3);
  });

  it('applies custom className', () => {
    render(<CardSkeleton className="custom-cards" />);
    
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('custom-cards');
  });
});

describe('TableSkeleton', () => {
  it('renders with default props', () => {
    render(<TableSkeleton />);
    
    // Should render table structure
    const tableContainer = screen.getByRole('generic');
    expect(tableContainer).toHaveClass('bg-white', 'rounded-xl');
  });

  it('renders with custom rows and columns', () => {
    render(<TableSkeleton rows={3} columns={2} />);
    
    const tableContainer = screen.getByRole('generic');
    expect(tableContainer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<TableSkeleton className="custom-table" />);
    
    const container = screen.getByRole('generic');
    expect(container).toHaveClass('custom-table');
  });
});
