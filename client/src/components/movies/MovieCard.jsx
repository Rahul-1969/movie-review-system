import { Link } from 'react-router-dom';
import { Star, Calendar, Globe } from 'lucide-react';
import { getRatingBgColor } from '../../utils/ratingHelper.js';

export default function MovieCard({ movie }) {
  const { _id, title, poster, averageRating, totalReviews, releaseYear, language, genres } = movie;

  return (
    <Link to={`/movies/${_id}`} className="group block">
      <div className="card overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-dark-800">
          {poster?.url ? (
            <img
              src={poster.url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
              <span className="text-4xl">🎬</span>
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

          {genres?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {genres.slice(0, 2).map((g) => (
                <span key={g._id} className="badge-primary text-xs">
                  {g.name}
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
