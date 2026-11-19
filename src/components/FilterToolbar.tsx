import React from 'react';
import type { ExceptionStatus, SettlementFilters, SeverityLevel, SortDirection, SortField } from '../types/settlement';

interface FilterToolbarProps {
  filters: SettlementFilters;
  hasActiveFilters: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  resultCount: number;
  totalCount: number;
  onFilterChange: <K extends keyof SettlementFilters>(key: K, value: SettlementFilters[K]) => void;
  onResetFilters: () => void;
  onSortChange: (field: SortField) => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  hasActiveFilters,
  sortField,
  sortDirection,
  resultCount,
  totalCount,
  onFilterChange,
  onResetFilters,
  onSortChange,
}) => {
  return (
    <section className="toolbar" aria-label="Filter and sort settlement exceptions">
      <div className="toolbar-row">
        <div className="field field--grow">
          <label htmlFor="exception-search" className="field-label">
            Search
          </label>
          <input
            id="exception-search"
            type="search"
            className="input"
            placeholder="Ref ID (SET-2026-...), counterparty, or BIC..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="status-filter" className="field-label">
            Status
          </label>
          <select
            id="status-filter"
            className="select"
            value={filters.status}
            onChange={(e) =>
              onFilterChange('status', e.target.value as ExceptionStatus | 'all')
            }
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="severity-filter" className="field-label">
            Severity
          </label>
          <select
            id="severity-filter"
            className="select"
            value={filters.severity}
            onChange={(e) =>
              onFilterChange('severity', e.target.value as SeverityLevel | 'all')
            }
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="sort-select" className="field-label">
            Sort By
          </label>
          <select
            id="sort-select"
            className="select"
            value={sortField}
            onChange={(e) => onSortChange(e.target.value as SortField)}
          >
            <option value="sla">SLA Urgency ({sortDirection === 'asc' ? 'Soonest' : 'Latest'})</option>
            <option value="amount">USD Volume ({sortDirection === 'desc' ? 'High-Low' : 'Low-High'})</option>
            <option value="updatedAt">Last Updated</option>
          </select>
        </div>
      </div>

      <div className="toolbar-meta">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.slaAtRiskOnly}
            onChange={(e) => onFilterChange('slaAtRiskOnly', e.target.checked)}
          />
          <span>SLA at risk only (&lt; 2h)</span>
        </label>

        <div className="toolbar-right">
          <span className="result-count" aria-live="polite">
            Showing <strong>{resultCount}</strong> of <strong>{totalCount}</strong> exceptions
          </span>

          {hasActiveFilters && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={onResetFilters}>
              Reset filters
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
