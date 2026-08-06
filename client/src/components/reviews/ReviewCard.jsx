import { useState, useEffect } from 'react';
import { ThumbsUp, Flag, Trash2, MessageCircle, Pencil, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToggleLike, useDeleteReview, useFlagReview, useUpdateReview } from '../../hooks/useReviews.js';
import { formatRelativeTime } from '../../utils/formatDate.js';
import { getRatingBgColor } from '../../utils/ratingHelper.js';
import StarRating from '../movies/StarRating.jsx';
import CommentThread from './CommentThread.jsx';
import CommentForm from './CommentForm.jsx';
import { useComments } from '../../hooks/useComments.js';

export default function ReviewCard({ review }) {
  const { user, isAdmin } = useAuth();
  const toggleLike = useToggleLike();
  const deleteReview = useDeleteReview();
  const flagReview = useFlagReview();
  const updateReview = useUpdateReview();

  const { _id, rating, comment, user: reviewer, likes, isFlagged, createdAt, commentCount = 0 } = review;
  const isOwner = user?._id === reviewer?._id;
  const isLiked = likes?.some?.((id) => id?.toString?.() === user?._id?.toString?.());

  const targetHash = typeof window !== 'undefined' ? window.location.hash : '';
  const isCommentTarget = targetHash.startsWith('#comment-');
  const isReviewTarget = targetHash === `#review-${_id}`;

  const [showComments, setShowComments] = useState(isCommentTarget);
  const { data: comments, isLoading: isLoadingComments } = useComments(showComments ? _id : null);

  // When a notification-nav CustomEvent fires (same-page click, no hash change),
  // expand this review's comments if the target is a comment within it.
  // We can't know which review the comment belongs to from the event alone,
  // so we expand ALL cards when a comment-type target fires — the scroll will
  // land on the correct one once it's in the DOM.
  useEffect(() => {
    const handler = (e) => {
      const tid = e.detail?.targetId;
      if (tid && tid.startsWith('comment-')) {
        setShowComments(true);
      }
    };
    window.addEventListener('notification-nav', handler);
    return () => window.removeEventListener('notification-nav', handler);
  }, []);

  // Edit review state
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(rating);
  const [editComment, setEditComment] = useState(comment);

  const handleSaveReview = () => {
    if (!editRating || !editComment.trim()) return;
    updateReview.mutate(
      { id: _id, data: { rating: editRating, comment: editComment.trim() } },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleCancelEdit = () => {
    setEditRating(rating);
    setEditComment(comment);
    setIsEditing(false);
  };

  return (
    <div id={`review-${_id}`} className={`card p-5 animate-slide-up transition-all duration-500 ${isFlagged ? 'border-red-500/20' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to={`/users/${reviewer?._id}`} className="hover:opacity-80 transition-opacity">
            {reviewer?.avatar?.url ? (
              <img src={reviewer.avatar.url} alt={reviewer.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/20" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                {reviewer?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <Link to={`/users/${reviewer?._id}`} className="hover:text-primary-400 transition-colors">
              <p className="font-semibold text-white text-sm">{reviewer?.name}</p>
            </Link>
            <p className="text-xs text-slate-500">{formatRelativeTime(createdAt)}</p>
          </div>
        </div>

        {!isEditing && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-bold ${getRatingBgColor(rating)}`}>
            {rating}/10
          </div>
        )}
      </div>

      {/* Stars */}
      <div className="mt-3">
        {isEditing ? (
          <StarRating rating={editRating} onRate={setEditRating} size="sm" />
        ) : (
          <StarRating rating={rating} readonly size="sm" />
        )}
      </div>

      {/* Comment / Edit textarea */}
      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            className="textarea resize-none"
            rows={4}
            maxLength={1000}
            placeholder="Write your review..."
          />
          <p className="text-xs text-slate-500 mt-1 text-right">{editComment.length}/1000</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSaveReview}
              disabled={!editRating || !editComment.trim() || updateReview.isPending}
              className="btn-primary flex items-center gap-1.5 text-sm py-1.5 px-4"
            >
              <Check className="w-3.5 h-3.5" />
              {updateReview.isPending ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleCancelEdit} className="btn-ghost text-sm py-1.5 px-3">
              <X className="w-3.5 h-3.5 mr-1.5 inline" />Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-slate-300 text-sm leading-relaxed">{comment}</p>
      )}

      {/* Actions */}
      {!isEditing && (
        <div className="mt-4 flex items-center gap-3 pt-3 border-t border-white/5">
          <button
            id={`like-btn-${_id}`}
            onClick={() => toggleLike.mutate(_id)}
            disabled={!user}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
              isLiked
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 border border-transparent'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            {likes?.length || 0} {likes?.length === 1 ? 'Like' : 'Likes'}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
              showComments
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent'
            }`}
          >
            <MessageCircle className={`w-3.5 h-3.5 ${showComments ? 'fill-current' : ''}`} />
            {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
          </button>

          {isFlagged && (
            <span className="badge-danger text-xs">Flagged</span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {isAdmin && (
              <button
                id={`flag-btn-${_id}`}
                onClick={() => flagReview.mutate(_id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                title={isFlagged ? 'Unflag' : 'Flag review'}
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}

            {isOwner && (
              <button
                id={`edit-review-btn-${_id}`}
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                title="Edit review"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            {(isOwner || isAdmin) && (
              <button
                id={`delete-review-btn-${_id}`}
                onClick={() => {
                  if (confirm('Delete this review?')) deleteReview.mutate(_id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete review"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && !isEditing && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
          <h4 className="text-sm font-semibold text-white mb-4">Comments ({commentCount})</h4>

          {user && <CommentForm reviewId={_id} />}

          <div className="mt-6 space-y-4">
            {isLoadingComments ? (
              <div className="text-center py-4 text-slate-500 text-sm">Loading comments...</div>
            ) : comments?.length > 0 ? (
              comments.map((c) => (
                <CommentThread key={c._id} comment={c} reviewId={_id} />
              ))
            ) : (
              <p className="text-center py-4 text-slate-500 text-sm">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
