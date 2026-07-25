import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Globe, User, Star, Heart, Play, ArrowLeft } from 'lucide-react';
import { useMovie, useToggleWatchlist } from '../hooks/useMovies.js';
import { useAuth } from '../hooks/useAuth.js';
import { usersApi } from '../api/users.api.js';
import { PageLoader } from '../components/common/Loader.jsx';
import ReviewForm from '../components/reviews/ReviewForm.jsx';
import ReviewList from '../components/reviews/ReviewList.jsx';
import StarRating from '../components/movies/StarRating.jsx';
import { getRatingBgColor } from '../utils/ratingHelper.js';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function MovieDetail() {
  const { id } = useParams();
  const { data, isLoading, refetch } = useMovie(id);
  const { user, isAuthenticated } = useAuth();
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const toggleWatchlist = useToggleWatchlist();
  
  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => usersApi.getWatchlist().then((r) => r.data),
    enabled: isAuthenticated
  });

  if (isLoading) return <PageLoader />;
  if (!data?.data) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <p className="text-slate-400 text-xl">Movie not found</p>
      <Link to="/" className="btn-primary mt-4">← Browse Movies</Link>
    </div>
  );

  const movie = data.data;
  const { title, description, poster, trailer, averageRating, totalReviews,
    releaseYear, language, director, genres, cast, reviews, addedBy } = movie;

  const hasReviewed = (reviews ?? []).some((r) => r.user?._id === user?._id);

  const isInWatchlist = (watchlistData?.data ?? watchlistData ?? []).some?.(m => m._id === id);

  const handleWatchlist = () => {
    if (!isAuthenticated) return toast.error('Please log in first');
    toggleWatchlist.mutate(id);
  };

  // Extract YouTube video ID
  const getYoutubeId = (url) => {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match?.[1];
  };
  const youtubeId = getYoutubeId(trailer);

  return (
    <div className="min-h-screen">
      {/* ── Back Button ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative">
        {poster?.url && (
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <img src={poster.url} alt="" className="w-full h-full object-cover blur-3xl scale-110" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0">
              <div className="w-56 md:w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
                {poster?.url ? (
                  <img src={poster.url} alt={title} className="w-full aspect-[2/3] object-cover" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-dark-800 flex items-center justify-center text-6xl">🎬</div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
                {title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                {releaseYear && (
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{releaseYear}</span>
                )}
                {language && (
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" />{language}</span>
                )}
                {director && (
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" />Dir. {director}</span>
                )}
              </div>

              {/* Genres */}
              {(genres ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(genres ?? []).map((g) => (
                    <span key={g._id} className="badge-primary">{g.name}</span>
                  ))}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-4">
                {averageRating > 0 ? (
                  <>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getRatingBgColor(averageRating)}`}>
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-xl font-bold">{averageRating.toFixed(1)}</span>
                      <span className="text-sm opacity-70">/10</span>
                    </div>
                    <div>
                      <StarRating rating={Math.round(averageRating)} readonly size="sm" />
                      <p className="text-xs text-slate-500 mt-1">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
                    </div>
                  </>
                ) : (
                  <span className="text-slate-500 italic text-sm">No ratings yet</span>
                )}
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{description}</p>

              {/* Cast */}
              {(cast ?? []).length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Cast</p>
                  <div className="flex flex-wrap gap-2">
                    {(cast ?? []).map((c, i) => (
                      <span key={i} className="glass px-3 py-1 rounded-lg text-xs text-slate-300">
                        <span className="text-white font-medium">{c.name}</span>
                        {c.role && <span className="text-slate-500"> as {c.role}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {isAuthenticated && (
                  <button
                    id="watchlist-btn"
                    onClick={handleWatchlist}
                    disabled={toggleWatchlist.isPending}
                    className={`btn-ghost flex items-center gap-2 ${isInWatchlist ? 'text-primary-400 bg-primary-500/10 border-primary-500/20' : ''}`}
                  >
                    <Heart className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                    {isInWatchlist ? 'In Watchlist' : 'Watchlist'}
                  </button>
                )}
                {youtubeId && (
                  <a
                    href={trailer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trailer Embed ────────────────────────────────────────────────────── */}
      {youtubeId && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="rounded-2xl overflow-hidden shadow-2xl aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* ── Reviews Section ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        {isAuthenticated && !hasReviewed && (
          <ReviewForm movieId={id} onSuccess={refetch} />
        )}

        {isAuthenticated && hasReviewed && (
          <div className="card p-4 text-center text-slate-400 text-sm">
            ✅ You've already reviewed this movie
          </div>
        )}

        {!isAuthenticated && (
          <div className="card p-4 text-center text-slate-400 text-sm">
            <Link to="/login" className="text-primary-400 hover:underline">Sign in</Link> to write a review
          </div>
        )}

        <ReviewList reviews={reviews ?? []} />
      </div>
    </div>
  );
}
