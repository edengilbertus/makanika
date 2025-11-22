import React from 'react';
import { JobStatus } from '../types';

interface StatusBadgeProps {
  status: JobStatus;
  isActive?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isActive = true }) => {
  const getStatusColor = (s: JobStatus) => {
    switch (s) {
      case JobStatus.PENDING: return 'bg-gray-200';
      case JobStatus.DIAGNOSTICS: return 'bg-mk-yellow';
      case JobStatus.PARTS: return 'bg-white';
      case JobStatus.FIXING: return 'bg-black text-white';
      case JobStatus.READY: return 'bg-mk-green';
      default: return 'bg-white';
    }
  };

  return (
    <div className={`
      px-2 py-1 border-2 border-black font-bold text-xs uppercase
      ${getStatusColor(status)}
      ${isActive ? 'opacity-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'opacity-40'}
    `}>
      {status}
    </div>
  );
};