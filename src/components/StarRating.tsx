'use client';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({
  rating,
  size = 'md',
  interactive = false,
  onRate,
}: StarRatingProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const baseClass = sizeMap[size];

  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate?.(star)}
          disabled={!interactive}
          aria-label={`Rate ${star} stars`}
          className={`${baseClass} transition-transform ${
            interactive
              ? 'cursor-pointer hover:scale-110'
              : 'cursor-default'
          }`}
        >
          <StarIcon
            filled={star <= Math.ceil(rating)}
            half={star - rating > 0 && star - rating < 1}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-text-muted">
        {rating > 0 && `${rating.toFixed(1)}`}
      </span>
    </div>
  );
}

interface StarIconProps {
  filled: boolean;
  half?: boolean;
}

function StarIcon({ filled, half }: StarIconProps) {
  if (half) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-full h-full text-primary"
      >
        <defs>
          <linearGradient id="halfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <polygon
          points="12,2 15.09,10.26 23.77,11.27 17.77,17.73 19.24,26.74 12,23.06 4.76,26.74 6.23,17.73 0.23,11.27 8.91,10.26"
          fill="url(#halfGradient)"
        />
      </svg>
    );
  }

  if (filled) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full text-primary"
      >
        <polygon points="12,2 15.09,10.26 23.77,11.27 17.77,17.73 19.24,26.74 12,23.06 4.76,26.74 6.23,17.73 0.23,11.27 8.91,10.26" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="w-full h-full text-text-muted"
    >
      <polygon points="12,2 15.09,10.26 23.77,11.27 17.77,17.73 19.24,26.74 12,23.06 4.76,26.74 6.23,17.73 0.23,11.27 8.91,10.26" />
    </svg>
  );
}
