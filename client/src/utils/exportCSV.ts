import { Lead } from '../types/index';

/**
 * Converts an array of Lead objects to a CSV string and triggers
 * a browser file download automatically.
 */
export const exportLeadsToCSV = (leads: Lead[], filename = 'leads.csv'): void => {
  const headers = ['Name', 'Email', 'Status', 'Source', 'Created At'];

  const rows = leads.map((lead) => {
    const createdAt = new Date(lead.createdAt).toLocaleDateString('en-US');
    // Wrap in quotes to handle commas within values
    return [
      `"${lead.name}"`,
      `"${lead.email}"`,
      `"${lead.status}"`,
      `"${lead.source}"`,
      `"${createdAt}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
