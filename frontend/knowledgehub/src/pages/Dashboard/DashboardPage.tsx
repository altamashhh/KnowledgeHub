import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Mic,
  Layers,
  TrendingUp,
  Inbox,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../api/service';
import { KnowledgeItem } from '../../types';
import { KnowledgeItemCard } from '../../components/knowledge/KnowledgeItemCard';
import { LearningCard } from '../../components/knowledge/LearningProgressBar';
import { TopicChips } from '../../components/knowledge/TopicChips';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, openQuickCapture, itemMutationTrigger } = useAuth();

  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [learningItems, setLearningItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Compute greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getItems({ size: 20 });
        if (isMounted) {
          const all = response.content || [];
          setItems(all);

          // Find items in LEARNING status or default top learning items
          const learning = all.filter((i) => i.status === 'LEARNING');
          setLearningItems(learning.length > 0 ? learning : all.slice(0, 3));
        }
      } catch (e) {
        console.error('Error fetching dashboard items', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [itemMutationTrigger]);

  const totalCount = items.length;
  const inboxCount = items.filter((i) => i.status === 'INBOX').length;
  const learningCount = items.filter((i) => i.status === 'LEARNING').length;

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Alex';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Greeting */}
      <div>
        <p className="text-xs font-mono font-medium text-[#64748B]">{getGreeting()}</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F6] tracking-tight mt-0.5">
          {displayName}
        </h1>
      </div>

      {/* Quick Capture Pill */}
      <div
        onClick={openQuickCapture}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#11151B] rounded-xl border border-[#222733] shadow-xs hover:border-indigo-500/60 hover:bg-[#141922] transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3 text-[#94A3B8] group-hover:text-[#CBD5E1]">
          <div className="w-6 h-6 rounded-md bg-[#171B22] border border-[#2A313D] group-hover:bg-indigo-950/50 group-hover:text-indigo-400 flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-[#94A3B8] group-hover:text-[#F3F4F6]">
            Quick Capture...
          </span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="hidden sm:inline-block text-[10px] bg-[#171B22] px-2 py-0.5 rounded border border-[#2A313D] text-[#64748B] font-mono">
            ⌘C
          </kbd>
          <div className="p-1.5 rounded-md bg-[#171B22] border border-[#222733] text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
            <Mic className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Knowledge Overview */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#64748B]">
            Knowledge Overview
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Total Items card */}
          <div className="bg-[#11151B] p-4 rounded-xl border border-[#222733] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
              <div className="p-1.5 rounded-md bg-[#171B22] border border-[#2A313D] text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#F3F4F6] font-mono tracking-tight">
                {isLoading ? '...' : totalCount > 0 ? totalCount.toLocaleString() : '0'}
              </div>
              <p className="text-xs text-[#94A3B8] font-medium mt-0.5">Total Items</p>
            </div>
          </div>

          {/* Right column: This Week + Inbox */}
          <div className="flex flex-col gap-2.5">
            <div className="bg-[#11151B] p-3 rounded-xl border border-[#222733] flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-[#F3F4F6] font-mono">+{Math.max(3, items.length)}</div>
                <p className="text-[11px] text-[#94A3B8] font-medium">This Week</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>

            <div
              onClick={() => navigate('/library?status=INBOX')}
              className="bg-indigo-950/30 hover:bg-indigo-950/50 transition-colors p-3 rounded-xl border border-indigo-800/40 shadow-xs flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="text-base font-bold text-indigo-200 font-mono">{inboxCount}</div>
                <p className="text-[11px] text-indigo-400 font-semibold">Inbox</p>
              </div>
              <Inbox className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#64748B]">
            Continue Learning
          </h2>
          <button
            type="button"
            onClick={() => navigate('/library?status=LEARNING')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View All
          </button>
        </div>

        {isLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="w-60 h-28 bg-[#11151B] rounded-lg border border-[#222733] animate-pulse" />
            <div className="w-60 h-28 bg-[#11151B] rounded-lg border border-[#222733] animate-pulse" />
          </div>
        ) : learningItems.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {learningItems.map((item) => (
              <LearningCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-[#11151B] p-4 rounded-lg border border-[#222733] text-center text-xs text-[#64748B]">
            No items in active learning status yet.
          </div>
        )}
      </div>

      {/* Top Topics */}
      <div>
        <h2 className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#64748B] mb-2.5">
          Top Topics
        </h2>
        <TopicChips />
      </div>

      {/* Recent Captures */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#64748B]">
            Recent Captures
          </h2>
          <button
            type="button"
            onClick={() => navigate('/library')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View Library
          </button>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <LoadingSpinner size="sm" label="Loading recent captures..." />
          ) : items.length > 0 ? (
            items.slice(0, 5).map((item) => (
              <KnowledgeItemCard key={item.id} item={item} variant="dashboard-recent" />
            ))
          ) : (
            <div className="p-6 bg-[#11151B] border border-[#222733] rounded-lg text-center text-xs text-[#64748B]">
              No knowledge items yet. Click (+) Quick Capture above to start!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
