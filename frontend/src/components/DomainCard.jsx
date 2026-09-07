import React, { useState } from 'react';
import { ExternalLink, Star, Trash2, History, Edit3, Check, Globe } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export const DomainCard = ({ domain, onUpdate, onDelete, onViewHistory }) => {
  const [notes, setNotes] = useState(domain.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await onUpdate(domain._id, { notes });
    setIsSavingNotes(false);
    setIsEditingNotes(false);
  };

  const handleToggleFavorite = () => {
    onUpdate(domain._id, { isFavorite: !domain.isFavorite });
  };

  const badgeVariant = (tag) => {
    const t = tag.toLowerCase();
    if (t.includes('dev')) return 'dev';
    if (t.includes('ai')) return 'ai';
    if (t.includes('tool')) return 'tools';
    if (t.includes('learn')) return 'learning';
    return 'default';
  };

  return (
    <Card className="flex flex-col h-full group">
      {/* Card Header: Icon, Domain, Actions */}
      <CardHeader>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-slate-800 p-1.5 border border-slate-700/80 flex items-center justify-center shrink-0">
            {domain.favicon ? (
              <img
                src={domain.favicon}
                alt={domain.domain}
                className="w-full h-full object-contain rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-5 h-5 text-brand-400" />
            )}
          </div>
          <div className="truncate">
            <h3 className="font-bold text-white text-base truncate group-hover:text-brand-300 transition-colors">
              {domain.title || domain.domain}
            </h3>
            <a
              href={`https://${domain.domain}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-mono"
            >
              {domain.domain}
            </a>
          </div>
        </div>

        <button
          onClick={handleToggleFavorite}
          className={`p-2 rounded-xl transition-all ${
            domain.isFavorite
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-slate-800/60 text-slate-500 hover:text-amber-400 hover:bg-slate-800'
          }`}
          title={domain.isFavorite ? 'Remove Favorite' : 'Mark as Favorite'}
        >
          <Star className={`w-4 h-4 ${domain.isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      </CardHeader>

      {/* Card Body: Description & Notes */}
      <CardBody className="space-y-3 flex-1">
        {domain.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{domain.description}</p>
        )}

        {/* Notes Section */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Notes</span>
            {!isEditingNotes ? (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-xs text-brand-400 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            ) : (
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Check className="w-3 h-3" /> {isSavingNotes ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-brand-500 resize-none h-16"
            />
          ) : (
            <p className="text-xs text-slate-300 italic min-h-6">
              {domain.notes ? `"${domain.notes}"` : 'No notes added...'}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {domain.tags &&
            domain.tags.map((tag) => (
              <Badge key={tag} variant={badgeVariant(tag)}>
                #{tag}
              </Badge>
            ))}
        </div>
      </CardBody>

      {/* Card Footer: Action Links */}
      <CardFooter>
        <div className="flex items-center gap-2">
          {domain.visitedUrls && domain.visitedUrls.length > 0 && (
            <button
              onClick={() => onViewHistory(domain)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/60 transition"
              title="View Tracked URLs"
            >
              <History className="w-3.5 h-3.5 text-brand-400" />
              <span>{domain.visitedUrls.length} links</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(domain._id)}
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition"
            title="Delete Domain"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <a
            href={`https://${domain.domain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DomainCard;
