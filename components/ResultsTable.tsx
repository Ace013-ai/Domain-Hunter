import React from 'react';
import { CompanyEntry, Status } from '../types';
import { ExternalLink, CheckCircle, XCircle, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';

interface ResultsTableProps {
  data: CompanyEntry[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-500">No data loaded yet. Upload a file to begin.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Company Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Domain Found
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Source
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((entry, index) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {entry.originalName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {entry.domain ? (
                    <a 
                      href={entry.domain} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                    >
                      <span>{entry.domain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">
                      {entry.status === Status.COMPLETED ? 'Not found' : '-'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {entry.sourceUrl ? (
                    <a 
                      href={entry.sourceUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-emerald-600 hover:text-emerald-800 hover:underline flex items-center space-x-1"
                      title={entry.sourceUrl}
                    >
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    {entry.status === Status.IDLE && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Pending
                      </span>
                    )}
                    {entry.status === Status.PROCESSING && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Processing
                      </span>
                    )}
                    {entry.status === Status.COMPLETED && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Done
                      </span>
                    )}
                    {entry.status === Status.ERROR && (
                      <div className="flex items-center group relative">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-help">
                          <XCircle className="w-3 h-3 mr-1" />
                          Error
                        </span>
                        
                        {/* Tooltip for error message */}
                        {entry.errorMsg && (
                          <div className="absolute left-full ml-2 bottom-0 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                            {entry.errorMsg}
                            <div className="absolute left-0 bottom-1 -ml-1 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
