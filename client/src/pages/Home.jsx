import { useState, useRef, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, TrendingUp, Star, Loader2, Sparkles } from 'lucide-react';
import { useInfiniteMovies, useTopRated, useTrending, useRecommendations } from '../hooks/useMovies.js';
import { useAuth } from '../hooks/useAuth.js';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver.js';
import MovieGrid from '../components/movies/MovieGrid.jsx';
import MovieFilters from '../components/movies/MovieFilters.jsx';
import SearchAutocomplete from '../components/movies/SearchAutocomplete.jsx';

export default function Home() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  const { 
    data: moviesData, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteMovies(filters);

  const { data: topRatedData } = useTopRated();
  const { data: trendingData } = useTrending();
  
  const { isAuthenticated } = useAuth();
  const { data: recData } = useRecommendations(isAuthenticated);

  const movies = useMemo(() => {
    return moviesData?.pages.flatMap((page) => page.data) || [];
  }, [moviesData]);
  
  const totalMovies = moviesData?.pages[0]?.pagination?.total || 0;

  const loadMoreRef = useRef(null);

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: !!hasNextPage && !isFetchingNextPage,
  });
  const topRated = topRatedData?.data || [];
  const trending = trendingData?.data || [];
  const recommendations = recData?.data || [];
  const topGenre = recData?.topGenre;

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-dark-950 via-dark-900 to-primary-900/20 py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15)_0%,transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6 animate-fade-in">
            <Star className="w-3.5 h-3.5 fill-current" />
            Honest Film Criticism
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 leading-tight">
            Discover & Review
            <span className="block gradient-text">Great Cinema</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto text-balance">
            Join thousands of film lovers. Rate movies, write reviews, build your watchlist.
          </p>
          <SearchAutocomplete 
            onSearchChange={(value) => setFilters((f) => ({ ...f, search: value, page: 1 }))} 
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* ── Recommendations Section ─────────────────────────────────────────────── */}
        {isAuthenticated && recommendations.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary-400" />
              <h2 className="section-title">
                {topGenre ? `Because you liked ${topGenre.name}` : 'Recommended For You'}
              </h2>
            </div>
            <MovieGrid movies={recommendations} loading={false} />
          </section>
        )}

        {/* ── Trending Section ─────────────────────────────────────────────── */}
        {(trending.length > 0 || topRated.length > 0) && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <h2 className="section-title">
                {trending.length > 0 ? 'Trending This Week' : 'Popular Right Now'}
              </h2>
            </div>
            <MovieGrid movies={(trending.length > 0 ? trending : topRated).slice(0, 12)} loading={false} />
          </section>
        )}

        {/* ── Top Rated Section ────────────────────────────────────────────── */}
        {topRated.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <h2 className="section-title">Top Rated</h2>
            </div>
            <MovieGrid movies={topRated.slice(0, 12)} loading={false} />
          </section>
        )}

        {/* ── Browse All ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="section-title mb-6">Browse All Movies</h2>

          {/* Filters */}
          <div className="mb-8">
            <MovieFilters filters={filters} onChange={setFilters} />
          </div>

          {/* Grid */}
          <MovieGrid movies={movies} loading={isLoading} />

          {/* Infinite Scroll Sentinel */}
          {!isLoading && (
            <div ref={loadMoreRef} className="py-8 flex justify-center items-center">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-primary-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Loading more movies...</span>
                </div>
              ) : !hasNextPage && movies.length > 0 ? (
                <p className="text-slate-500 text-sm">
                  You've reached the end. Showing all {movies.length} movies.
                </p>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
