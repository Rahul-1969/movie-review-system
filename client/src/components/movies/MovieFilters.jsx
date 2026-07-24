import { Search, SlidersHorizontal, X } from 'lucide-react';

const GENRES = ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi'];
const LANGUAGES = ['English', 'Korean', 'Japanese', 'Spanish', 'French', 'Hindi'];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-averageRating', label: 'Highest Rated' },
  { value: '-totalReviews', label: 'Most Reviewed' },
  { value: 'title', label: 'A–Z' },
];

export default function MovieFilters({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });
  const clear = () => onChange({ page: 1, limit: 20 });

  const hasFilters = filters.search || filters.genre || filters.year || filters.language || filters.minRating;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="movie-search"
          type="text"
          placeholder="Search movies..."
          value={filters.search || ''}
          onChange={(e) => update('search', e.target.value)}
          className="input pl-11 pr-4"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-400">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        {/* Genre */}
        <select
          value={filters.genre || ''}
          onChange={(e) => update('genre', e.target.value)}
          className="bg-dark-800/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
        >
          <option value="">All Genres</option>
          {GENRES.map((g) => <option key={g} value={g.toLowerCase()}>{g}</option>)}
        </select>

        {/* Year */}
        <input
          type="number"
          placeholder="Year"
          min="1888"
          max={new Date().getFullYear() + 1}
          value={filters.year || ''}
          onChange={(e) => update('year', e.target.value)}
          className="bg-dark-800/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 w-24 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />

        {/* Language */}
        <select
          value={filters.language || ''}
          onChange={(e) => update('language', e.target.value)}
          className="bg-dark-800/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
        >
          <option value="">All Languages</option>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* Min Rating */}
        <select
          value={filters.minRating || ''}
          onChange={(e) => update('minRating', e.target.value)}
          className="bg-dark-800/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
        >
          <option value="">Any Rating</option>
          {[9, 8, 7, 6, 5].map((r) => <option key={r} value={r}>{r}+ ⭐</option>)}
        </select>

        {/* Sort */}
        <select
          value={filters.sort || '-createdAt'}
          onChange={(e) => update('sort', e.target.value)}
          className="bg-dark-800/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {hasFilters && (
          <button onClick={clear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
