import React from 'react';

interface StatusBadgeProps {
  status: 'Optimal' | 'Overprepared' | 'Underprepared' | 'Healthy' | 'Low Stock' | 'Critical' | 'Present' | 'Absent' | 'High' | 'Medium' | 'Low' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getBadgeStyle = (val: string) => {
    switch (val) {
      case 'Optimal':
      case 'Healthy':
      case 'Present':
      case 'High':
        return 'bg-blue-100/80 text-slate-900 border-blue-200/60';
      case 'Medium':
      case 'Low Stock':
      case 'Attention':
        return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'Underprepared':
      case 'Critical':
      case 'Absent':
      case 'Low':
        return 'bg-black text-slate-900 border-blue-200';
      case 'Overprepared':
        return 'bg-purple-950/80 text-purple-400 border-purple-800/60';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-300';
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${sizeClass} ${getBadgeStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80"></span>
      {status}
    </span>
  );
};
