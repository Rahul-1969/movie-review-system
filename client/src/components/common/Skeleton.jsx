/**
 * Skeleton loading components — share the shimmer-bg CSS utility already
 * defined in index.css (gradient + shimmer keyframe from tailwind.config.js).
 *
 * Usage:
 *   import { MovieCardSkeleton, ReviewCardSkeleton, ... } from './Skeleton.jsx';
 */

/** Base building block — pass any sizing/shape classes via className */
export function Skeleton({ className = '' }) {
  return <div className={`shimmer-bg rounded-xl ${className}`} />;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MovieCardSkeleton — matches MovieCard.jsx (poster aspect-[2/3] + info)     */
/* ─────────────────────────────────────────────────────────────────────────── */
export function MovieCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      {/* Poster */}
      <Skeleton className="w-full aspect-[2/3] rounded-none" />
      {/* Info */}
      <div className="p-3 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-1 pt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ReviewCardSkeleton — matches ReviewCard.jsx layout                          */
/* ─────────────────────────────────────────────────────────────────────────── */
export function ReviewCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      {/* Header row: avatar + name + stars */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        {/* Star row */}
        <Skeleton className="h-5 w-20 rounded-lg" />
      </div>
      {/* Review text lines */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      {/* Action bar */}
      <div className="flex gap-3 pt-1">
        <Skeleton className="h-7 w-16 rounded-lg" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ListCardSkeleton — matches list card in MyLists.jsx                         */
/* ─────────────────────────────────────────────────────────────────────────── */
export function ListCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      {/* Poster collage area */}
      <Skeleton className="w-full aspect-video rounded-none" />
      {/* Card body */}
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full mt-1" />
        <div className="flex gap-2 pt-2 border-t border-white/5 mt-2">
          <Skeleton className="h-6 w-12 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MovieDetailHeroSkeleton — matches the poster+info hero in MovieDetail.jsx  */
/* ─────────────────────────────────────────────────────────────────────────── */
export function MovieDetailHeroSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Back link placeholder */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Skeleton className="h-4 w-24 mb-6" />
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <Skeleton className="w-56 md:w-64 aspect-[2/3] rounded-2xl" />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 pt-2">
            {/* Title */}
            <Skeleton className="h-9 w-3/4" />
            {/* Meta row */}
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
            {/* Genre badges */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            {/* Rating */}
            <Skeleton className="h-12 w-40 rounded-xl" />
            {/* Description lines */}
            <div className="space-y-2 max-w-2xl">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section placeholder */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-4">
        <Skeleton className="h-6 w-32" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-20 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MyReviewSkeleton — matches individual review row in MyReviews.jsx           */
/* ─────────────────────────────────────────────────────────────────────────── */
export function MyReviewSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-14 h-20 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex gap-2 pt-2 border-t border-white/5">
        <Skeleton className="h-7 w-14 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* AdminStatsCardSkeleton — matches StatsCard in Dashboard.jsx                 */
/* ─────────────────────────────────────────────────────────────────────────── */
export function AdminStatsCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
