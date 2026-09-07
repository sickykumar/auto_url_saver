import React from 'react';
import { Globe, Search, Plus, Sparkles, Bot } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const Navbar = ({
  search,
  setSearch,
  onOpenAddModal,
  onGenerateAiNotes,
  isGeneratingAiNotes,
  totalDomains,
  favoriteCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Globe className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white">Auto Domain Saver</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-950 text-brand-400 border border-brand-800/60">
                Option B
              </span>
            </div>
            <p className="text-xs text-slate-400">Save once per domain automatically</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Search domains, notes, titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>

        {/* Quick Actions & Stats */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3.5 py-2 rounded-xl">
            <span>
              Total: <strong className="text-white font-semibold">{totalDomains}</strong>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Favorites: <strong className="text-white font-semibold">{favoriteCount}</strong>
            </span>
          </div>

          <Button
            onClick={onGenerateAiNotes}
            isLoading={isGeneratingAiNotes}
            leftIcon={Bot}
            variant="secondary"
            size="md"
            className="border-purple-800/60 text-purple-300 hover:bg-purple-950/40"
            title="Auto-generate AI notes for saved domains missing notes"
          >
            Sync AI Notes
          </Button>

          <Button onClick={onOpenAddModal} leftIcon={Plus} variant="primary" size="md">
            Save Domain
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
