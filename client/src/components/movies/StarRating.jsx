import { Star } from 'lucide-react';

export default function StarRating({ rating, onRate, size = 'md', readonly = false }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  const stars = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRate?.(star)}
          className={`transition-all duration-100 ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'
          }`}
          title={`${star}/10`}
          aria-label={`Rate ${star} out of 10`}
        >
          <Star
            className={`${sizes[size]} transition-colors ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-600 fill-transparent'
            }`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm font-semibold text-yellow-400">
          {rating}/10
        </span>
      )}
    </div>
  );
}
