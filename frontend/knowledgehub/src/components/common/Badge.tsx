import React from 'react';
import {
  FileText,
  Globe,
  FileEdit,
  PlayCircle,
  BookOpen,
  Inbox,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  Folder,
} from 'lucide-react';
import { KnowledgeItemStatus, KnowledgeItemType, DifficultyLevel } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'topic' | 'tag' | 'status' | 'type' | 'difficulty';
  status?: KnowledgeItemStatus | string;
  type?: KnowledgeItemType | string;
  difficulty?: DifficultyLevel | string | null;
  size?: 'sm' | 'md';
  className?: string;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  type,
  difficulty,
  size = 'md',
  className = '',
  onRemove,
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  if (type) {
    const normalized = type.toUpperCase();
    let icon = <FileText className="w-3.5 h-3.5 mr-1 text-[#94A3B8]" />;
    let label = type;
    let typeClass = 'bg-[#171B22] text-[#CBD5E1] border-[#222733]';

    if (normalized === 'WEBSITE') {
      icon = <Globe className="w-3.5 h-3.5 mr-1 text-sky-400" />;
      label = 'Website';
      typeClass = 'bg-sky-950/30 text-sky-300 border-sky-800/40';
    } else if (normalized === 'NOTE') {
      icon = <FileEdit className="w-3.5 h-3.5 mr-1 text-amber-400" />;
      label = 'Note';
      typeClass = 'bg-amber-950/30 text-amber-300 border-amber-800/40';
    } else if (normalized === 'VIDEO') {
      icon = <PlayCircle className="w-3.5 h-3.5 mr-1 text-rose-400" />;
      label = 'Video';
      typeClass = 'bg-rose-950/30 text-rose-300 border-rose-800/40';
    } else if (normalized === 'ARTICLE') {
      icon = <BookOpen className="w-3.5 h-3.5 mr-1 text-indigo-400" />;
      label = 'Article';
      typeClass = 'bg-indigo-950/30 text-indigo-300 border-indigo-800/40';
    } else if (normalized === 'DOCUMENTATION') {
      icon = <FileText className="w-3.5 h-3.5 mr-1 text-emerald-400" />;
      label = 'Documentation';
      typeClass = 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40';
    } else if (normalized === 'BOOK') {
      icon = <BookOpen className="w-3.5 h-3.5 mr-1 text-violet-400" />;
      label = 'Book';
      typeClass = 'bg-violet-950/30 text-violet-300 border-violet-800/40';
    }

    return (
      <span
        className={`inline-flex items-center font-medium rounded-md border ${typeClass} ${sizeClasses} ${className}`}
      >
        {icon}
        {children || label}
      </span>
    );
  }

  if (status) {
    const normalized = status.toUpperCase();
    let statusClass = 'bg-[#171B22] text-[#94A3B8] border-[#222733]';
    let icon = <Inbox className="w-3.5 h-3.5 mr-1 text-[#94A3B8]" />;
    let label = 'Inbox';

    if (normalized === 'LEARNING') {
      statusClass = 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40';
      icon = <GraduationCap className="w-3.5 h-3.5 mr-1 text-indigo-400" />;
      label = 'Learning';
    } else if (normalized === 'COMPLETED') {
      statusClass = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
      icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />;
      label = 'Completed';
    } else if (normalized === 'ARCHIVED') {
      statusClass = 'bg-slate-900 text-slate-400 border-slate-800';
      label = 'Archived';
    }

    return (
      <span
        className={`inline-flex items-center font-medium rounded-md border ${statusClass} ${sizeClasses} ${className}`}
      >
        {icon}
        {children || label}
      </span>
    );
  }

  if (difficulty) {
    const normalized = difficulty.toUpperCase();
    let diffClass = 'bg-[#171B22] text-[#94A3B8] border-[#222733]';
    if (normalized === 'BEGINNER') {
      diffClass = 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40';
    } else if (normalized === 'INTERMEDIATE') {
      diffClass = 'bg-sky-950/30 text-sky-400 border-sky-800/40';
    } else if (normalized === 'ADVANCED') {
      diffClass = 'bg-violet-950/30 text-violet-400 border-violet-800/40';
    }

    return (
      <span
        className={`inline-flex items-center font-medium rounded-md border ${diffClass} ${sizeClasses} ${className}`}
      >
        <TrendingUp className="w-3 h-3 mr-1 opacity-80" />
        {children || difficulty}
      </span>
    );
  }

  if (variant === 'topic') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-800/50 ${sizeClasses} ${className}`}
      >
        <Folder className="w-3 h-3 mr-1 text-indigo-400" />
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 text-indigo-400 hover:text-indigo-200 focus:outline-none"
          >
            ×
          </button>
        )}
      </span>
    );
  }

  if (variant === 'tag') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-md bg-[#171B22] text-[#94A3B8] border border-[#222733] font-mono ${sizeClasses} ${className}`}
      >
        <span>#{children}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 text-[#64748B] hover:text-[#F3F4F6] focus:outline-none"
          >
            ×
          </button>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md bg-[#171B22] text-[#CBD5E1] border border-[#222733] ${sizeClasses} ${className}`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 text-[#64748B] hover:text-[#F3F4F6] focus:outline-none"
        >
          ×
        </button>
      )}
    </span>
  );
};
