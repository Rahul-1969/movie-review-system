'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../lib/api/users.api';
import MovieCard from '../../components/movies/MovieCard';
import { Movie } from '../../types';

// ── Loading skeleton ──────────────────────────────────────────────────────────
function MovieCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-[2/3] shimmer-bg" />
      <div className="p-3 space-y-2">
        <div className="h-4 shimmer-bg rounded-lg" />
        <div className="h-3 w-2/3 shimmer-bg rounded-lg" />
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Auth guard — redirect to /login if not authenticated once auth resolves
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => usersApi.getWatchlist().then((r) => r.data),
    // Only fetch once we know the user is authenticated
    enabled: !loading && isAuthenticated,
  });

  // While auth is still resolving OR watchlist is loading, show loading skeleton
  if (loading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 shimmer-bg rounded-xl" />
          <div className="space-y-2">
            <div className="h-8 w-36 shimmer-bg rounded-xl" />
            <div className="h-4 w-24 shimmer-bg rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // If auth has resolved and user is not authenticated, render nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Error state
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-12 text-center max-w-lg mx-auto space-y-4 border border-red-500/20 bg-red-500/5">
          <p className="text-red-400 font-medium">Failed to load your watchlist.</p>
          <button onClick={() => refetch()} className="btn-primary text-sm py-2 px-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // The API returns { success, data: Movie[] }
  const rawMovies = Array.isArray(data?.data) ? data.data : [];
  const movies: Movie[] = rawMovies.filter(
    (m): m is Movie => Boolean(m && typeof m === 'object' && (m._id || m.id))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-white">My Watchlist</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {movies.length} movie{movies.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {movies.length === 0 ? (
        <div className="card p-16 text-center">
          <Bookmark className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">Your watchlist is empty</p>
          <p className="text-slate-500 text-sm mt-1">Add movies you want to watch later</p>
          <Link href="/" className="btn-primary mt-6 inline-block">
            Browse Movies
          </Link>
        </div>
      ) : (
        /* ── Movie grid ──────────────────────────────────────────────────── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie._id || movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
