/**
 * Get the color class for a rating value (1-10)
 */
export const getRatingColor = (rating: number): string => {
  if (rating >= 8) return 'text-emerald-400';
  if (rating >= 6) return 'text-primary-400';
  if (rating >= 4) return 'text-amber-400';
  return 'text-red-400';
};

/**
 * Get the bg color class for a rating badge
 */
export const getRatingBgColor = (rating: number): string => {
  if (rating >= 8) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (rating >= 6) return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
  if (rating >= 4) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

/**
 * Get a label for a rating value
 */
export const getRatingLabel = (rating: number): string => {
  if (rating >= 9) return 'Masterpiece';
  if (rating >= 8) return 'Excellent';
  if (rating >= 7) return 'Great';
  if (rating >= 6) return 'Good';
  if (rating >= 5) return 'Average';
  if (rating >= 4) return 'Below Average';
  if (rating >= 3) return 'Poor';
  return 'Terrible';
};

/**
 * Convert a rating (1-10) to a percentage width for progress bars
 */
export const ratingToPercent = (rating: number): number => Math.round((rating / 10) * 100);
