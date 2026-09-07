import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import TagFilter from './components/TagFilter';
import DomainCard from './components/DomainCard';
import AddDomainModal from './components/AddDomainModal';
import VisitedModal from './components/VisitedModal';
import { Loader, SkeletonCard } from './components/ui/Loader';
import { EmptyState } from './components/ui/EmptyState';
import { ErrorState, ErrorPage } from './components/ui/ErrorState';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://auto-url-saver.onrender.com/api/domains';

export function App() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDomainForHistory, setSelectedDomainForHistory] = useState(null);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedTag && selectedTag !== 'All') params.append('tag', selectedTag);
      if (showOnlyFavorites) params.append('favorite', 'true');

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const json = await response.json();
      if (json.success) {
        setDomains(json.data);
      } else {
        throw new Error(json.message || 'Failed to fetch domains');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err.message || 'Could not connect to backend server');
      toast.error('Backend server offline or unreachable.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedTag, showOnlyFavorites]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleSaveDomain = async (rawUrl) => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl }),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to save domain');
      }

      if (json.alreadySaved) {
        toast.success(`Domain "${json.data.domain}" already saved!`);
      } else {
        toast.success(`Domain "${json.data.domain}" saved automatically!`);
      }

      fetchDomains();
    } catch (err) {
      toast.error(err.message || 'Error saving domain');
      throw err;
    }
  };

  const handleUpdateDomain = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to update');
      }

      setDomains((prev) => prev.map((d) => (d._id === id ? { ...d, ...updates } : d)));
      toast.success('Updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update domain');
    }
  };

  const handleDeleteDomain = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved domain?')) return;

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to delete');
      }

      setDomains((prev) => prev.filter((d) => d._id !== id));
      toast.success('Domain removed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete domain');
    }
  };

  const handleDeleteVisitedUrl = async (domainId, targetUrl) => {
    try {
      const response = await fetch(`${API_BASE}/${domainId}/visited-url`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl }),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to delete visited link');
      }

      setDomains((prev) =>
        prev.map((d) =>
          d._id === domainId ? { ...d, visitedUrls: d.visitedUrls.filter((u) => u !== targetUrl) } : d
        )
      );

      if (selectedDomainForHistory && selectedDomainForHistory._id === domainId) {
        setSelectedDomainForHistory((prev) => ({
          ...prev,
          visitedUrls: prev.visitedUrls.filter((u) => u !== targetUrl),
        }));
      }

      toast.success('Visited link removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove link');
    }
  };

  const [isGeneratingAiNotes, setIsGeneratingAiNotes] = useState(false);

  const handleGenerateAiNotes = async () => {
    setIsGeneratingAiNotes(true);
    try {
      const response = await fetch(`${API_BASE}/generate-ai-notes`, {
        method: 'POST',
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to generate AI notes');
      }

      toast.success(json.message);
      fetchDomains();
    } catch (err) {
      toast.error(err.message || 'Error generating AI notes');
    } finally {
      setIsGeneratingAiNotes(false);
    }
  };

  const favoriteCount = domains.filter((d) => d.isFavorite).length;

  if (error && domains.length === 0) {
    return <ErrorPage code="API Error" title="Backend Connection Issue" message={error} onRetry={fetchDomains} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col font-sans selection:bg-brand-500">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#111827', color: '#fff', border: '1px solid #1f293d' } }} />

      {/* Header Bar */}
      <Navbar
        search={search}
        setSearch={setSearch}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onGenerateAiNotes={handleGenerateAiNotes}
        isGeneratingAiNotes={isGeneratingAiNotes}
        totalDomains={domains.length}
        favoriteCount={favoriteCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {/* Filter Controls */}
        <TagFilter
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          showOnlyFavorites={showOnlyFavorites}
          setShowOnlyFavorites={setShowOnlyFavorites}
        />

        {error && <ErrorState message={error} onRetry={fetchDomains} />}

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : domains.length === 0 ? (
          <EmptyState
            title="No Saved Websites Found"
            description={
              search
                ? `No domain matched "${search}". Try clearing your search.`
                : 'As you browse the web with the extension running, website domains are automatically saved here once per domain.'
            }
            actionLabel="Save Manually"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domainItem) => (
              <DomainCard
                key={domainItem._id}
                domain={domainItem}
                onUpdate={handleUpdateDomain}
                onDelete={handleDeleteDomain}
                onViewHistory={(d) => setSelectedDomainForHistory(d)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddDomainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveDomain}
      />

      <VisitedModal
        isOpen={!!selectedDomainForHistory}
        onClose={() => setSelectedDomainForHistory(null)}
        domain={selectedDomainForHistory}
        onDeleteVisitedUrl={handleDeleteVisitedUrl}
      />
    </div>
  );
}

export default App;
