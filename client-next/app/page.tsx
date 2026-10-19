'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Star, TrendingUp, Sparkles, Loader2, ArrowLeft, X, AlertCircle } from 'lucide-react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { moviesApi } from '../lib/api/movies.api';
import MovieGrid, { MovieCardSkeleton } from '../components/movies/MovieGrid';
import MovieFilters from '../components/movies/MovieFilters';
import SearchAutocomplete from '../components/movies/SearchAutocomplete';
import { useIntersectionObserver } from '../lib/utils/useIntersectionObserver';
import { Movie, MovieQueryParams } from '../types';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MovieQueryParams>({ page: 1, limit: 20, sort: '-createdAt' });

  const isSearching = Boolean(searchQuery.trim());

  // ─── Browse All Movies (Infinite Query) ──────────────────────────────────
  const {
    data: moviesData,
    isLoading: isMoviesLoading,
    isError: isMoviesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMovies,
  } = useInfiniteQuery({
    queryKey: ['movies', 'browse-infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await moviesApi.getAll({ ...filters, page: pageParam as number });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage?.pagination || {};
      return page && pages && page < pages ? page + 1 : undefined;
    },
    enabled: !isSearching,
  });

  // ─── Dedicated Search Query (Infinite Query) ─────────────────────────────
  const {
    data: searchMoviesData,
    isLoading: isSearchLoading,
    isError: isSearchError,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    refetch: refetchSearch,
  } = useInfiniteQuery({
    queryKey: ['movies', 'search-infinite', searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await moviesApi.getAll({
        search: searchQuery.trim(),
        limit: 24,
        page: pageParam as number,
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage?.pagination || {};
      return page && pages && page < pages ? page + 1 : undefined;
    },
    enabled: isSearching,
  });

  // ─── Discovery Sections Queries ──────────────────────────────────────────
  const {
    data: topRatedData,
    isLoading: topRatedLoading,
    isError: topRatedError,
    refetch: refetchTopRated,
  } = useQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: () => moviesApi.getTopRated().then((res) => res.data?.data ?? []),
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: trendingData,
    isLoading: trendingLoading,
    isError: trendingError,
    refetch: refetchTrending,
  } = useQuery({
    queryKey: ['movies', 'trending'],
    queryFn: () => moviesApi.getTrending().then((res) => res.data?.data ?? []),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: recData,
    isLoading: recLoading,
    isError: recError,
    refetch: refetchRec,
  } = useQuery({
    queryKey: ['movies', 'recommendations'],
    queryFn: () => moviesApi.getRecommendations().then((res) => res.data?.data ?? []),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 15,
  });

  // ─── Deduplicated Movie Lists ────────────────────────────────────────────
  const movies = useMemo(() => {
    const seen = new Set<string>();
    const list: Movie[] = [];
    for (const page of moviesData?.pages ?? []) {
      for (const m of page?.data ?? []) {
        const id = m?._id || m?.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          list.push(m);
        }
      }
    }
    return list;
  }, [moviesData]);

  const searchMovies = useMemo(() => {
    const seen = new Set<string>();
    const list: Movie[] = [];
    for (const page of searchMoviesData?.pages ?? []) {
      for (const m of page?.data ?? []) {
        const id = m?._id || m?.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          list.push(m);
        }
      }
    }
    return list;
  }, [searchMoviesData]);

  const totalMovies = moviesData?.pages?.[0]?.pagination?.total ?? 0;
  const searchTotal = searchMoviesData?.pages?.[0]?.pagination?.total ?? 0;

  // Infinite Scroll Sentinel
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: !isSearching && Boolean(hasNextPage) && !isFetchingNextPage,
  });

  const topRated = ((topRatedData ?? []) as Movie[]).filter((m): m is Movie => Boolean(m && (m._id || m.id)));
  const trending = ((trendingData ?? []) as Movie[]).filter((m): m is Movie => Boolean(m && (m._id || m.id)));
  const recommendations = ((recData ?? []) as Movie[]).filter((m): m is Movie => Boolean(m && (m._id || m.id)));

  // Search Submit & Clear Handlers
  const handleSearchSubmit = (query: string) => {
    const trimmed = query.trim();
    if (trimmed && trimmed !== searchQuery) {
      setSearchQuery(trimmed);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero / Search Bar ────────────────────────────────────────────── */}
      <section
        className={`relative bg-gradient-to-br from-dark-950 via-dark-900 to-primary-900/20 px-4 transition-all duration-300 ${
          isSearching ? 'py-6 border-b border-white/10' : 'py-16 sm:py-20'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {!isSearching && (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
                <Star className="w-3.5 h-3.5 fill-current" />
                Honest Film Criticism
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4 leading-tight">
                Discover &amp; Review
                <span className="block gradient-text">Great Cinema</span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto text-balance">
                Join thousands of film lovers. Rate movies, write reviews, build your watchlist.
              </p>
            </>
          )}

          <SearchAutocomplete
            initialQuery={searchQuery}
            onSearchSubmit={handleSearchSubmit}
            onClear={handleClearSearch}
          />
        </div>
      </section>

      {/* ── Main Content Area: Dedicated Search View OR Homepage Sections ───── */}
      {isSearching ? (
        /* ── Dedicated Search Results View ──────────────────────────────── */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Search Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <button
                id="back-to-browse-top-btn"
                onClick={handleClearSearch}
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary-400 hover:text-primary-300 mb-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Browse</span>
              </button>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Search Results for <span className="gradient-text">&quot;{searchQuery}&quot;</span>
              </h2>
              {!isSearchLoading && !isSearchError && (
                <p className="text-slate-400 text-sm mt-1">
                  Found {searchTotal} movie{searchTotal === 1 ? '' : 's'} matching your query
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                id="return-to-browse-btn"
                onClick={handleClearSearch}
                className="btn-ghost flex items-center gap-2 text-sm py-2 px-4 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Browsing</span>
              </button>
              <button
                id="clear-search-btn"
                onClick={handleClearSearch}
                className="btn-ghost flex items-center gap-2 text-sm py-2 px-4 hover:border-red-500/30 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Clear Search</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isSearchLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!isSearchLoading && isSearchError && (
            <div className="card p-10 text-center space-y-4 max-w-lg mx-auto border border-red-500/20 bg-red-500/5">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Search Failed</h3>
              <p className="text-slate-400 text-sm">
                Unable to fetch search results from the server. Please try again.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => refetchSearch()}
                  className="btn-primary text-sm py-2 px-4 cursor-pointer"
                >
                  Retry
                </button>
                <button
                  onClick={handleClearSearch}
                  className="btn-ghost text-sm py-2 px-4 cursor-pointer"
                >
                  Back to Homepage
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isSearchLoading && !isSearchError && searchMovies.length === 0 && (
            <div className="card p-12 text-center space-y-4 max-w-xl mx-auto border border-white/10">
              <span className="text-5xl block mb-2">🔍</span>
              <h3 className="text-xl font-semibold text-white">
                No movies found for &quot;{searchQuery}&quot;
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find any movies matching your search query. Try checking your spelling or searching by director or genre.
              </p>
              <button
                id="empty-state-clear-search-btn"
                onClick={handleClearSearch}
                className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-6 mt-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Clear Search &amp; Return Home</span>
              </button>
            </div>
          )}

          {/* Results Grid */}
          {!isSearchLoading && !isSearchError && searchMovies.length > 0 && (
            <>
              <MovieGrid movies={searchMovies} loading={false} />
              {hasNextSearchPage && (
                <div className="pt-8 flex justify-center">
                  <button
                    id="search-load-more-btn"
                    onClick={() => fetchNextSearchPage()}
                    disabled={isFetchingNextSearchPage}
                    className="btn-primary text-sm flex items-center gap-2 py-2.5 px-6 cursor-pointer"
                  >
                    {isFetchingNextSearchPage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading more results...</span>
                      </>
                    ) : (
                      <span>Load More Results</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* ── Normal Homepage Discovery Sections ─────────────────────────── */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* ── Recommendations Section (Authenticated) ────────────────────── */}
          {isAuthenticated && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-400" />
                  <h2 className="section-title">Recommended For You</h2>
                </div>
                {recommendations.length > 0 && (
                  <span className="text-xs text-slate-500 font-medium">Personalized</span>
                )}
              </div>

              {recLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <MovieCardSkeleton key={i} />
                  ))}
                </div>
              ) : recError ? (
                <div className="card p-6 text-center space-y-2 border border-red-500/20 bg-red-500/5">
                  <p className="text-sm text-red-400">Failed to load recommendations.</p>
                  <button onClick={() => refetchRec()} className="btn-ghost text-xs py-1.5 px-3 cursor-pointer">
                    Retry
                  </button>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="card p-6 text-center text-slate-400 text-sm">
                  No recommendations yet. Start rating and reviewing movies to get personalized recommendations!
                </div>
              ) : (
                <MovieGrid movies={recommendations.slice(0, 12)} loading={false} />
              )}
            </section>
          )}

          {/* ── Trending Section ─────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                <h2 className="section-title">
                  {trending.length > 0 ? 'Trending This Week' : 'Popular Right Now'}
                </h2>
              </div>
              {trending.length > 0 && (
                <span className="text-xs text-slate-500 font-medium">Based on recent reviews</span>
              )}
            </div>

            {trendingLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            ) : trendingError ? (
              <div className="card p-6 text-center space-y-2 border border-red-500/20 bg-red-500/5">
                <p className="text-sm text-red-400">Failed to load trending movies.</p>
                <button onClick={() => refetchTrending()} className="btn-ghost text-xs py-1.5 px-3 cursor-pointer">
                  Retry
                </button>
              </div>
            ) : (trending.length > 0 || topRated.length > 0) ? (
              <MovieGrid
                movies={(trending.length > 0 ? trending : topRated).slice(0, 12)}
                loading={false}
              />
            ) : (
              <div className="card p-6 text-center text-slate-400 text-sm">
                No trending movies available right now.
              </div>
            )}
          </section>

          {/* ── Top Rated Section ────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h2 className="section-title">Top Rated</h2>
              </div>
              {topRated.length > 0 && (
                <span className="text-xs text-slate-500 font-medium">
                  Top {Math.min(topRated.length, 12)} highest community rated
                </span>
              )}
            </div>

            {topRatedLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            ) : topRatedError ? (
              <div className="card p-6 text-center space-y-2 border border-red-500/20 bg-red-500/5">
                <p className="text-sm text-red-400">Failed to load top rated movies.</p>
                <button onClick={() => refetchTopRated()} className="btn-ghost text-xs py-1.5 px-3 cursor-pointer">
                  Retry
                </button>
              </div>
            ) : topRated.length === 0 ? (
              <div className="card p-6 text-center text-slate-400 text-sm">
                No top rated movies available yet.
              </div>
            ) : (
              <MovieGrid movies={topRated.slice(0, 12)} loading={false} />
            )}
          </section>

          {/* ── Browse All Movies ────────────────────────────────────────── */}
          <section id="browse-all-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Browse All Movies</h2>
              {totalMovies > 0 && (
                <span className="text-xs text-slate-500 font-medium">
                  {totalMovies} movie{totalMovies === 1 ? '' : 's'} in catalog
                </span>
              )}
            </div>

            {/* Filters */}
            <div className="mb-8">
              <MovieFilters
                filters={filters}
                onChange={setFilters}
                onSearchSubmit={handleSearchSubmit}
              />
            </div>

            {/* Grid / Loading / Error */}
            {isMoviesError ? (
              <div className="card p-8 text-center space-y-3 border border-red-500/20 bg-red-500/5">
                <p className="text-sm text-red-400">Failed to load movies.</p>
                <button
                  onClick={() => refetchMovies()}
                  className="btn-primary text-xs py-2 px-4 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : (
              <MovieGrid
                movies={movies}
                loading={isMoviesLoading}
                emptyMessage="No movies match the selected filters."
              />
            )}

            {/* Infinite Scroll Sentinel & Load More button */}
            {!isMoviesLoading && !isMoviesError && (
              <div className="py-8 flex flex-col items-center justify-center gap-4">
                <div ref={loadMoreRef} className="h-4 w-full flex justify-center items-center">
                  {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-primary-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Loading more movies...</span>
                    </div>
                  )}
                </div>

                {/* Accessible Load More Fallback Button */}
                {hasNextPage && !isFetchingNextPage && (
                  <button
                    id="browse-load-more-btn"
                    onClick={() => fetchNextPage()}
                    className="btn-ghost text-sm py-2.5 px-6 cursor-pointer hover:text-white"
                  >
                    Load More Movies
                  </button>
                )}

                {!hasNextPage && movies.length > 0 && (
                  <p className="text-slate-500 text-sm">
                    You&apos;ve reached the end. Showing all {movies.length} movies.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
