'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Flag,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Loader2,
  Film,
} from 'lucide-react';
import { adminApi } from '../../../lib/api/admin.api';
import { reviewsApi } from '../../../lib/api/reviews.api';
import { formatRelativeTime } from '../../../lib/utils/formatDate';
import { getRatingBgColor } from '../../../lib/utils/ratingHelper';
import { Review, User, Movie } from '../../../types';

export default function ManageReviewsPage() {
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['flagged-reviews', page],
    queryFn: async () => {
      const res = await adminApi.getFlaggedReviews({ page, limit: 10 });
      return res.data;
    },
  });

  const unflagMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.flag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setFeedback({ type: 'success', message: 'Review unflagged successfully.' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({
        type: 'error',
        message: axiosErr.response?.data?.message || 'Failed to unflag review.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flagged-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setFeedback({ type: 'success', message: 'Review deleted successfully.' });
      setReviewToDelete(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({
        type: 'error',
        message: axiosErr.response?.data?.message || 'Failed to delete review.',
      });
      setReviewToDelete(null);
    },
  });

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Flagged Reviews</h1>
          <p className="text-slate-400 mt-1">
            {pagination?.total ?? 0} flagged review{pagination?.total === 1 ? '' : 's'} requiring moderation
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading flagged reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="card p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">No Flagged Reviews</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
              All clear! There are currently no community reviews flagged for moderation.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const reviewId = r._id || r.id || '';
            const isUnflagging = unflagMutation.isPending && unflagMutation.variables === reviewId;
            const reviewer = typeof r.user === 'object' && r.user !== null ? (r.user as User) : null;
            const reviewerName = reviewer?.name || (typeof r.user === 'string' ? r.user : 'Anonymous User');
            const reviewerEmail = reviewer?.email || '';
            const reviewerAvatar = reviewer?.avatar?.url;
            const movie = typeof r.movie === 'object' && r.movie !== null ? (r.movie as Movie) : null;
            const movieTitle = movie?.title || (typeof r.movie === 'string' ? r.movie : null);
            const movieId = movie?._id || movie?.id;

            return (
              <div
                key={reviewId}
                className="card p-5 border-red-500/20 bg-dark-900/60 hover:border-red-500/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {reviewerAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={reviewerAvatar}
                        alt={reviewerName}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {reviewerName[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white text-sm">{reviewerName}</p>
                      <p className="text-xs text-slate-500">
                        {reviewerEmail ? `${reviewerEmail} · ` : ''}
                        {formatRelativeTime(r.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`badge border text-xs font-bold ${getRatingBgColor(r.rating)}`}
                    >
                      {r.rating}/10
                    </span>
                    <span className="badge badge-danger text-xs flex items-center gap-1">
                      <Flag className="w-3 h-3" /> Flagged
                    </span>
                  </div>
                </div>

                {movieTitle && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Film className="w-3.5 h-3.5 text-primary-400" />
                    <span>Movie:</span>
                    {movieId ? (
                      <Link
                        href={`/movies/${movieId}`}
                        className="text-primary-400 hover:text-primary-300 transition-colors underline-offset-2 hover:underline"
                      >
                        {movieTitle}
                      </Link>
                    ) : (
                      <span className="text-slate-300">{movieTitle}</span>
                    )}
                  </div>
                )}

                <p className="text-slate-300 text-sm leading-relaxed bg-dark-800/50 p-3.5 rounded-xl border border-white/5">
                  {r.comment}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    id={`unflag-review-${reviewId}`}
                    onClick={() => unflagMutation.mutate(reviewId)}
                    disabled={isUnflagging}
                    className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10 px-3.5 py-1.5 rounded-lg border border-amber-500/20 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUnflagging ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Flag className="w-3.5 h-3.5" />
                    )}
                    <span>Unflag</span>
                  </button>
                  <button
                    id={`delete-review-${reviewId}`}
                    onClick={() => setReviewToDelete(r)}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 px-3.5 py-1.5 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-ghost disabled:opacity-40 cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-400 text-sm">
            Page {page} of {pagination.pages}
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-ghost disabled:opacity-40 cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md glass p-6 rounded-2xl border border-red-500/20 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">Delete Review</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 bg-dark-800/70 p-3 rounded-xl border border-white/5 line-clamp-3 italic">
              &quot;{reviewToDelete.comment}&quot;
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                disabled={deleteMutation.isPending}
                className="btn-ghost flex-1 text-sm py-2 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-review-btn"
                onClick={() => {
                  const id = reviewToDelete._id || reviewToDelete.id || '';
                  deleteMutation.mutate(id);
                }}
                disabled={deleteMutation.isPending}
                className="btn-danger flex-1 text-sm py-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{deleteMutation.isPending ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
