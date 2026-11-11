import React from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'search' | 'library' | 'filter' | React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon = 'library',
}) => {
  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon;
    if (icon === 'search') {
      return <Search className="w-8 h-8 text-[#94A3B8]" />;
    }
    return <BookOpen className="w-8 h-8 text-indigo-400" />;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center mb-4 text-indigo-400 shadow-xs">
        {renderIcon()}
      </div>
      <h3 className="text-base font-bold text-[#F3F4F6] mb-1">{title}</h3>
      <p className="text-sm text-[#94A3B8] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};
