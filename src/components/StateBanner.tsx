import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5 }) => {
  return (
    <div className="state-card" role="status" aria-live="polite" aria-label="Loading exceptions">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton-row">
          <div className="skeleton-line skeleton-line--sm" />
          <div className="skeleton-line skeleton-line--lg" />
          <div className="skeleton-line skeleton-line--md" />
          <div className="skeleton-line skeleton-line--sm" />
        </div>
      ))}
    </div>
  );
};

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <div className="state-card state-card--error" role="alert">
      <div>
        <h2 className="state-title">Unable to load settlement exceptions</h2>
        <p className="state-desc">{message}</p>
      </div>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry Sync
      </button>
    </div>
  );
};

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasActiveFilters, onResetFilters }) => {
  return (
    <div className="state-card state-card--empty">
      <h2 className="state-title">
        {hasActiveFilters ? 'No matching exceptions found' : 'All settlement exceptions cleared'}
      </h2>
      <p className="state-desc">
        {hasActiveFilters
          ? 'Try widening your search query or clearing one of the active status, severity, or SLA filters.'
          : 'No open, escalated, or held payouts require intervention right now.'}
      </p>
      {hasActiveFilters && (
        <button type="button" className="btn btn--secondary" onClick={onResetFilters}>
          Clear all filters
        </button>
      )}
    </div>
  );
};
