import { useState } from 'react';
import { Star, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMyReviews, useDeleteReview, useUpdateReview } from '../hooks/useReviews.js';
import { PageLoader } from '../components/common/Loader.jsx';
import { formatRelativeTime } from '../utils/formatDate.js';
import { getRatingBgColor } from '../utils/ratingHelper.js';
import StarRating from '../components/movies/StarRating.jsx';
import { Link } from 'react-router-dom';

export default function MyReviews() {
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 0, comment: '' });

  const { data, isLoading } = useMyReviews({ page, limit: 10 });
  const deleteReview = useDeleteReview();
  const updateReview = useUpdateReview();

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  if (isLoading) return <PageLoader />;

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditForm({ rating: review.rating, comment: review.comment });
  };

  const handleUpdate = async (id) => {
    await updateReview.mutateAsync({ id, data: editForm });
    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">My Reviews</h1>
        <p className="text-slate-400 mt-1">{pagination?.total || 0} reviews written</p>
      </div>

      {reviews.length === 0 ? (
        <div className="card p-16 text-center">
          <Star className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">No reviews yet</p>
          <p className="text-slate-500 text-sm mt-1">Start reviewing movies you've watched!</p>
          <Link to="/" className="btn-primary mt-6 inline-block">Browse Movies</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="card p-5 space-y-3">
              {/* Movie info */}
              <div className="flex items-center gap-3">
                {review.movie?.poster?.url && (
                  <img src={review.movie.poster.url} alt={review.movie.title}
                    className="w-10 h-14 rounded object-cover" />
                )}
                <div className="flex-1">
                  <Link to={`/movies/${review.movie?._id}`}
                    className="font-semibold text-white hover:text-primary-400 transition-colors">
                    {review.movie?.title}
                  </Link>
                  <p className="text-xs text-slate-500">{formatRelativeTime(review.createdAt)}</p>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-sm font-bold ${getRatingBgColor(review.rating)}`}>
                  <Star className="w-3 h-3 fill-current" />
                  {review.rating}/10
                </div>
              </div>

              {editingId === review._id ? (
                <div className="space-y-3 p-4 rounded-xl bg-dark-800/50 border border-white/5">
                  <StarRating rating={editForm.rating} onRate={(r) => setEditForm((f) => ({ ...f, rating: r }))} />
                  <textarea
                    value={editForm.comment}
                    onChange={(e) => setEditForm((f) => ({ ...f, comment: e.target.value }))}
                    rows={3}
                    className="input resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(review._id)}
                      disabled={updateReview.isPending}
                      className="btn-primary text-sm py-2">
                      {updateReview.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost text-sm py-2">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-300 text-sm">{review.comment}</p>
              )}

              {editingId !== review._id && (
                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button onClick={() => startEdit(review)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 px-3 py-1.5 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => {
                    if (confirm('Delete this review?')) deleteReview.mutate(review._id);
                  }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {pagination?.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-slate-400 text-sm">Page {page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-ghost disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
