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
  return (
    <Card className="flex flex-col h-full group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/20 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 hover:border-slate-700/90 rounded-3xl">
      {/* Top Multi-color Gradient Border Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 via-amber-400 via-cyan-400 to-violet-600 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Top Ambient RGBA Glow Blob */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      {/* Card Header: Favicon, Title, Domain, Star */}
      <CardHeader className="pb-3 pt-4 border-b border-slate-800/60 relative z-10">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-950 p-2.5 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-lg shadow-black/40 group-hover:border-cyan-500/50 group-hover:scale-105 transition-all">
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
              <Globe className="w-6 h-6 text-cyan-400" />
            )}
          </div>
          <div className="truncate min-w-0 flex-1">
            <h3 className="font-extrabold text-slate-100 text-base truncate group-hover:text-cyan-300 transition-colors leading-snug tracking-tight">
              {domain.title || domain.domain}
            </h3>
            <a
              href={`https://${domain.domain}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400/90 hover:text-pink-400 flex items-center gap-1 font-mono transition-colors tracking-tight font-medium"
            >
              {domain.domain}
            </a>
          </div>
        </div>

        <button
          onClick={handleToggleFavorite}
          className={`p-2.5 rounded-2xl transition-all ${
            domain.isFavorite
              ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/10 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-500/20 scale-105'
              : 'bg-slate-800/50 text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-slate-700/50'
          }`}
          title={domain.isFavorite ? 'Remove Favorite' : 'Mark as Favorite'}
        >
          <Star className={`w-4 h-4 ${domain.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </CardHeader>

      {/* Card Body: Description & Notes */}
      <CardBody className="space-y-3.5 flex-1 pt-4 relative z-10">
        {domain.description && (
          <p className="text-xs text-slate-300/90 line-clamp-2 leading-relaxed font-normal">
            {domain.description}
          </p>
        )}

        {/* AI Notes Glass Container */}
        <div className="bg-gradient-to-b from-slate-950/90 to-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2 shadow-inner group-hover:border-slate-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
              <span className="text-[10px] uppercase font-black tracking-widest bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                AI Summary Note
              </span>
            </div>
            {!isEditingNotes ? (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-[11px] text-cyan-400 hover:text-pink-300 flex items-center gap-1 font-semibold transition-colors"
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
              placeholder="Write or edit AI notes..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none h-20"
            />
          ) : (
            <p className="text-xs text-slate-300 leading-relaxed min-h-[2.2rem] font-normal">
              {domain.notes ? domain.notes : <span className="text-slate-500 italic">Generating AI summary notes...</span>}
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
      <CardFooter className="pt-3.5 pb-4 border-t border-slate-800/60 relative z-10">
        <div className="flex items-center gap-2">
          {domain.visitedUrls && domain.visitedUrls.length > 0 && (
            <button
              onClick={() => onViewHistory(domain)}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80 transition shadow-sm font-medium"
              title="View Tracked Page URLs"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">{domain.visitedUrls.length} links</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(domain._id)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-xl border border-transparent hover:border-rose-900/60 transition"
            title="Delete Domain"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <a
            href={`https://${domain.domain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-cyan-500 hover:from-rose-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Visit
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DomainCard;
