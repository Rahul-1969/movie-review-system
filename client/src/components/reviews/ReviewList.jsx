import ReviewCard from './ReviewCard.jsx';
import { MessageSquare } from 'lucide-react';

export default function ReviewList({ reviews }) {
  if (!reviews?.length) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-medium">No reviews yet</p>
        <p className="text-slate-500 text-sm mt-1">Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-white text-lg">
        {reviews.length} Review{reviews.length !== 1 ? 's' : ''}
      </h3>
      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    </div>
  );
}
