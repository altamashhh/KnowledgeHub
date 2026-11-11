import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../api/service';
import { KnowledgeItem, PageResponse } from '../../types';
import { KnowledgeItemCard } from '../../components/knowledge/KnowledgeItemCard';
import { KnowledgeFilterBar } from '../../components/knowledge/KnowledgeFilterBar';
import { LoadingSpinner, CardSkeleton } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const KnowledgeLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openQuickCapture, itemMutationTrigger } = useAuth();

  const currentStatusParam = searchParams.get('status') || '';
  const currentTypeParam = searchParams.get('type') || '';
  const currentTopicParam = searchParams.get('topic') || '';
  const currentKeyword = searchParams.get('keyword') || '';

  // Determine active filter button key
  const getActiveFilterKey = () => {
    if (currentStatusParam) return `STATUS_${currentStatusParam.toUpperCase()}`;
    if (currentTypeParam) return `TYPE_${currentTypeParam.toUpperCase()}`;
    return 'ALL';
  };

  const [activeFilterKey, setActiveFilterKey] = useState<string>(getActiveFilterKey);
  const [itemsPage, setItemsPage] = useState<PageResponse<KnowledgeItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Sync activeFilterKey with URL params
  useEffect(() => {
    setActiveFilterKey(getActiveFilterKey());
  }, [searchParams]);

  const loadItems = useCallback(async (pageIndex = 0) => {
    setIsLoading(true);
    try {
      let status: string | undefined = undefined;
      let type: string | undefined = undefined;

      if (activeFilterKey.startsWith('STATUS_')) {
        status = activeFilterKey.replace('STATUS_', '');
      } else if (activeFilterKey.startsWith('TYPE_')) {
        type = activeFilterKey.replace('TYPE_', '');
      }

      const res = await apiService.getItems({
        page: pageIndex,
        size: pageSize,
        status: status || currentStatusParam || undefined,
        type: type || currentTypeParam || undefined,
        topic: currentTopicParam || undefined,
        keyword: currentKeyword || undefined,
        sort: 'createdAt,desc',
      });

      setItemsPage(res);
      setCurrentPage(pageIndex);
    } catch (e) {
      console.error('Failed to load library items', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilterKey, currentStatusParam, currentTypeParam, currentTopicParam, currentKeyword]);

  useEffect(() => {
    loadItems(0);
  }, [loadItems, itemMutationTrigger]);

  const handleFilterSelect = (filterKey: string) => {
    setActiveFilterKey(filterKey);
    const newParams = new URLSearchParams(searchParams);

    newParams.delete('status');
    newParams.delete('type');

    if (filterKey.startsWith('STATUS_')) {
      newParams.set('status', filterKey.replace('STATUS_', ''));
    } else if (filterKey.startsWith('TYPE_')) {
      newParams.set('type', filterKey.replace('TYPE_', ''));
    }

    setSearchParams(newParams);
  };

  const handleSearchClick = () => {
    navigate('/search');
  };

  const items = itemsPage?.content || [];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Search Input Bar */}
      <div
        onClick={handleSearchClick}
        className="relative flex items-center bg-[#11151B] rounded-lg border border-[#222733] px-3.5 py-2.5 shadow-xs cursor-pointer hover:border-indigo-500/50 hover:bg-[#141922] transition-all group"
      >
        <Search className="w-4 h-4 text-[#64748B] group-hover:text-indigo-400 mr-2.5 transition-colors" />
        <span className="text-xs sm:text-sm text-[#64748B] flex-1">Search your knowledge graph (⌘K)...</span>
        <kbd className="hidden sm:inline-block text-[10px] bg-[#171B22] px-2 py-0.5 rounded border border-[#2A313D] text-[#64748B] font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Filter Horizontal Scroll Bar */}
      <KnowledgeFilterBar
        currentFilter={activeFilterKey}
        onSelectFilter={handleFilterSelect}
      />

      {/* Active Topic Notice if filtered by topic */}
      {currentTopicParam && (
        <div className="flex items-center justify-between bg-indigo-950/30 border border-indigo-800/40 px-3 py-2 rounded-lg text-xs text-indigo-300">
          <span>
            Filtering by topic: <strong className="text-indigo-200 font-mono">#{currentTopicParam}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              const p = new URLSearchParams(searchParams);
              p.delete('topic');
              setSearchParams(p);
            }}
            className="text-indigo-400 font-medium hover:underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Knowledge Item List */}
      <div>
        {isLoading ? (
          <div className="p-4 space-y-3 bg-[#11151B] border border-[#222733] rounded-lg">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <KnowledgeItemCard key={item.id} item={item} variant="standard" />
          ))
        ) : (
          <div className="bg-[#11151B] border border-[#222733] rounded-lg p-4">
            <EmptyState
              title="No knowledge items found"
              description="Your library is empty or no items match the selected filter."
              actionText="Capture Something"
              onAction={openQuickCapture}
            />
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {itemsPage && itemsPage.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-[#64748B] font-mono">
          <span>
            Page {currentPage + 1} of {itemsPage.totalPages} ({itemsPage.totalElements} items)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 0 || isLoading}
              onClick={() => loadItems(currentPage - 1)}
              className="p-1.5 rounded-lg border border-[#222733] bg-[#11151B] text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#171B22] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={itemsPage.last || isLoading}
              onClick={() => loadItems(currentPage + 1)}
              className="p-1.5 rounded-lg border border-[#222733] bg-[#11151B] text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#171B22] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
