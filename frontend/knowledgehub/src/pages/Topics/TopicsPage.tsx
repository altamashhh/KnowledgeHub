import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Folder, Hash, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { apiService } from '../../api/service';
import { KnowledgeItem } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const TopicsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAllItems = async () => {
      setIsLoading(true);
      try {
        const res = await apiService.getItems({ size: 100 });
        if (isMounted) setItems(res.content || []);
      } catch (e) {
        console.error('Failed to load items for topics', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllItems();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute topic counts
  const topicCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  items.forEach((item) => {
    if (item.topic) {
      topicCounts[item.topic] = (topicCounts[item.topic] || 0) + 1;
    }
    if (item.tags) {
      item.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
          Topics & Tags
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1 font-mono">
          Explore knowledge organized by taxonomy and tags.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner size="md" label="Loading topics..." />
      ) : (
        <>
          {/* Topics section */}
          <div className="space-y-3">
            <h2 className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span>Primary Topics ({sortedTopics.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sortedTopics.map(([topic, count]) => (
                <div
                  key={topic}
                  onClick={() => navigate(`/library?topic=${encodeURIComponent(topic)}`)}
                  className="bg-[#11151B] p-4 rounded-lg border border-[#222733] hover:border-indigo-500/50 hover:bg-[#141922] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#171B22] border border-[#2A313D] text-indigo-400 flex items-center justify-center font-mono font-bold text-xs group-hover:border-indigo-500/50 group-hover:bg-indigo-950/40 transition-colors">
                      {topic.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#F3F4F6] group-hover:text-indigo-400 transition-colors">
                        {topic}
                      </h4>
                      <p className="text-[11px] text-[#64748B] font-mono">
                        {count} item{count === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#475569] group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Tags Cloud */}
          <div className="space-y-3 pt-2">
            <h2 className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-400" />
              <span>All Tags ({sortedTags.length})</span>
            </h2>

            <div className="bg-[#11151B] p-4 sm:p-5 rounded-xl border border-[#222733] flex flex-wrap gap-2">
              {sortedTags.map(([tag, count]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171B22] hover:bg-indigo-950/40 text-[#CBD5E1] hover:text-indigo-300 border border-[#222733] hover:border-indigo-800/50 text-xs font-mono transition-all cursor-pointer"
                >
                  <span>#{tag}</span>
                  <span className="bg-[#0B0D10] px-1.5 py-0.2 rounded border border-[#222733] text-[10px] text-[#64748B]">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
