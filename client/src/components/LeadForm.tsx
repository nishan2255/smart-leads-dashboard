import React, { useState, useEffect } from 'react';
import { Lead, LeadFormData } from '../types/index';
import LoadingSpinner from './LoadingSpinner';

interface LeadFormProps {
  lead?: Lead | null;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

const statusOptions: LeadFormData['status'][] = ['New', 'Contacted', 'Qualified', 'Lost'];
const sourceOptions: LeadFormData['source'][] = ['Website', 'Instagram', 'Referral'];

const LeadForm: React.FC<LeadFormProps> = ({ lead, onSubmit, onClose, isLoading }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: lead?.name ?? '',
    email: lead?.email ?? '',
    status: lead?.status ?? 'New',
    source: lead?.source ?? 'Website',
  });

  const [errors, setErrors] = useState<Partial<LeadFormData>>({});

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        status: lead.status,
        source: lead.source,
      });
    }
  }, [lead]);

  const validate = (): boolean => {
    const newErrors: Partial<LeadFormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const inputClass = (field: keyof LeadFormData) =>
    `w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
      errors[field]
        ? 'border-red-400 dark:border-red-500'
        : 'border-gray-200 dark:border-gray-600'
    }`;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {lead ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button
            id="lead-form-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Full Name *
            </label>
            <input
              id="lead-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass('name')}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Email Address *
            </label>
            <input
              id="lead-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass('email')}
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Status + Source row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Status
              </label>
              <select
                id="lead-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadFormData['status'] })}
                className={inputClass('status')}
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Source
              </label>
              <select
                id="lead-source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadFormData['source'] })}
                className={inputClass('source')}
              >
                {sourceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="lead-form-submit"
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving…
                </>
              ) : (
                lead ? 'Update Lead' : 'Create Lead'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
