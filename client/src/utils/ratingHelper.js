/**
 * Get the color class for a rating value (1-10)
 * @param {number} rating
 * @returns {string} Tailwind color class
 */
export const getRatingColor = (rating) => {
  if (rating >= 8) return 'text-emerald-400';
  if (rating >= 6) return 'text-yellow-400';
  if (rating >= 4) return 'text-orange-400';
  return 'text-red-400';
};

/**
 * Get the bg color class for a rating badge
 */
export const getRatingBgColor = (rating) => {
  if (rating >= 8) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (rating >= 6) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  if (rating >= 4) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

/**
 * Get a label for a rating value
 */
export const getRatingLabel = (rating) => {
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
export const ratingToPercent = (rating) => Math.round((rating / 10) * 100);

/**
 * Generate star array for display (out of 5 stars, from 0-10 rating)
 */
export const getRatingStars = (rating) => {
  const out5 = rating / 2;
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(out5)) return 'full';
    if (i < out5) return 'half';
    return 'empty';
  });
};
