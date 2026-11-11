import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  FileText,
  FileEdit,
  PlayCircle,
  BookOpen,
  Bookmark,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { KnowledgeItem } from '../../types';
import { HighlightText } from '../common/HighlightText';

interface KnowledgeItemCardProps {
  item: KnowledgeItem;
  searchQuery?: string;
  variant?: 'compact' | 'standard' | 'dashboard-recent';
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 2) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  } catch {
    return 'Recent';
  }
}

export const KnowledgeItemCard: React.FC<KnowledgeItemCardProps> = ({
  item,
  searchQuery,
  variant = 'standard',
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/items/${item.id}`);
  };

  const getItemIcon = () => {
    const type = (item.type || 'NOTE').toUpperCase();
    switch (type) {
      case 'WEBSITE':
        return <Globe className="w-4 h-4 text-sky-400" />;
      case 'NOTE':
        return <FileEdit className="w-4 h-4 text-amber-400" />;
      case 'DOCUMENTATION':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'VIDEO':
        return <PlayCircle className="w-4 h-4 text-rose-400" />;
      case 'ARTICLE':
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'BOOK':
        return <Bookmark className="w-4 h-4 text-violet-400" />;
      default:
        return <FileText className="w-4 h-4 text-[#94A3B8]" />;
    }
  };

  const getCleanTypeLabel = () => {
    const raw = item.type || 'Note';
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  };

  // Dashboard recent captures style
  if (variant === 'dashboard-recent') {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-3.5 p-3 rounded-lg hover:bg-[#171B22] border border-[#222733] bg-[#11151B] transition-all cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-lg bg-[#171B22] border border-[#2A313D] flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/50 group-hover:bg-indigo-950/40 text-indigo-400 transition-colors">
          {getItemIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-[#F3F4F6] truncate group-hover:text-indigo-400 transition-colors">
            {item.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#64748B]">
            <span>{formatRelativeTime(item.createdAt)}</span>
            {item.topic && (
              <>
                <span>•</span>
                <span className="bg-indigo-950/50 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.2 rounded text-[10px] font-mono">
                  {item.topic}
                </span>
              </>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-[#475569] group-hover:text-indigo-400 transition-colors" />
      </div>
    );
  }

  // Standard Library and Search Result Style
  return (
    <div
      onClick={handleClick}
      className="p-4 bg-[#11151B] border border-[#222733] rounded-lg hover:border-[#333B4D] hover:bg-[#141922] transition-all cursor-pointer group mb-2.5"
    >
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <h3 className="text-sm sm:text-base font-semibold text-[#F3F4F6] group-hover:text-indigo-400 transition-colors line-clamp-1">
          <HighlightText text={item.title} highlight={searchQuery} />
        </h3>
        <span className="text-xs text-[#64748B] font-mono whitespace-nowrap flex-shrink-0">
          {formatRelativeTime(item.createdAt)}
        </span>
      </div>

      {item.content && (
        <p className="text-xs sm:text-sm text-[#94A3B8] line-clamp-2 mb-3 leading-relaxed">
          <HighlightText text={item.content} highlight={searchQuery} />
        </p>
      )}

      <div className="flex items-center gap-2 text-xs flex-wrap pt-1 border-t border-[#1C212A]">
        <span className="inline-flex items-center gap-1 text-[#94A3B8] font-medium text-xs">
          {getItemIcon()}
          <span>{getCleanTypeLabel()}</span>
        </span>

        {item.topic && (
          <>
            <span className="text-[#333B4D]">•</span>
            <span className="bg-indigo-950/50 text-indigo-300 border border-indigo-800/40 px-2 py-0.5 rounded text-[11px] font-mono">
              <HighlightText text={item.topic} highlight={searchQuery} />
            </span>
          </>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 ml-auto">
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="bg-[#171B22] text-[#94A3B8] border border-[#222733] px-1.5 py-0.5 rounded text-[10px] font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
