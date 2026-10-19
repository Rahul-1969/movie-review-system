import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Globe, User, Star, ArrowLeft, Play } from 'lucide-react';
import { Movie, Review } from '../../../types';
import StarRating from '../../../components/movies/StarRating';
import ReviewSection from '../../../components/movies/ReviewSection';
import WatchlistButton from '../../../components/movies/WatchlistButton';

function getRatingBgColor(rating: number) {
  if (rating >= 8) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (rating >= 6) return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
  if (rating >= 4) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const res = await fetch(`${apiUrl}/movies/${id}`, { cache: 'no-store' });
  
  if (res.status === 404) {
    notFound();
  }
  
  if (!res.ok) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-slate-400 text-xl">Error loading movie.</p>
        <Link href="/" className="btn-primary mt-4">← Browse Movies</Link>
      </div>
    );
  }
  
  const json = await res.json();
  const movie: Movie & { reviews?: Review[] } = json.data;
  const movieId = movie?._id || movie?.id || id;
  
  const { title, description, poster, trailer, averageRating, totalReviews, releaseYear, language, director, genres, cast, reviews } = movie;
  const posterUrl = poster?.url || 'https://placehold.co/400x600/1e293b/ffffff?text=No+Poster';

  // Extract YouTube video ID
  const getYoutubeId = (url?: string) => {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match?.[1];
  };
  const youtubeId = getYoutubeId(trailer);

  return (
    <main className="min-h-screen">
      {/* ── Back Button ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="relative">
        {poster?.url && (
          <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <Image src={poster.url} alt="" fill sizes="100vw" className="object-cover blur-3xl scale-110" unoptimized={poster.url.includes('placehold.co')} />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0">
              <div className="w-56 md:w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10 relative aspect-[2/3] bg-dark-800">
                <Image src={posterUrl} alt={title} fill sizes="(max-width: 768px) 14rem, 16rem" className="object-cover" unoptimized={posterUrl.includes('placehold.co')} />
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
                  {(genres ?? []).map((g) => {
                    const genre = typeof g === 'string' ? { _id: g, name: 'Genre' } : g;
                    return (
                      <span key={genre._id} className="badge-primary">{genre.name}</span>
                    );
                  })}
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
                    {(cast ?? []).map((c, i) => {
                      const castName = typeof c === 'string' ? c : c.name;
                      const castRole = typeof c === 'string' ? '' : c.role;
                      return (
                        <span key={i} className="glass px-3 py-1 rounded-lg text-xs text-slate-300">
                          <span className="text-white font-medium">{castName}</span>
                          {castRole && <span className="text-slate-500"> as {castRole}</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Watchlist toggle — client island, only renders when authenticated */}
                <WatchlistButton movieId={movieId} />

                {youtubeId && trailer && (
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
        <ReviewSection reviews={reviews || []} movieId={movieId} />
      </div>
    </main>
  );
}
