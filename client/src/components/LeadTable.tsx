import React from 'react';
import { Lead } from '../types/index';
import EmptyState from './EmptyState';

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  isAdmin: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: Lead['status'] }> = ({ status }) => {
  const styles: Record<Lead['status'], string> = {
    New: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700',
    Contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 ring-1 ring-yellow-200 dark:ring-yellow-700',
    Qualified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700',
    Lost: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-700',
  };

  const dots: Record<Lead['status'], string> = {
    New: 'bg-blue-500',
    Contacted: 'bg-yellow-500',
    Qualified: 'bg-emerald-500',
    Lost: 'bg-red-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
};

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow: React.FC = () => (
  <tr className="border-b border-gray-100 dark:border-gray-700/50">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const LeadTable: React.FC<LeadTableProps> = ({ leads, isLoading, isAdmin, onEdit, onDelete }) => {
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              {['Name', 'Email', 'Status', 'Source', 'Created At', 'Actions'].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No leads found"
                    description="Try adjusting your search or filters, or add a new lead to get started."
                  />
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead._id}
                  className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                >
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {lead.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Source */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{lead.source}</span>
                  </td>

                  {/* Created At */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    {isAdmin ? (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`edit-lead-${lead._id}`}
                          onClick={() => onEdit(lead)}
                          className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                          aria-label={`Edit ${lead.name}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          id={`delete-lead-${lead._id}`}
                          onClick={() => handleDelete(lead._id, lead.name)}
                          className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          aria-label={`Delete ${lead.name}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-600">View only</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
