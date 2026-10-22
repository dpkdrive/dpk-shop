import { Star, StarHalf } from 'lucide-react';

export default function RatingStars({ rating = 0, size = 16, showScore = true, reviewsCount = null }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className="inline-flex items-center gap-1.5 text-amber-400">
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && <StarHalf size={size} className="fill-amber-400 text-amber-400" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-slate-300" />
        ))}
      </div>
      {showScore && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {reviewsCount !== null && (
        <span className="text-xs text-slate-500 font-normal">
          ({reviewsCount})
        </span>
      )}
    </div>
  );
}
