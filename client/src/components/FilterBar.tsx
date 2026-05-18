import React from 'react';
import { FilterState } from '../types/index';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

const statusOptions = ['All', 'New', 'Contacted', 'Qualified', 'Lost'];
const sourceOptions = ['All', 'Website', 'Instagram', 'Referral'];
const sortOptions = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const selectClass =
  'px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer';

const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, onClear }) => {
  const hasActiveFilters =
    filters.status !== '' || filters.source !== '' || filters.sort !== 'latest';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status filter */}
      <select
        id="filter-status"
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        className={selectClass}
        aria-label="Filter by status"
      >
        {statusOptions.map((opt) => (
          <option key={opt} value={opt === 'All' ? '' : opt}>
            {opt === 'All' ? 'All Statuses' : opt}
          </option>
        ))}
      </select>

      {/* Source filter */}
      <select
        id="filter-source"
        value={filters.source}
        onChange={(e) => onChange({ ...filters, source: e.target.value })}
        className={selectClass}
        aria-label="Filter by source"
      >
        {sourceOptions.map((opt) => (
          <option key={opt} value={opt === 'All' ? '' : opt}>
            {opt === 'All' ? 'All Sources' : opt}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        id="filter-sort"
        value={filters.sort}
        onChange={(e) =>
          onChange({ ...filters, sort: e.target.value as 'latest' | 'oldest' })
        }
        className={selectClass}
        aria-label="Sort leads"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          id="clear-filters-btn"
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
};

export default FilterBar;
