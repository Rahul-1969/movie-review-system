import Link from 'next/link';
import Image from 'next/image';
import { Star, Calendar, Globe } from 'lucide-react';
import { Movie } from '../../types';

// Helper for rating bg color (ported from client/src/utils/ratingHelper.js equivalent)
function getRatingBgColor(rating: number) {
  if (rating >= 8) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (rating >= 6) return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
  if (rating >= 4) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

export default function MovieCard({ movie }: { movie: Movie }) {
  if (!movie) return null;
  const movieId = movie._id || movie.id;
  if (!movieId) return null;

  const { title, poster, averageRating, totalReviews, releaseYear, language, genres } = movie;
  const posterUrl = poster?.url || 'https://placehold.co/400x600/1e293b/ffffff?text=No+Poster';

  return (
    <Link href={`/movies/${movieId}`} className="group block">
      <div className="card h-full overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-dark-800">
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized={posterUrl.includes('placehold.co')}
          />

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
              {genres
                .map((g, idx) => {
                  const genreId = (typeof g === 'object' && g !== null ? (g._id || g.id) : g) || idx;
                  let genreName: string | null = null;
                  if (typeof g === 'object' && g !== null && g.name) {
                    genreName = g.name;
                  } else if (typeof g === 'string') {
                    const trimmed = g.trim();
                    // If it is a 24-character hexadecimal ObjectId, don't show raw hash
                    if (!/^[0-9a-fA-F]{24}$/.test(trimmed)) {
                      genreName = trimmed;
                    }
                  }
                  return genreName ? { id: genreId, name: genreName } : null;
                })
                .filter((item): item is { id: string | number; name: string } => item !== null)
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
