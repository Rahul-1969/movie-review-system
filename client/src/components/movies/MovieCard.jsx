import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Globe, Film } from 'lucide-react';
import { getRatingBgColor } from '../../utils/ratingHelper.js';

export default function MovieCard({ movie }) {
  if (!movie || typeof movie !== 'object') return null;

  const { _id, title = 'Untitled Movie', poster, averageRating = 0, totalReviews = 0, releaseYear, language, genres } = movie;
  const [imageError, setImageError] = useState(false);

  const posterUrl = !imageError && poster?.url?.trim() ? poster.url.trim() : null;

  return (
    <Link to={`/movies/${_id}`} className="group block">
      <div className="card overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-dark-800">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-dark-800 via-dark-850 to-dark-900 p-4 text-center border border-white/5 select-none">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-3 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform duration-300">
                <Film className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-300 line-clamp-3 leading-snug mb-1">
                {title}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                No Poster
              </span>
            </div>
          )}

          {/* Rating badge */}
          {averageRating > 0 && (
            <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold backdrop-blur-sm ${getRatingBgColor(averageRating)}`}>
              <Star className="w-3 h-3 fill-current" />
              {averageRating.toFixed(1)}
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-display font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-primary-400 transition-colors">
            {title}
          </h3>

          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
            {releaseYear && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {releaseYear}
              </span>
            )}
            {language && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {language}
              </span>
            )}
          </div>

          {Array.isArray(genres) && genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {genres
                .map((g, idx) => {
                  const genreId = g?._id || (typeof g === 'string' ? g : idx);
                  let genreName = null;
                  if (typeof g === 'object' && g !== null && g.name) {
                    genreName = g.name;
                  } else if (typeof g === 'string') {
                    const trimmed = g.trim();
                    // Don't display raw 24-character hex MongoDB ObjectIds
                    if (!/^[0-9a-fA-F]{24}$/.test(trimmed)) {
                      genreName = trimmed;
                    }
                  }
                  return genreName ? { id: genreId, name: genreName } : null;
                })
                .filter(Boolean)
                .slice(0, 2)
                .map((genre) => (
                  <span key={genre.id} className="badge-primary text-xs">
                    {genre.name}
                  </span>
                ))}
            </div>
          )}

          {totalReviews > 0 && (
            <p className="mt-2 text-xs text-slate-500">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
