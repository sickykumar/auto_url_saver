import React from 'react';
import { Globe, Plus } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  title = 'No Saved Domains Yet',
  description = 'As you browse websites, the extension will automatically save domains here.',
  icon: Icon = Globe,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
      <div className="w-16 h-16 rounded-2xl bg-brand-950/60 border border-brand-800/40 flex items-center justify-center text-brand-400 mb-4 shadow-lg shadow-brand-900/20">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} leftIcon={Plus}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
