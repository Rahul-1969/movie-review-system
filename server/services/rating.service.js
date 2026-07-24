import Review from '../models/Review.model.js';
import Movie from '../models/Movie.model.js';

/**
 * Recalculate and persist the average rating and review count for a movie
 */
export const recalculateRating = async (movieId) => {
  const result = await Review.aggregate([
    { $match: { movie: movieId } },
    {
      $group: {
        _id: '$movie',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    await Movie.findByIdAndUpdate(movieId, { averageRating: 0, totalReviews: 0 });
  } else {
    const { averageRating, totalReviews } = result[0];
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });
  }
};
