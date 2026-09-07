import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  rightIcon: RightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-slate-900/80 border text-slate-100 placeholder-slate-500 text-sm rounded-xl px-3.5 py-2.5 transition-all outline-none
            ${Icon ? 'pl-9' : ''}
            ${RightIcon ? 'pr-9' : ''}
            ${error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-700/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'}
            ${className}
          `}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3 text-slate-400">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      {error ? (
        <span className="text-xs text-rose-400 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-400">{helperText}</span>
      ) : null}
    </div>
  );
};

export default Input;
