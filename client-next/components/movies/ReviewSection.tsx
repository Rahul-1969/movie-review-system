'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User as UserIcon,
  Star,
  ThumbsUp,
  Trash2,
  MessageCircle,
  Send,
  AlertCircle,
  CheckCircle,
  Edit3,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Review, Comment, User } from '../../types';
import { reviewsApi } from '../../lib/api/reviews.api';
import { commentsApi } from '../../lib/api/comments.api';
import StarRating from './StarRating';

interface ReviewSectionProps {
  reviews: Review[];
  movieId: string;
}

export default function ReviewSection({ reviews, movieId }: ReviewSectionProps) {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [reviewList, setReviewList] = useState<Review[]>(reviews);
  const [prevReviews, setPrevReviews] = useState<Review[]>(reviews);
  if (reviews !== prevReviews) {
    setPrevReviews(reviews);
    setReviewList(reviews);
  }

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Determine if current authenticated user has already reviewed
  const hasReviewed = reviewList.some((r) => {
    const userObj = typeof r.user === 'object' && r.user !== null ? (r.user as User) : null;
    const reviewerId = userObj ? (userObj._id || userObj.id) : r.user;
    return reviewerId && user?._id && reviewerId.toString() === user._id.toString();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isAuthenticated) {
      setError('Please sign in to write a review.');
      return;
    }

    if (rating < 1 || rating > 10) {
      setError('Please select a rating between 1 and 10.');
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 10) {
      setError('Review comment must be at least 10 characters.');
      return;
    }

    if (trimmedComment.length > 1000) {
      setError('Review comment cannot exceed 1000 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewsApi.create({
        movieId,
        rating,
        comment: trimmedComment,
      });

      if (res.data?.success && res.data?.data) {
        const newReview = res.data.data;
        // Prepend review so user sees it right away
        setReviewList((prev) => [newReview, ...prev.filter((r) => r._id !== newReview._id)]);
        setComment('');
        setRating(0);
        setSuccess('Your review has been submitted successfully!');
      } else {
        setError(res.data?.message || 'Failed to submit review.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Array<{ message?: string }> } } };
      const errorMsg =
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.errors?.[0]?.message ||
        'Failed to submit review. Please try again.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await reviewsApi.delete(reviewId);
      if (res.status === 200 || res.data?.success) {
        setReviewList((prev) => prev.filter((r) => r._id !== reviewId));
        setSuccess('Review deleted successfully.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleUpdateReviewInList = (updated: Review) => {
    setReviewList((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  return (
    <div className="space-y-8">
      {/* ── Submit Review Form ──────────────────────────────────────────────── */}
      {isAuthenticated && !hasReviewed && (
        <div className="card p-6 border border-white/10 shadow-xl">
          <h3 className="font-display font-semibold text-white text-lg mb-4">Write a Review</h3>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">
                Your Rating <span className="text-slate-500 font-normal">(1–10 stars)</span>
              </label>
              <StarRating rating={rating} onRate={setRating} size="md" />
              {rating === 0 && (
                <p className="text-xs text-slate-500 mt-1">Select a star rating</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="review-comment-input" className="label mb-0">
                  Your Review <span className="text-slate-500 font-normal">(10–1000 characters)</span>
                </label>
                <span className={`text-xs ${comment.trim().length > 0 && comment.trim().length < 10 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {comment.length}/1000
                </span>
              </div>
              <textarea
                id="review-comment-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think of the movie? Share your thoughts with the community..."
                rows={4}
                maxLength={1000}
                required
                className="textarea resize-none"
              />
              {comment.length > 0 && comment.trim().length < 10 && (
                <p className="text-xs text-amber-400 mt-1">
                  At least 10 characters required ({10 - comment.trim().length} more needed)
                </p>
              )}
            </div>

            <button
              type="submit"
              id="submit-review-button"
              disabled={submitting || rating === 0 || comment.trim().length < 10 || comment.length > 1000}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Submitting Review...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {isAuthenticated && hasReviewed && (
        <div className="card p-4 text-center text-slate-400 text-sm border border-emerald-500/20 bg-emerald-500/5">
          ✅ You&apos;ve already reviewed this movie. You can edit or delete your review below.
        </div>
      )}

      {!isAuthenticated && (
        <div className="card p-5 text-center text-slate-400 text-sm">
          <Link href="/login" className="text-primary-400 font-medium hover:underline">
            Sign in
          </Link>{' '}
          to write a review for this movie.
        </div>
      )}

      {/* ── Reviews List ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-semibold text-white">
            Reviews <span className="text-slate-500 text-lg font-normal">({reviewList.length})</span>
          </h2>
        </div>

        {reviewList.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 text-sm">
            No reviews yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-4">
            {reviewList.map((review) => (
              <ReviewCardItem
                key={review._id}
                review={review}
                currentUser={user}
                isAdmin={isAdmin}
                onDelete={handleDeleteReview}
                onUpdate={handleUpdateReviewInList}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Single Review Card Component ─────────────────────────────────────────────
interface ReviewCardItemProps {
  review: Review;
  currentUser: User | null;
  isAdmin: boolean;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (updated: Review) => void;
}

function ReviewCardItem({ review, currentUser, isAdmin, onDelete, onUpdate }: ReviewCardItemProps) {
  const userObj = typeof review.user === 'object' && review.user !== null ? (review.user as User) : null;
  const reviewerId = userObj ? (userObj._id || userObj.id) : review.user;
  const reviewerName = userObj?.name || 'User';
  const reviewerAvatar = userObj?.avatar?.url || (typeof userObj?.avatar === 'string' ? userObj.avatar : null);

  const isOwner = currentUser?._id && reviewerId && currentUser._id.toString() === reviewerId.toString();
  const canDelete = isOwner || isAdmin;

  // Like state
  const initialLikes = review.likes || [];
  const [likesCount, setLikesCount] = useState<number>(initialLikes.length);
  const [isLiked, setIsLiked] = useState<boolean>(() => {
    if (!currentUser?._id) return false;
    return initialLikes.some((id) => {
      const likeId = typeof id === 'object' && id !== null ? (id as { _id?: string; id?: string })._id || (id as { _id?: string; id?: string }).id : id;
      return likeId?.toString() === currentUser._id.toString();
    });
  });
  const [likePending, setLikePending] = useState<boolean>(false);

  // Edit review state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editRating, setEditRating] = useState<number>(review.rating);
  const [editComment, setEditComment] = useState<string>(review.comment);
  const [savePending, setSavePending] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Comments state
  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState<number>(review.commentCount || 0);

  const handleToggleLike = async () => {
    if (!currentUser) return;
    if (likePending) return;

    setLikePending(true);
    // Optimistic toggle
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await reviewsApi.toggleLike(review._id);
      if (res.data?.data) {
        setIsLiked(res.data.data.liked);
        setLikesCount(res.data.data.likesCount);
      }
    } catch {
      // Revert on error
      setIsLiked(!nextLiked);
      setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setLikePending(false);
    }
  };

  const handleSaveEdit = async () => {
    setEditError(null);
    if (editRating < 1 || editRating > 10) {
      setEditError('Rating must be between 1 and 10.');
      return;
    }
    const trimmed = editComment.trim();
    if (trimmed.length < 10) {
      setEditError('Review must be at least 10 characters.');
      return;
    }
    if (trimmed.length > 1000) {
      setEditError('Review cannot exceed 1000 characters.');
      return;
    }

    setSavePending(true);
    try {
      const res = await reviewsApi.update(review._id, {
        rating: editRating,
        comment: trimmed,
      });
      if (res.data?.success && res.data?.data) {
        onUpdate({
          ...review,
          rating: editRating,
          comment: trimmed,
        });
        setIsEditing(false);
      } else {
        setEditError(res.data?.message || 'Failed to update review.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setEditError(axiosErr.response?.data?.message || 'Failed to update review.');
    } finally {
      setSavePending(false);
    }
  };

  const handleToggleComments = async () => {
    const nextShow = !showComments;
    setShowComments(nextShow);

    if (nextShow && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await commentsApi.getByReviewId(review._id);
        if (res.data?.data) {
          setComments(res.data.data);
          setCommentCount(res.data.data.length);
        }
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);
    const trimmed = newCommentText.trim();
    if (!trimmed) return;

    setCommentSubmitting(true);
    try {
      const res = await commentsApi.create({
        reviewId: review._id,
        text: trimmed,
      });
      if (res.data?.data) {
        setComments((prev) => [...prev, res.data.data]);
        setNewCommentText('');
        setCommentCount((prev) => prev + 1);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setCommentError(axiosErr.response?.data?.message || 'Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setCommentCount((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Failed to delete comment.');
    }
  };

  return (
    <div className="card p-5 space-y-4 animate-fade-in transition-all">
      {/* ── Review Header ───────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          {reviewerId ? (
            <Link href={`/users/${reviewerId}`} className="shrink-0 hover:opacity-85 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-dark-800 overflow-hidden ring-2 ring-primary-500/20 flex items-center justify-center">
                {reviewerAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={reviewerAvatar} alt={reviewerName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    {reviewerName?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5 text-slate-300" />}
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-full bg-dark-800 overflow-hidden ring-2 ring-primary-500/20 flex items-center justify-center shrink-0">
              {reviewerAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={reviewerAvatar} alt={reviewerName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                  {reviewerName?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5 text-slate-300" />}
                </div>
              )}
            </div>
          )}
          <div>
            {reviewerId ? (
              <Link href={`/users/${reviewerId}`} className="hover:text-primary-400 transition-colors">
                <p className="text-sm font-medium text-white">{reviewerName}</p>
              </Link>
            ) : (
              <p className="text-sm font-medium text-white">{reviewerName}</p>
            )}
            <p className="text-xs text-slate-500">
              {new Date(review.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 bg-dark-900/60 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
            <Star
              className={`w-3.5 h-3.5 ${review.rating >= 8
                ? 'text-emerald-400 fill-emerald-400'
                : review.rating >= 5
                  ? 'text-primary-400 fill-primary-400'
                  : 'text-red-400 fill-red-400'
                }`}
            />
            <span className="text-sm font-bold text-white">{review.rating}</span>
            <span className="text-xs text-slate-400">/10</span>
          </div>
        )}
      </div>

      {/* ── Review Body / Edit Form ─────────────────────────────────────────── */}
      {isEditing ? (
        <div className="space-y-3 pt-2">
          {editError && (
            <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {editError}
            </p>
          )}
          <div>
            <label className="label text-xs">Rating</label>
            <StarRating rating={editRating} onRate={setEditRating} size="sm" />
          </div>
          <div>
            <label className="label text-xs">Comment</label>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              className="textarea text-sm resize-none"
              rows={3}
              maxLength={1000}
            />
            <p className="text-xs text-slate-500 text-right mt-1">{editComment.length}/1000</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={savePending || !editRating || editComment.trim().length < 10}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              {savePending ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setEditRating(review.rating);
                setEditComment(review.comment);
                setIsEditing(false);
              }}
              className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{review.comment}</p>
      )}

      {/* ── Action Bar ──────────────────────────────────────────────────────── */}
      {!isEditing && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            {/* Like Button */}
            <button
              onClick={handleToggleLike}
              disabled={!currentUser}
              title={!currentUser ? 'Sign in to like reviews' : 'Like review'}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${isLiked
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span>
                {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
              </span>
            </button>

            {/* Comment Thread Toggle */}
            <button
              onClick={handleToggleComments}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${showComments
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <MessageCircle className={`w-3.5 h-3.5 ${showComments ? 'fill-current' : ''}`} />
              <span>
                {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-slate-400 hover:text-primary-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1"
                title="Edit review"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => onDelete(review._id)}
                className="text-xs text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1"
                title="Delete review"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Comments Dropdown Section ────────────────────────────────────────── */}
      {showComments && !isEditing && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Comments ({commentCount})
          </h4>

          {loadingComments ? (
            <p className="text-xs text-slate-500 py-2">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">No comments yet.</p>
          ) : (
            <div className="space-y-2.5">
              {comments.map((c) => {
                const commentUser = typeof c.user === 'object' && c.user !== null ? (c.user as User) : null;
                const commentUserId = commentUser ? (commentUser._id || commentUser.id) : (typeof c.user === 'string' ? c.user : null);
                const commentAuthorName = commentUser?.name || 'User';
                const commentAuthorAvatar = commentUser?.avatar?.url || (typeof commentUser?.avatar === 'string' ? commentUser.avatar : null);
                const isCommentAuthor = currentUser?._id && commentUser?._id && currentUser._id.toString() === commentUser._id.toString();

                return (
                  <div key={c._id} className="flex gap-2.5 bg-dark-900/40 p-2.5 rounded-xl border border-white/5">
                    {commentUserId ? (
                      <Link href={`/users/${commentUserId}`} className="shrink-0 hover:opacity-85 transition-opacity">
                        <div className="w-7 h-7 rounded-full bg-dark-800 overflow-hidden ring-1 ring-white/10 flex items-center justify-center">
                          {commentAuthorAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={commentAuthorAvatar} alt={commentAuthorName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-slate-700">
                              {commentAuthorName[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-dark-800 overflow-hidden ring-1 ring-white/10 shrink-0">
                        {commentAuthorAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={commentAuthorAvatar} alt={commentAuthorName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-slate-700">
                            {commentAuthorName[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        {commentUserId ? (
                          <Link href={`/users/${commentUserId}`} className="hover:text-primary-400 transition-colors">
                            <span className="text-xs font-medium text-white">{commentAuthorName}</span>
                          </Link>
                        ) : (
                          <span className="text-xs font-medium text-white">{commentAuthorName}</span>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                          {(isCommentAuthor || isAdmin) && (
                            <button
                              onClick={() => handleDeleteComment(c._id)}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 whitespace-pre-line">{c.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Comment Form */}
          {currentUser ? (
            <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="input py-1.5 px-3 text-xs flex-1"
                maxLength={500}
                required
              />
              <button
                type="submit"
                disabled={commentSubmitting || !newCommentText.trim()}
                className="btn-primary py-1.5 px-3 text-xs shrink-0 flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>{commentSubmitting ? 'Posting...' : 'Post'}</span>
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500">
              <Link href="/login" className="text-primary-400 hover:underline">
                Sign in
              </Link>{' '}
              to join the discussion.
            </p>
          )}

          {commentError && (
            <p className="text-xs text-red-400 mt-1">{commentError}</p>
          )}
        </div>
      )}
    </div>
  );
}
