import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api.js';
import { MovieCardSkeleton } from '../components/common/Skeleton.jsx';
import MovieGrid from '../components/movies/MovieGrid.jsx';
import PageTransition from '../components/common/PageTransition.jsx';
import { Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Watchlist() {
  const { data, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => usersApi.getWatchlist().then((r) => r.data),
  });

  const movies = data?.data || [];

  if (isLoading) return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 shimmer-bg rounded-xl" />
          <div className="space-y-2">
            <div className="h-8 w-36 shimmer-bg rounded-xl" />
            <div className="h-4 w-24 shimmer-bg rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      </div>
    </PageTransition>
  );

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">My Watchlist</h1>
            <p className="text-slate-400 text-sm mt-0.5">{movies.length} movie{movies.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>

        {movies.length === 0 ? (
          <div className="card p-16 text-center">
            <Bookmark className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">Your watchlist is empty</p>
            <p className="text-slate-500 text-sm mt-1">Add movies you want to watch later</p>
            <Link to="/" className="btn-primary mt-6 inline-block">Browse Movies</Link>
          </div>
        ) : (
          <MovieGrid movies={movies} loading={false} />
        )}
      </div>
    </PageTransition>
  );
}
