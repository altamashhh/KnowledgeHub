import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PlayCircle, FileText } from 'lucide-react';
import { KnowledgeItem } from '../../types';

interface LearningCardProps {
  item: KnowledgeItem;
}

export const LearningCard: React.FC<LearningCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const progress = item.progress ?? 50;

  const getIcon = () => {
    if (item.type === 'VIDEO') return <PlayCircle className="w-4 h-4 text-red-400" />;
    if (item.type === 'ARTICLE') return <BookOpen className="w-4 h-4 text-indigo-400" />;
    return <FileText className="w-4 h-4 text-indigo-400" />;
  };

  const getCleanType = () => {
    return item.type ? item.type.charAt(0) + item.type.slice(1).toLowerCase() : 'Article';
  };

  return (
    <div
      onClick={() => navigate(`/items/${item.id}`)}
      className="min-w-[240px] max-w-[280px] bg-[#11151B] p-4 rounded-lg border border-[#222733] hover:border-[#333B4D] hover:bg-[#141922] transition-all cursor-pointer flex flex-col justify-between flex-shrink-0 group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-1.5 rounded-lg bg-[#171B22] border border-[#2A313D] group-hover:border-indigo-500/40 text-indigo-400 transition-colors">
            {getIcon()}
          </div>
          <span className="text-[10px] font-mono font-medium text-[#94A3B8] bg-[#171B22] border border-[#222733] px-2 py-0.5 rounded">
            {getCleanType()}
          </span>
        </div>

        <h4 className="text-xs sm:text-sm font-semibold text-[#F3F4F6] line-clamp-2 mb-4 group-hover:text-indigo-400 transition-colors leading-snug">
          {item.title}
        </h4>
      </div>

      <div>
        <div className="flex justify-between items-center text-xs font-medium text-[#64748B] mb-1.5 font-mono">
          <span>Progress</span>
          <span className="text-indigo-300 font-semibold">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#171B22] rounded-full overflow-hidden border border-[#222733]">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
