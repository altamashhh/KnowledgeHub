import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Search as SearchIcon,
  X,
  ChevronDown,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { apiService } from '../../api/service';
import { KnowledgeItem } from '../../types';
import { KnowledgeItemCard } from '../../components/knowledge/KnowledgeItemCard';
import { LoadingSpinner, CardSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openQuickCapture } = useAuth();

  const initialKeyword = searchParams.get('q') || searchParams.get('keyword') || '';
  const initialTopic = searchParams.get('topic') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialType = searchParams.get('type') || '';

  const [query, setQuery] = useState(initialKeyword);
  const [activeTopic, setActiveTopic] = useState<string | null>(initialTopic || null);
  const [activeStatus, setActiveStatus] = useState<string>(initialStatus || 'ALL');
  const [activeType, setActiveType] = useState<string>(initialType || 'ALL');
  const [sortBy, setSortBy] = useState<string>('relevance');

  const [results, setResults] = useState<KnowledgeItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Perform search query to Spring Boot backend
  const executeSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      let sortParam: string | undefined = undefined;
      if (sortBy === 'newest') sortParam = 'createdAt,desc';
      if (sortBy === 'oldest') sortParam = 'createdAt,asc';
      if (sortBy === 'rating') sortParam = 'rating,desc';

      const response = await apiService.getItems({
        keyword: query.trim() || undefined,
        topic: activeTopic || undefined,
        status: activeStatus !== 'ALL' ? activeStatus : undefined,
        type: activeType !== 'ALL' ? activeType : undefined,
        sort: sortParam,
        size: 50,
      });

      setResults(response.content || []);
      setTotalCount(response.totalElements);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setIsLoading(false);
    }
  }, [query, activeTopic, activeStatus, activeType, sortBy]);

  // Debounced live search
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch();
    }, 200);

    return () => clearTimeout(timer);
  }, [executeSearch]);

  const handleClearQuery = () => {
    setQuery('');
  };

  const handleClearTopic = () => {
    setActiveTopic(null);
    const p = new URLSearchParams(searchParams);
    p.delete('topic');
    setSearchParams(p);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Search Input */}
      <div className="flex items-center gap-2 bg-[#11151B] rounded-lg border border-[#222733] px-3.5 py-2.5 shadow-xs focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/40">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-indigo-400 hover:text-indigo-300 p-1 -ml-1 rounded-md transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search knowledge by keyword, notes, code, or url..."
          autoFocus
          className="flex-1 text-xs sm:text-sm text-[#F3F4F6] placeholder:text-[#64748B] bg-transparent focus:outline-none font-medium"
        />

        {query && (
          <button
            type="button"
            onClick={handleClearQuery}
            className="p-1 text-[#64748B] hover:text-[#94A3B8] rounded-md hover:bg-[#171B22] transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Row: Active Topic pill + Dropdowns */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-xs">
        {/* Active Topic Chip with (x) */}
        {activeTopic ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 font-mono whitespace-nowrap">
            <span>Topic: #{activeTopic}</span>
            <button
              type="button"
              onClick={handleClearTopic}
              className="text-indigo-400 hover:text-indigo-200 focus:outline-none cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ) : (
          <div className="relative">
            <select
              value={activeTopic || ''}
              onChange={(e) => setActiveTopic(e.target.value || null)}
              className="appearance-none bg-[#11151B] border border-[#222733] text-[#CBD5E1] font-medium px-3 py-1.5 pr-7 rounded-lg cursor-pointer hover:bg-[#171B22] focus:outline-none focus:border-indigo-500 text-xs"
            >
              <option value="">Topic: All</option>
              <option value="React Ecosystem">React Ecosystem</option>
              <option value="Architecture">Architecture</option>
              <option value="CSS">CSS</option>
              <option value="Rust">Rust</option>
              <option value="Performance">Performance</option>
              <option value="Backend">Backend</option>
              <option value="Databases">Databases</option>
              <option value="Java">Java</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            className="appearance-none bg-[#11151B] border border-[#222733] text-[#CBD5E1] font-medium px-3 py-1.5 pr-7 rounded-lg cursor-pointer hover:bg-[#171B22] focus:outline-none focus:border-indigo-500 text-xs"
          >
            <option value="ALL">Status: All</option>
            <option value="INBOX">Inbox</option>
            <option value="LEARNING">Learning</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Type Dropdown */}
        <div className="relative">
          <select
            value={activeType}
            onChange={(e) => setActiveType(e.target.value)}
            className="appearance-none bg-[#11151B] border border-[#222733] text-[#CBD5E1] font-medium px-3 py-1.5 pr-7 rounded-lg cursor-pointer hover:bg-[#171B22] focus:outline-none focus:border-indigo-500 text-xs"
          >
            <option value="ALL">Type: All</option>
            <option value="WEBSITE">Website</option>
            <option value="NOTE">Note</option>
            <option value="DOCUMENTATION">Documentation</option>
            <option value="ARTICLE">Article</option>
            <option value="VIDEO">Video</option>
            <option value="BOOK">Book</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono uppercase tracking-wider px-1">
        <span>{isLoading ? 'SEARCHING...' : `${totalCount} RESULTS`}</span>
        <div className="flex items-center gap-1.5 font-medium normal-case text-[#94A3B8]">
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-indigo-400 font-semibold cursor-pointer focus:outline-none text-xs"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      <div>
        {isLoading ? (
          <div className="p-4 space-y-3 bg-[#11151B] border border-[#222733] rounded-lg">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : results.length > 0 ? (
          results.map((item) => (
            <KnowledgeItemCard
              key={item.id}
              item={item}
              searchQuery={query}
              variant="standard"
            />
          ))
        ) : (
          <div className="bg-[#11151B] border border-[#222733] rounded-lg p-4">
            <EmptyState
              icon="search"
              title="No matching knowledge items"
              description={
                query
                  ? `No items matched "${query}". Try broadening your search or adjusting your filters.`
                  : 'Enter a search term or select a filter above to search your knowledge base.'
              }
              actionText="Quick Capture"
              onAction={openQuickCapture}
            />
          </div>
        )}
      </div>
    </div>
  );
};
