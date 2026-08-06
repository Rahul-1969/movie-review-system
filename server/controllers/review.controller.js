import mongoose from 'mongoose';
import Review from '../models/Review.model.js';
import Movie from '../models/Movie.model.js';
import { recalculateRating } from '../services/rating.service.js';
import { deleteCache } from '../services/cache.service.js';
import { createNotification } from '../services/notification.service.js';

// ─── POST /api/reviews ────────────────────────────────────────────────────────
export const createReview = async (req, res, next) => {
  try {
    const { movieId, rating, comment } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ movie: movieId, user: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this movie' });
    }

    const review = await Review.create({
      movie: movieId,
      user: req.user._id,
      rating,
      comment,
    });

    await review.populate('user', 'name avatar');
    await recalculateRating(new mongoose.Types.ObjectId(movieId));
    await deleteCache('movies:top-rated');

    res.status(201).json({ success: true, message: 'Review submitted', data: review });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/reviews/:id ─────────────────────────────────────────────────────
export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    await recalculateRating(review.movie);
    await deleteCache('movies:top-rated');

    res.json({ success: true, message: 'Review updated', data: review });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/reviews/:id ──────────────────────────────────────────────────
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const movieId = review.movie;
    await Review.findByIdAndDelete(req.params.id);
    await recalculateRating(movieId);
    await deleteCache('movies:top-rated');

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/reviews/:id/like ───────────────────────────────────────────────
export const toggleLike = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userId = req.user._id;
    // Use .equals() for ObjectId comparison instead of indexOf
    const alreadyLiked = review.likes.some((id) => id.equals(userId));

    if (alreadyLiked) {
      review.likes.pull(userId); // Mongoose pull handles ObjectId correctly
    } else {
      review.likes.push(userId);
      createNotification({
        recipient: review.user,
        type: 'review_like',
        actor: userId,
        review: review._id,
        movie: review.movie,
      });
    }

    await review.save();
    res.json({
      success: true,
      data: { liked: !alreadyLiked, likesCount: review.likes.length },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reviews/my-reviews ─────────────────────────────────────────────
export const getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ user: req.user._id })
        .populate('movie', 'title poster averageRating releaseYear')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/reviews/:id/flag (admin) ──────────────────────────────────────
export const flagReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isFlagged = !review.isFlagged;
    await review.save();

    res.json({
      success: true,
      message: `Review ${review.isFlagged ? 'flagged' : 'unflagged'}`,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};
