import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { ExternalLink, Link2, Trash2 } from 'lucide-react';

export const VisitedModal = ({ isOpen, onClose, domain, onDeleteVisitedUrl }) => {
  const [deletingUrl, setDeletingUrl] = useState(null);

  if (!domain) return null;

  const handleDelete = async (e, targetUrl) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingUrl(targetUrl);
    try {
      await onDeleteVisitedUrl(domain._id, targetUrl);
    } finally {
      setDeletingUrl(null);
    }
  };

  const openUrl = (rawUrl) => {
    const target = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tracked URLs for ${domain.domain}`}>
      <div className="space-y-3">
        <p className="text-xs text-slate-400">
          As you browse pages under <strong className="text-white">{domain.domain}</strong>, page links are logged here. Click any link to open it directly:
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {domain.visitedUrls && domain.visitedUrls.length > 0 ? (
            domain.visitedUrls.map((url, idx) => (
              <div
                key={idx}
                onClick={() => openUrl(url)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-brand-500/60 hover:bg-slate-900/80 cursor-pointer transition group gap-3"
              >
                <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                  <Link2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span className="text-xs text-slate-200 group-hover:text-brand-300 font-semibold truncate font-mono">
                    {url}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 shrink-0" />
                </div>

                {onDeleteVisitedUrl && (
                  <button
                    onClick={(e) => handleDelete(e, url)}
                    disabled={deletingUrl === url}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition shrink-0"
                    title="Delete Visited Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic py-6 text-center">No specific page links logged yet.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default VisitedModal;
