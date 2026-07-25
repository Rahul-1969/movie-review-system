import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Review from '../models/Review.model.js';
import Movie from '../models/Movie.model.js';
import Genre from '../models/Genre.model.js';

/**
 * Generates personalized movie recommendations based on liked reviews and watchlist
 * @param {string} userId
 * @param {number} limit
 */
export const getRecommendations = async (userId, limit = 6) => {
  // 1. Fetch user's liked movies (rating >= 7)
  const likedReviews = await Review.find({ user: userId, rating: { $gte: 7 } })
    .populate({
      path: 'movie',
      populate: { path: 'genres' },
    })
    .lean();

  const likedMovies = likedReviews.map((r) => r.movie).filter(Boolean);

  // 2. Fetch user's watchlist movies
  const user = await User.findById(userId)
    .populate({
      path: 'watchlist',
      populate: { path: 'genres' },
    })
    .lean();

  const watchlistMovies = user?.watchlist || [];

  // Combine unique movies
  const combinedMovies = [];
  const seenIds = new Set();
  
  [...likedMovies, ...watchlistMovies].forEach((m) => {
    if (m && m._id && !seenIds.has(m._id.toString())) {
      seenIds.add(m._id.toString());
      combinedMovies.push(m);
    }
  });

  // 3. Fallback if no data
  if (combinedMovies.length === 0) {
    const topRated = await Movie.find({ isPublished: true })
      .populate('genres', 'name slug')
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(limit)
      .lean();
    return { movies: topRated, topGenre: null };
  }

  // 4. Build profile: count genres and directors
  const genreCounts = {};
  const directorCounts = {};

  combinedMovies.forEach((m) => {
    // Genres
    if (m.genres && m.genres.length > 0) {
      m.genres.forEach((g) => {
        const gid = g._id.toString();
        if (!genreCounts[gid]) {
          genreCounts[gid] = { count: 0, genre: g };
        }
        genreCounts[gid].count += 1;
      });
    }
    // Directors
    if (m.director) {
      directorCounts[m.director] = (directorCounts[m.director] || 0) + 1;
    }
  });

  // Top 3 genres
  const topGenres = Object.values(genreCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((g) => g.genre);

  const topGenreIds = topGenres.map((g) => g._id.toString());
  const primaryGenre = topGenres.length > 0 ? topGenres[0] : null;

  // Top 2 directors
  const topDirectors = Object.entries(directorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([dir]) => dir);

  // 5. Query candidate movies
  // Not already reviewed or in watchlist
  const userReviews = await Review.find({ user: userId }).select('movie').lean();
  const reviewedIds = userReviews.map((r) => r.movie.toString());
  const excludedIds = new Set([...reviewedIds, ...watchlistMovies.map(m => m._id.toString())]);
  const excludedObjectIds = Array.from(excludedIds).map(id => new mongoose.Types.ObjectId(id));

  // Find movies matching top genres OR top directors
  const candidates = await Movie.find({
    _id: { $nin: excludedObjectIds },
    isPublished: true,
    $or: [
      { genres: { $in: topGenres.map(g => g._id) } },
      { director: { $in: topDirectors } }
    ]
  })
    .populate('genres', 'name slug')
    .lean();

  // 6. Score candidates
  const scoredCandidates = candidates.map((movie) => {
    let score = 0;
    
    // Genre match (+2 points per match)
    if (movie.genres) {
      movie.genres.forEach((g) => {
        if (topGenreIds.includes(g._id.toString())) {
          score += 2;
        }
      });
    }

    // Director match (+3 points)
    if (movie.director && topDirectors.includes(movie.director)) {
      score += 3;
    }

    // Quality weighting (+1 point per 2.0 rating above 7)
    if (movie.averageRating > 7) {
      score += (movie.averageRating - 7) / 2;
    }

    return { ...movie, recommendationScore: score };
  });

  // 7. Sort and slice
  scoredCandidates.sort((a, b) => b.recommendationScore - a.recommendationScore);
  const recommendedMovies = scoredCandidates.slice(0, limit);

  // If we didn't find enough, backfill with top-rated unreviewed movies
  if (recommendedMovies.length < limit) {
    const backfillIds = [...excludedObjectIds, ...recommendedMovies.map(m => m._id)];
    const backfill = await Movie.find({
      _id: { $nin: backfillIds },
      isPublished: true,
    })
      .populate('genres', 'name slug')
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(limit - recommendedMovies.length)
      .lean();
    
    recommendedMovies.push(...backfill);
  }

  return { movies: recommendedMovies, topGenre: primaryGenre };
};
