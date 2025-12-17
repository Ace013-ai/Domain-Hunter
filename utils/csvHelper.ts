import { CompanyEntry, Status } from '../types';

export const parseCSV = (content: string): string[] => {
  // Simple parser: splits by new lines, handles basic cleanup
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0); // Remove empty lines
};

export const exportToCSV = (data: CompanyEntry[]) => {
  const headers = ['Company Name', 'Domain', 'Source URL', 'Status', 'Error Message'];
  const rows = data.map((entry) => [
    `"${entry.originalName.replace(/"/g, '""')}"`,
    entry.domain || '',
    entry.sourceUrl || '',
    entry.status,
    entry.errorMsg ? `"${entry.errorMsg.replace(/"/g, '""')}"` : '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `domain_results_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
