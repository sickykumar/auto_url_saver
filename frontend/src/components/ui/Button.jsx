import React from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 border border-brand-500/30',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
  outline: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700',
  ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white',
  destructive: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 border border-rose-500/30',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 border border-emerald-500/30',
  icon: 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 p-2 rounded-xl',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg font-medium gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl font-medium gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl font-semibold gap-2.5',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const disabled = isDisabled || isLoading;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 active:scale-[0.98]
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4" />
      ) : null}
      {children}
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4" />}
    </button>
  );
};

export default Button;
