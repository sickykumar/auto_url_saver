import React from 'react';
import { Badge } from './ui/Badge';
import { Filter, Star } from 'lucide-react';

const CATEGORIES = ['All', 'Dev', 'AI', 'Tools', 'Learning'];

export const TagFilter = ({ selectedTag, setSelectedTag, showOnlyFavorites, setShowOnlyFavorites }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold px-2">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </div>
        {CATEGORIES.map((category) => {
          const isSelected = selectedTag === category && !showOnlyFavorites;
          const variantKey = category.toLowerCase();

          return (
            <button
              key={category}
              onClick={() => {
                setShowOnlyFavorites(false);
                setSelectedTag(category);
              }}
              className={`
                px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 border
                ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/60'
                }
              `}
            >
              {category}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
        className={`
          flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-200
          ${
            showOnlyFavorites
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white border-slate-700/60'
          }
        `}
      >
        <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
        Favorites Only
      </button>
    </div>
  );
};

export default TagFilter;
