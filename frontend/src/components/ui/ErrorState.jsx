import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Failed to load domain data. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 my-4">
      <div className="p-2 bg-rose-900/60 rounded-xl text-rose-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-rose-100">{title}</h4>
        <p className="text-xs text-rose-300/80">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={RefreshCw} className="border-rose-700/60 hover:bg-rose-900/40 text-rose-200">
          Retry
        </Button>
      )}
    </div>
  );
};

export const ErrorPage = ({
  code = '500',
  title = 'Application Error',
  message = 'An unexpected server error occurred. Please refresh or try again later.',
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400 mb-6 shadow-2xl shadow-rose-900/30">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <span className="text-sm font-semibold tracking-widest text-rose-400 uppercase mb-2">Error {code}</span>
      <h1 className="text-3xl font-extrabold text-white mb-3">{title}</h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm leading-relaxed">{message}</p>
      <div className="flex gap-4">
        {onRetry && (
          <Button variant="primary" onClick={onRetry} leftIcon={RefreshCw}>
            Try Again
          </Button>
        )}
        <Button variant="secondary" onClick={() => window.location.reload()} leftIcon={Home}>
          Reload Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
