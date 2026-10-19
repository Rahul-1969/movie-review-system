/**
 * Format a date string or Date object into a human-readable format
 */
export const formatDate = (
  date: string | Date | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!date) return '';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
};

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date: string | Date | undefined): string => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  if (isNaN(diffMs)) return '';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  return formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Format a month number (1-12) into a short month name
 */
export const monthName = (month: number): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return months[month - 1] || '';
};
