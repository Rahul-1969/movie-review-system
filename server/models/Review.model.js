import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot exceed 10'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ─── One review per user per movie ────────────────────────────────────────────
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });
reviewSchema.index({ movie: 1, createdAt: -1 });
reviewSchema.index({ isFlagged: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
