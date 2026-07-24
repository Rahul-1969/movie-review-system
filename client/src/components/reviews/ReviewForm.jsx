import { useState } from 'react';
import { Send } from 'lucide-react';
import { useCreateReview } from '../../hooks/useReviews.js';
import StarRating from '../movies/StarRating.jsx';

export default function ReviewForm({ movieId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const createReview = useCreateReview();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;

    await createReview.mutateAsync({ movieId, rating, comment });
    setRating(0);
    setComment('');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <h3 className="font-display font-semibold text-white text-lg">Write a Review</h3>

      {/* Star Rating */}
      <div>
        <label className="label">Your Rating</label>
        <StarRating rating={rating} onRate={setRating} size="md" />
        {rating === 0 && (
          <p className="text-xs text-slate-500 mt-1">Click a star to rate</p>
        )}
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="review-comment" className="label">
          Your Review <span className="text-slate-500 font-normal">(10–1000 characters)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          rows={4}
          maxLength={1000}
          required
          minLength={10}
          className="input resize-none"
        />
        <p className="text-xs text-slate-500 mt-1 text-right">{comment.length}/1000</p>
      </div>

      <button
        type="submit"
        id="submit-review-btn"
        disabled={!rating || comment.length < 10 || createReview.isPending}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {createReview.isPending ? (
          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {createReview.isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
