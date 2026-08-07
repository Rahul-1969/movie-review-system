import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Globe, User, Star, Heart, Play, ArrowLeft, ListPlus, Check, Plus } from 'lucide-react';
import { useMovie, useToggleWatchlist } from '../hooks/useMovies.js';
import { useAuth } from '../hooks/useAuth.js';
import { usersApi } from '../api/users.api.js';
import { MovieDetailHeroSkeleton } from '../components/common/Skeleton.jsx';
import ReviewForm from '../components/reviews/ReviewForm.jsx';
import ReviewList from '../components/reviews/ReviewList.jsx';
import StarRating from '../components/movies/StarRating.jsx';
import { getRatingBgColor } from '../utils/ratingHelper.js';
import { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useMyLists, useAddToList, useRemoveFromList } from '../hooks/useLists.js';
import PageTransition from '../components/common/PageTransition.jsx';

export default function MovieDetail() {
  const { id } = useParams();
  // isTyping: true while the user has focus inside a review/comment input;
  // used to pause the 60s background refetch so a mid-typing refetch doesn't
  // cause any jarring UI jump (React Query won't reset local form state, but
  // pausing is a clean UX courtesy).
  const [isTyping, setIsTyping] = useState(false);
  const { data, isLoading, refetch } = useMovie(id, isTyping);
  const { user, isAuthenticated } = useAuth();
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const toggleWatchlist = useToggleWatchlist();
  const { data: myListsData } = useMyLists();
  const addToList = useAddToList();
  const removeFromList = useRemoveFromList();
  const [listDropdownOpen, setListDropdownOpen] = useState(false);
  const listDropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (listDropdownRef.current && !listDropdownRef.current.contains(e.target)) {
        setListDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  
  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => usersApi.getWatchlist().then((r) => r.data),
    enabled: isAuthenticated
  });

  // ── BUG 1 FIX: poll for element existence instead of a fixed delay ────────
  // Polls every 100ms for up to 2000ms, then scrolls+highlights once found.
  // Returns a cleanup function that cancels the interval.
  const scrollToTarget = useCallback((targetId) => {
    let elapsed = 0;
    const INTERVAL = 100;
    const MAX_WAIT = 2000;
    const interval = setInterval(() => {
      const el = document.getElementById(targetId);
      if (el) {
        clearInterval(interval);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2', 'ring-offset-dark-950');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2', 'ring-offset-dark-950');
        }, 2500);
      } else {
        elapsed += INTERVAL;
        if (elapsed >= MAX_WAIT) clearInterval(interval);
      }
    }, INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // ── BUG 2 FIX: guard with a ref so the hash-scroll only fires once per   ──
  // page load. Without this guard, every data re-render (e.g. after posting  
  // a comment causes query invalidation) would re-fire this effect with the  
  // same window.location.hash still present, re-applying the highlight ring  
  // to the already-scrolled element.
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    if (!isLoading && data?.data && !hasScrolledRef.current) {
      const hash = window.location.hash;
      if (!hash) return;
      hasScrolledRef.current = true;
      const cleanup = scrollToTarget(hash.slice(1));
      return cleanup;
    }
  }, [isLoading, data, scrollToTarget]);

  // Triggered by NotificationBell via CustomEvent so repeat-clicks on the
  // same notification always replay the scroll+highlight, hash or not.
  // scrollToTarget now polls internally — no need to pass a delay hint.
  useEffect(() => {
    const handler = (e) => {
      const tid = e.detail?.targetId;
      if (!tid) return;
      scrollToTarget(tid);
    };
    window.addEventListener('notification-nav', handler);
    return () => window.removeEventListener('notification-nav', handler);
  }, [scrollToTarget]);

  if (isLoading) return <PageTransition><MovieDetailHeroSkeleton /></PageTransition>;
  if (!data?.data) return (
    <PageTransition>
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-slate-400 text-xl">Movie not found</p>
        <Link to="/" className="btn-primary mt-4">← Browse Movies</Link>
      </div>
    </PageTransition>
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
    <PageTransition>
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

                {/* Add to List */}
                {isAuthenticated && (
                  <div className="relative" ref={listDropdownRef}>
                    <button
                      onClick={() => setListDropdownOpen((o) => !o)}
                      className="btn-ghost flex items-center gap-2"
                    >
                      <ListPlus className="w-4 h-4" /> Add to List
                    </button>
                    {listDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-60 glass rounded-xl shadow-xl shadow-black/20 z-[100] overflow-hidden animate-fade-in">
                        {(myListsData?.data ?? []).length === 0 ? (
                          <div className="p-4 text-center">
                            <p className="text-sm text-slate-400 mb-3">No lists yet</p>
                            <Link to="/my-lists" onClick={() => setListDropdownOpen(false)} className="btn-primary text-xs py-1.5 px-3">
                              <Plus className="w-3 h-3 inline mr-1" />Create a List
                            </Link>
                          </div>
                        ) : (
                          <ul className="py-1.5">
                            {(myListsData?.data ?? []).map((list) => {
                              const inList = (list.movies ?? []).some((m) => (m._id || m) === id);
                              return (
                                <li key={list._id}>
                                  <button
                                    onClick={() => {
                                      if (inList) {
                                        removeFromList.mutate({ listId: list._id, movieId: id });
                                      } else {
                                        addToList.mutate({ listId: list._id, movieId: id });
                                      }
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                                  >
                                    <Check className={`w-4 h-4 shrink-0 ${inList ? 'text-primary-400' : 'text-transparent'}`} />
                                    <span className="truncate text-slate-200">{list.name}</span>
                                    <span className="text-xs text-slate-500 ml-auto shrink-0">{list.movies?.length ?? 0}</span>
                                  </button>
                                </li>
                              );
                            })}
                            <div className="h-px bg-white/5 my-1" />
                            <li>
                              <Link to="/my-lists" onClick={() => setListDropdownOpen(false)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-primary-400 hover:bg-white/5 transition-colors">
                                <Plus className="w-3.5 h-3.5" /> New list
                              </Link>
                            </li>
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
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
          // onFocus/onBlur propagate from all child inputs/textareas via
          // event bubbling, pausing the 60s movie refetch while user is typing.
          <div onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)}>
            <ReviewForm movieId={id} onSuccess={refetch} />
          </div>
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

        {/* onFocus/onBlur bubble up from any comment textarea within ReviewList */}
        <div onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)}>
          <ReviewList reviews={reviews ?? []} />
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
