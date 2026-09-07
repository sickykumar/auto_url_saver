import React from 'react';

export const Card = ({ children, className = '', hoverEffect = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/60 shadow-xl
        ${hoverEffect ? 'glass-card-hover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between gap-3 pb-3 border-b border-slate-800/60 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`py-3 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`pt-3 mt-auto border-t border-slate-800/60 flex items-center justify-between gap-3 ${className}`}>
    {children}
  </div>
);

export default Card;
