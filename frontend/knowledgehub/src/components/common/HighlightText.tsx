import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight?: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  highlight,
  className = '',
}) => {
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Split query terms by spaces if multiple words
  const terms = highlight
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Escape regex special chars
  const escapedTerms = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = terms.some((t) => t.toLowerCase() === part.toLowerCase());
        if (isMatch) {
          return (
            <mark
              key={index}
              className="bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 rounded px-1 py-0.5 font-semibold inline"
            >
              {part}
            </mark>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
