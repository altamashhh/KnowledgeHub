import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopicChipsProps {
  topics?: string[];
  selectedTopic?: string;
  onSelectTopic?: (topic: string) => void;
  className?: string;
}

const DEFAULT_TOPICS = ['React', 'System Design', 'SQL', 'Architecture', 'TypeScript', 'Performance', 'Java'];

export const TopicChips: React.FC<TopicChipsProps> = ({
  topics = DEFAULT_TOPICS,
  selectedTopic,
  onSelectTopic,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleTopicClick = (topic: string) => {
    if (onSelectTopic) {
      onSelectTopic(topic);
    } else {
      navigate(`/library?topic=${encodeURIComponent(topic)}`);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {topics.map((topic) => {
        const isSelected = selectedTopic?.toLowerCase() === topic.toLowerCase();
        return (
          <button
            key={topic}
            type="button"
            onClick={() => handleTopicClick(topic)}
            className={`
              px-3 py-1 rounded-md text-xs font-mono font-medium transition-all duration-150 cursor-pointer
              ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 border border-indigo-500'
                  : 'bg-[#171B22] text-[#CBD5E1] hover:bg-[#1E242E] hover:text-white border border-[#222733] hover:border-[#333B4D]'
              }
            `}
          >
            #{topic}
          </button>
        );
      })}
    </div>
  );
};
