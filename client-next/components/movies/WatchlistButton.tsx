'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../lib/api/users.api';

interface WatchlistButtonProps {
  movieId: string;
}

export default function WatchlistButton({ movieId }: WatchlistButtonProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [initialising, setInitialising] = useState(true);
  const [pending, setPending] = useState(false);

  // ── Fetch initial watchlist state once auth is resolved ───────────────────
  useEffect(() => {
    if (authLoading || !isAuthenticated || !movieId) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await usersApi.getWatchlist();
        if (cancelled) return;
        const movies = Array.isArray(res.data?.data) ? res.data.data : [];
        const isAdded = movies.some((m: unknown) => {
          if (!m) return false;
          if (typeof m === 'string') return m === movieId;
          const movieObj = m as { _id?: string; id?: string };
          return movieObj?._id === movieId || movieObj?.id === movieId;
        });
        setIsInWatchlist(isAdded);
      } catch {
        // silently ignore — button will default to "not in watchlist"
      } finally {
        if (!cancelled) setInitialising(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, movieId]);

  // ── Don't render for unauthenticated or auth-loading users or missing movieId
  if (!movieId || authLoading || !isAuthenticated) return null;

  // ── Show a subtle spinner while the initial check is running ─────────────
  if (initialising) {
    return (
      <button
        disabled
        className="btn-ghost flex items-center gap-2 opacity-50 cursor-not-allowed"
        aria-label="Loading watchlist status"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Watchlist
      </button>
    );
  }

  // ── Toggle handler ────────────────────────────────────────────────────────
  const handleToggle = async () => {
    if (pending || !movieId) return;
    setPending(true);
    try {
      const res = await usersApi.toggleWatchlist(movieId);
      const resData = res.data?.data;
      if (typeof resData?.inWatchlist === 'boolean') {
        setIsInWatchlist(resData.inWatchlist);
      } else if (resData?.user?.watchlist && Array.isArray(resData.user.watchlist)) {
        const watchlist: string[] = resData.user.watchlist
          .filter(Boolean)
          .map((m: unknown) => {
            if (typeof m === 'string') return m;
            const obj = m as { _id?: string; id?: string };
            return obj?._id || obj?.id || '';
          })
          .filter(Boolean);
        setIsInWatchlist(watchlist.includes(movieId));
      } else {
        // Fallback: optimistic toggle if neither is available
        setIsInWatchlist((prev) => !prev);
      }
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    } catch {
      // Silently fail — no toast dependency in client-next
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      id="watchlist-btn"
      onClick={handleToggle}
      disabled={pending}
      className={`btn-ghost flex items-center gap-2 transition-all ${
        isInWatchlist
          ? 'text-primary-400 bg-primary-500/10 border-primary-500/20'
          : ''
      }`}
      aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
      )}
      {isInWatchlist ? 'In Watchlist' : 'Watchlist'}
    </button>
  );
}
