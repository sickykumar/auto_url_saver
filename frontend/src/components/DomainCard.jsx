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
    <Card className="flex flex-col h-full group relative overflow-hidden transition-all duration-300 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 bg-slate-900/90 backdrop-blur-md">
      {/* Top subtle ambient glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all pointer-events-none" />

      {/* Card Header: Favicon, Title, Link, Star */}
      <CardHeader className="pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-2 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            {domain.favicon ? (
              <img
                src={domain.favicon}
                alt={domain.domain}
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://www.google.com/s2/favicons?domain=${domain.domain}&sz=64`;
                }}
              />
            ) : (
              <Globe className="w-5 h-5 text-brand-400" />
            )}
          </div>
          <div className="truncate min-w-0 flex-1">
            <h3 className="font-bold text-slate-100 text-base truncate group-hover:text-brand-300 transition-colors leading-snug">
              {domain.title || domain.domain}
            </h3>
            <a
              href={`https://${domain.domain}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors tracking-tight"
            >
              {domain.domain}
            </a>
          </div>
        </div>

        <button
          onClick={handleToggleFavorite}
          className={`p-2.5 rounded-2xl transition-all ${
            domain.isFavorite
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-lg shadow-amber-500/10'
              : 'bg-slate-800/50 text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-slate-700/50'
          }`}
          title={domain.isFavorite ? 'Remove Favorite' : 'Mark as Favorite'}
        >
          <Star className={`w-4 h-4 ${domain.isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      </CardHeader>

      {/* Card Body: Description & Notes */}
      <CardBody className="space-y-3.5 flex-1 pt-3.5">
        {domain.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
            {domain.description}
          </p>
        )}

        {/* AI Notes Section */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 space-y-2 shadow-inner group-hover:border-slate-800 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] uppercase font-extrabold text-cyan-400 tracking-wider">
                AI Notes
              </span>
            </div>
            {!isEditingNotes ? (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-[11px] text-brand-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            ) : (
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold transition-colors"
              >
                <Check className="w-3 h-3" /> {isSavingNotes ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write or edit notes..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none h-18"
            />
          ) : (
            <p className="text-xs text-slate-300 leading-relaxed min-h-[2rem]">
              {domain.notes ? domain.notes : <span className="text-slate-500 italic">No AI notes generated yet...</span>}
            </p>
          )}
        </div>

        {/* Tags */}
        {domain.tags && domain.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {domain.tags.map((tag) => (
              <Badge key={tag} variant={badgeVariant(tag)}>
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardBody>

      {/* Card Footer: Action Links */}
      <CardFooter className="pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          {domain.visitedUrls && domain.visitedUrls.length > 0 && (
            <button
              onClick={() => onViewHistory(domain)}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800/70 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/70 transition shadow-sm"
              title="View Tracked Page URLs"
            >
              <History className="w-3.5 h-3.5 text-brand-400" />
              <span className="font-semibold">{domain.visitedUrls.length} links</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(domain._id)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl border border-transparent hover:border-rose-900/50 transition"
            title="Delete Domain"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <a
            href={`https://${domain.domain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Visit
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DomainCard;
