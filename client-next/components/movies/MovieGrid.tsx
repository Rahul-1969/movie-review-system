import React from 'react';
import MovieCard from './MovieCard';
import { Movie } from '../../types';

export function MovieCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-dark-800/80" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-dark-800 rounded-lg" />
        <div className="h-3 w-2/3 bg-dark-800 rounded-lg" />
      </div>
    </div>
  );
}

export interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function MovieGrid({
  movies,
  loading = false,
  emptyMessage = 'No movies found.',
}: MovieGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const validMovies = (movies || []).filter((m): m is Movie => Boolean(m && (m._id || m.id)));

  if (!validMovies.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center card p-8 border border-white/5">
        <span className="text-5xl mb-4">🎬</span>
        <p className="text-slate-400 text-base">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {validMovies.map((movie) => (
        <MovieCard key={movie._id || movie.id} movie={movie} />
      ))}
    </div>
  );
}
