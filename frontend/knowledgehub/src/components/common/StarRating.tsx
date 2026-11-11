import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | null | undefined;
  onChange?: (rating: number) => void;
  maxStars?: number;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onChange,
  maxStars = 5,
  readOnly = false,
  size = 'md',
}) => {
  const currentRating = rating || 0;

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= currentRating;

        if (readOnly) {
          return (
            <Star
              key={i}
              className={`${sizeClasses[size]} ${
                isFilled ? 'text-amber-400 fill-amber-400' : 'text-[#2A313D]'
              }`}
            />
          );
        }

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange && onChange(starValue)}
            className="focus:outline-none transition-transform hover:scale-110 p-0.5"
            aria-label={`Rate ${starValue} stars`}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                isFilled
                  ? 'text-indigo-400 fill-indigo-400 hover:text-indigo-300 hover:fill-indigo-300'
                  : 'text-[#2A313D] hover:text-indigo-400'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
