import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showText?: boolean;
  totalReviews?: number;
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showText = false,
  totalReviews,
}) => {
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starVal = idx + 1;
          const isFilled = rating >= starVal;
          const isHalf = !isFilled && rating >= starVal - 0.5;

          return (
            <button
              key={idx}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starVal)}
              className={`${
                interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
              } p-0.5 focus:outline-none`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-200 text-amber-400'
                    : 'fill-gray-100 text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showText && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {Number(rating).toFixed(1)}
          {totalReviews !== undefined && (
            <span className="text-xs text-gray-400 font-normal"> ({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
