import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ text = 'Loading...', size = 'md', className = '' }) => {
  const iconSizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 text-slate-400 ${className}`}>
      <Loader2 className={`${iconSizes[size] || iconSizes.md} animate-spin text-brand-500`} />
      {text && <span className="text-sm font-medium text-slate-300 animate-pulse">{text}</span>}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40 animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-800 rounded-xl"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-slate-800 rounded w-1/3"></div>
        <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-16 bg-slate-800/40 rounded-xl"></div>
    <div className="flex gap-2">
      <div className="h-5 w-16 bg-slate-800 rounded-full"></div>
      <div className="h-5 w-16 bg-slate-800 rounded-full"></div>
    </div>
  </div>
);

export default Loader;
