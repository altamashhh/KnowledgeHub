import React from 'react';
import { Globe, FileText, FileEdit, PlayCircle, Inbox, GraduationCap, CheckCircle2, Bookmark } from 'lucide-react';

export interface FilterState {
  status?: string;
  type?: string;
  topic?: string;
}

interface KnowledgeFilterBarProps {
  currentFilter: string; // 'ALL' | 'INBOX' | 'LEARNING' | 'COMPLETED' | 'WEBSITE' | 'DOCUMENTATION' | 'NOTE' | 'VIDEO'
  onSelectFilter: (filterKey: string) => void;
  className?: string;
}

export const KnowledgeFilterBar: React.FC<KnowledgeFilterBarProps> = ({
  currentFilter,
  onSelectFilter,
  className = '',
}) => {
  const filterOptions = [
    { key: 'ALL', label: 'All', icon: null },
    { key: 'STATUS_INBOX', label: 'Inbox', icon: <Inbox className="w-3.5 h-3.5 mr-1 text-[#94A3B8]" /> },
    { key: 'STATUS_LEARNING', label: 'Learning', icon: <GraduationCap className="w-3.5 h-3.5 mr-1 text-indigo-400" /> },
    { key: 'TYPE_WEBSITE', label: 'Website', icon: <Globe className="w-3.5 h-3.5 mr-1 text-sky-400" /> },
    { key: 'TYPE_DOCUMENTATION', label: 'Documentation', icon: <FileText className="w-3.5 h-3.5 mr-1 text-emerald-400" /> },
    { key: 'TYPE_NOTE', label: 'Note', icon: <FileEdit className="w-3.5 h-3.5 mr-1 text-amber-400" /> },
    { key: 'TYPE_VIDEO', label: 'Video', icon: <PlayCircle className="w-3.5 h-3.5 mr-1 text-rose-400" /> },
    { key: 'TYPE_BOOK', label: 'Book', icon: <Bookmark className="w-3.5 h-3.5 mr-1 text-violet-400" /> },
    { key: 'STATUS_COMPLETED', label: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> },
  ];

  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar ${className}`}>
      {filterOptions.map((opt) => {
        const isActive = currentFilter === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onSelectFilter(opt.key)}
            className={`
              inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer
              ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 border border-indigo-500'
                  : 'bg-[#11151B] text-[#94A3B8] border border-[#222733] hover:bg-[#171B22] hover:text-[#F3F4F6] hover:border-[#333B4D]'
              }
            `}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
