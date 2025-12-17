import React from 'react';
import { ProcessingStats } from '../types';

interface ProgressBarProps {
  stats: ProcessingStats;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ stats }) => {
  const percentage = stats.total === 0 ? 0 : Math.round((stats.completed + stats.failed) / stats.total * 100);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex justify-between items-center mb-2 text-sm font-medium text-slate-700">
        <span>Progress: {percentage}%</span>
        <span>{stats.completed + stats.failed} / {stats.total} processed</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
        <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Processing Now: <span className="font-semibold ml-1">{stats.inProgress}</span>
        </div>
        <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>
            Remaining: <span className="font-semibold ml-1">{stats.pending}</span>
        </div>
        <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Completed: <span className="font-semibold ml-1">{stats.completed}</span>
        </div>
        <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            Errors: <span className="font-semibold ml-1">{stats.failed}</span>
        </div>
      </div>
    </div>
  );
};
