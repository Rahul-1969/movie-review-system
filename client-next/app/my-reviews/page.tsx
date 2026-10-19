'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reviewsApi } from '../../lib/api/reviews.api';
import StarRating from '../../components/movies/StarRating';
import { formatRelativeTime } from '../../lib/utils/formatDate';
import { getRatingBgColor } from '../../lib/utils/ratingHelper';
import { Review, Movie } from '../../types';

// ── Inline toast-style feedback ────────────────────────────────────────────────
type FeedbackState = { type: 'success' | 'error'; message: string } | null;

function Feedback({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) return null;
  const isSuccess = feedback.type === 'success';
  return (
    <div
      className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm border animate-fade-in ${
        isSuccess
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      <span>{feedback.message}</span>
    </div>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────────────────
function MyReviewSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-14 h-20 rounded-lg shimmer-bg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 shimmer-bg rounded-lg" />
          <div className="h-3 w-24 shimmer-bg rounded-lg" />
        </div>
        <div className="h-8 w-16 shimmer-bg rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full shimmer-bg rounded-lg" />
        <div className="h-3 w-4/5 shimmer-bg rounded-lg" />
        <div className="h-3 w-2/3 shimmer-bg rounded-lg" />
      </div>
      <div className="flex gap-2 pt-2 border-t border-white/5">
        <div className="h-7 w-14 shimmer-bg rounded-lg" />
        <div className="h-7 w-16 shimmer-bg rounded-lg" />
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default function MyReviewsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ rating: number; comment: string }>({
    rating: 0,
    comment: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Review | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch reviews
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-reviews', page],
    queryFn: () => reviewsApi.getMyReviews({ page, limit: 10 }).then((r) => r.data),
    enabled: !loading && isAuthenticated,
  });

  // Mutations
  const updateReview = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rating: number; comment: string } }) =>
      reviewsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      setEditingId(null);
      setEditError(null);
      setFeedback({ type: 'success', message: 'Review updated successfully!' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setEditError(axiosErr.response?.data?.message || 'Failed to update review');
    },
  });

  const deleteReview = useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      setConfirmDelete(null);
      setFeedback({ type: 'success', message: 'Review deleted' });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFeedback({
        type: 'error',
        message: axiosErr.response?.data?.message || 'Failed to delete review',
      });
      setConfirmDelete(null);
    },
  });

  const startEdit = (review: Review) => {
    setEditingId(review._id);
    setEditError(null);
    setEditForm({ rating: review.rating, comment: review.comment });
  };

  const handleUpdate = async (id: string) => {
    if (editForm.rating < 1 || editForm.rating > 10) {
      setEditError('Rating must be between 1 and 10.');
      return;
    }
    const trimmed = editForm.comment.trim();
    if (trimmed.length < 10) {
      setEditError('Review must be at least 10 characters.');
      return;
    }
    if (trimmed.length > 1000) {
      setEditError('Review cannot exceed 1000 characters.');
      return;
    }

    updateReview.mutate({ id, data: { rating: editForm.rating, comment: trimmed } });
  };

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
        <div className="mb-8 space-y-2">
          <div className="h-9 w-40 shimmer-bg rounded-xl" />
          <div className="h-4 w-32 shimmer-bg rounded-lg" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <MyReviewSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Auth redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Error state
  if (isError) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
        <div className="card p-12 text-center max-w-lg mx-auto space-y-4 border border-red-500/20 bg-red-500/5">
          <p className="text-red-400 font-medium">Failed to load your reviews.</p>
          <button onClick={() => refetch()} className="btn-primary text-sm py-2 px-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const reviews = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <Feedback feedback={feedback} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">My Reviews</h1>
        <p className="text-slate-400 mt-1">
          {pagination?.total || 0} review{(pagination?.total || 0) !== 1 ? 's' : ''} written
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="card p-16 text-center max-w-md mx-auto">
          <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">No reviews yet</p>
          <p className="text-slate-500 text-sm mt-1">Start reviewing movies you&apos;ve watched!</p>
          <Link href="/" className="btn-primary mt-6 inline-block">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const movie =
              typeof review.movie === 'object' && review.movie !== null
                ? (review.movie as Movie)
                : null;
            const movieId = movie ? movie._id || movie.id : review.movie;
            const posterUrl = movie?.poster?.url;

            return (
              <div
                key={review._id}
                className="card p-5 space-y-3 hover:border-white/15 transition-all"
              >
                {/* Movie info header */}
                <div className="flex items-center gap-3">
                  {posterUrl ? (
                    <Link href={`/movies/${movieId}`} className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={posterUrl}
                        alt={movie?.title || 'Movie'}
                        className="w-14 h-20 rounded-lg object-cover flex-shrink-0 bg-dark-800 hover:opacity-90 transition-opacity"
                      />
                    </Link>
                  ) : (
                    <Link
                      href={`/movies/${movieId}`}
                      className="w-14 h-20 rounded-lg bg-dark-800 flex items-center justify-center shrink-0 border border-white/5"
                    >
                      <Star className="w-6 h-6 text-slate-600" />
                    </Link>
                  )}

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/movies/${movieId}`}
                      className="font-semibold text-white hover:text-primary-400 transition-colors truncate block text-base"
                    >
                      {movie?.title || 'Untitled Movie'}
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatRelativeTime(review.createdAt)}
                    </p>
                  </div>

                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-sm font-bold shrink-0 ${getRatingBgColor(
                      review.rating
                    )}`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {review.rating}/10
                  </div>
                </div>

                {/* Edit Mode vs Display Mode */}
                {editingId === review._id ? (
                  <div className="space-y-3 p-4 rounded-xl bg-dark-900/60 border border-white/10 animate-fade-in">
                    <div>
                      <label className="label">Your Rating</label>
                      <StarRating
                        rating={editForm.rating}
                        onRate={(r) => setEditForm((f) => ({ ...f, rating: r }))}
                      />
                    </div>

                    <div>
                      <label className="label">Your Review</label>
                      <textarea
                        value={editForm.comment}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, comment: e.target.value }))
                        }
                        rows={3}
                        maxLength={1000}
                        className="textarea resize-none"
                        placeholder="Write your review..."
                      />
                    </div>

                    {editError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{editError}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleUpdate(review._id)}
                        disabled={updateReview.isPending}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        {updateReview.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditError(null);
                        }}
                        className="btn-ghost text-sm py-2 px-4"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {review.comment}
                  </p>
                )}

                {/* Action buttons (when not editing) */}
                {editingId !== review._id && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => startEdit(review)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(review)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                    <Link
                      href={`/movies/${movieId}`}
                      className="ml-auto text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      View Movie &rarr;
                    </Link>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-ghost text-sm py-2 px-3 flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-slate-400 text-sm px-2">
                Page {page} of {pagination.pages}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-ghost text-sm py-2 px-3 flex items-center gap-1 disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center border border-white/10">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Delete Review?</h3>
            <p className="text-sm text-slate-400 mb-6">
              This will permanently delete your review and update the movie&apos;s average rating.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="btn-ghost flex-1 text-sm py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteReview.mutate(confirmDelete._id)}
                disabled={deleteReview.isPending}
                className="flex-1 text-sm px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium transition-all"
              >
                {deleteReview.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
