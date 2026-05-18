import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { Lead, LeadFormData, FilterState, ApiResponse, PaginationMeta } from '../types/index';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import LeadTable from '../components/LeadTable';
import LeadForm from '../components/LeadForm';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import useDebounce from '../hooks/useDebounce';
import { AxiosError } from 'axios';

// ─── Dashboard Page ───────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // ── Dark mode ─────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [apiError, setApiError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);

  const [filters, setFilters] = useState<FilterState>({
    status: '',
    source: '',
    sort: 'latest',
  });
  const [page, setPage] = useState(1);

  // ── Lead form modal ───────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // ── Fetch leads ───────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 10,
        sort: filters.sort,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.status) params.status = filters.status;
      if (filters.source) params.source = filters.source;

      const res = await axiosInstance.get<ApiResponse<Lead[]>>('/leads', { params });
      setLeads(res.data.data);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setApiError(axiosErr.response?.data?.message ?? 'Failed to fetch leads.');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters, debouncedSearch]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── Create / Update lead ──────────────────────────────────────────────────
  const handleFormSubmit = async (data: LeadFormData) => {
    setFormLoading(true);
    try {
      if (editingLead) {
        await axiosInstance.put(`/leads/${editingLead._id}`, data);
      } else {
        await axiosInstance.post('/leads', data);
      }
      setShowForm(false);
      setEditingLead(null);
      fetchLeads();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setApiError(axiosErr.response?.data?.message ?? 'Failed to save lead.');
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete lead ───────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setApiError(axiosErr.response?.data?.message ?? 'Failed to delete lead.');
    }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const res = await axiosInstance.get('/leads/export/csv', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setApiError('Failed to export leads. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Clear filters ─────────────────────────────────────────────────────────
  const handleClearFilters = () => {
    setFilters({ status: '', source: '', sort: 'latest' });
    setSearchInput('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode((d) => !d)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Management</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {pagination.total} total lead{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Export CSV */}
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
              Export CSV
            </button>

            {/* Add Lead — admin only */}
            {isAdmin && (
              <button
                id="add-lead-btn"
                onClick={() => { setEditingLead(null); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Lead
              </button>
            )}
          </div>
        </div>

        {/* API error banner */}
        {apiError && (
          <div className="mb-6 flex items-center gap-2.5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <svg className="h-4 w-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
            <button onClick={() => setApiError('')} className="ml-auto text-red-400 hover:text-red-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: pagination.total, color: 'from-indigo-500 to-indigo-600', icon: '📋' },
            { label: 'New', value: leads.filter(l => l.status === 'New').length, color: 'from-blue-500 to-blue-600', icon: '🆕' },
            { label: 'Qualified', value: leads.filter(l => l.status === 'Qualified').length, color: 'from-emerald-500 to-emerald-600', icon: '✅' },
            { label: 'Lost', value: leads.filter(l => l.status === 'Lost').length, color: 'from-red-500 to-red-600', icon: '❌' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{stat.icon}</span>
                <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar value={searchInput} onChange={setSearchInput} />
            <FilterBar filters={filters} onChange={setFilters} onClear={handleClearFilters} />
          </div>
        </div>

        {/* Table */}
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onEdit={(lead) => { setEditingLead(lead); setShowForm(true); }}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        )}
      </main>

      {/* Lead Form Modal */}
      {showForm && (
        <LeadForm
          lead={editingLead}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingLead(null); }}
          isLoading={formLoading}
        />
      )}
    </div>
  );
};

export default DashboardPage;
