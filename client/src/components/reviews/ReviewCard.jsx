import { ThumbsUp, Flag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToggleLike, useDeleteReview, useFlagReview } from '../../hooks/useReviews.js';
import { formatRelativeTime } from '../../utils/formatDate.js';
import { getRatingBgColor } from '../../utils/ratingHelper.js';
import StarRating from '../movies/StarRating.jsx';

export default function ReviewCard({ review }) {
  const { user, isAdmin } = useAuth();
  const toggleLike = useToggleLike();
  const deleteReview = useDeleteReview();
  const flagReview = useFlagReview();

  const { _id, rating, comment, user: reviewer, likes, isFlagged, createdAt } = review;
  const isOwner = user?._id === reviewer?._id;
  const isLiked = likes?.includes(user?._id);

  return (
    <div className={`card p-5 animate-slide-up ${isFlagged ? 'border-red-500/20' : ''}`}>
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

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-bold ${getRatingBgColor(rating)}`}>
          {rating}/10
        </div>
      </div>

      {/* Stars */}
      <div className="mt-3">
        <StarRating rating={rating} readonly size="sm" />
      </div>

      {/* Comment */}
      <p className="mt-3 text-slate-300 text-sm leading-relaxed">{comment}</p>

      {/* Actions */}
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
    </div>
  );
}
