import React from 'react';

const variantClasses = {
  default: 'bg-slate-800 text-slate-300 border-slate-700',
  brand: 'bg-brand-950/80 text-brand-300 border-brand-800/60',
  dev: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
  ai: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
  tools: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
  learning: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
  success: 'bg-emerald-950 text-emerald-400 border-emerald-800/50',
  danger: 'bg-rose-950 text-rose-400 border-rose-800/50',
};

export const Badge = ({ children, variant = 'default', className = '', onClick }) => {
  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border transition-colors
        ${variantClasses[variant] || variantClasses.default}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
