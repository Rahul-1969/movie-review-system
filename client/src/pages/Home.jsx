import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, TrendingUp, Star } from 'lucide-react';
import { useMovies, useTopRated, useTrending } from '../hooks/useMovies.js';
import MovieGrid from '../components/movies/MovieGrid.jsx';
import MovieFilters from '../components/movies/MovieFilters.jsx';

export default function Home() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  const { data: moviesData, isLoading } = useMovies(filters);
  const { data: topRatedData } = useTopRated();
  const { data: trendingData } = useTrending();

  const movies = moviesData?.data || [];
  const pagination = moviesData?.pagination;
  const topRated = topRatedData?.data || [];
  const trending = trendingData?.data || [];

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-primary-900/20 py-20 px-4">
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
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="hero-search"
              type="text"
              placeholder="Search for a movie..."
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
              className="w-full bg-dark-800/80 backdrop-blur-sm border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm shadow-xl"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

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

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                id="prev-page-btn"
                disabled={pagination.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className="flex items-center gap-1.5 btn-ghost disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      id={`page-btn-${p}`}
                      onClick={() => setFilters((f) => ({ ...f, page: p }))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === p
                          ? 'bg-primary-500 text-white'
                          : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                id="next-page-btn"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="flex items-center gap-1.5 btn-ghost disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {pagination && (
            <p className="text-center text-slate-500 text-sm mt-4">
              Showing {movies.length} of {pagination.total} movies
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
