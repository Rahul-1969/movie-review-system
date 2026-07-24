import mongoose from 'mongoose';
import Movie from '../models/Movie.model.js';
import Review from '../models/Review.model.js';
import Genre from '../models/Genre.model.js';
import { getCache, setCache, deleteCache, deleteCachePattern } from '../services/cache.service.js';
import cloudinary from '../config/cloudinary.js';

const CACHE_KEYS = {
  TOP_RATED: 'movies:top-rated',
  TRENDING: 'movies:trending',
};

// ─── GET /api/movies ──────────────────────────────────────────────────────────
export const getMovies = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      genre,
      year,
      language,
      minRating,
      search,
      sort = '-createdAt',
    } = req.query;

    const query = { isPublished: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (genre) {
      const genreDoc = await Genre.findOne({ slug: genre });
      if (genreDoc) query.genres = genreDoc._id;
    }
    if (year) query.releaseYear = parseInt(year);
    if (language) query.language = { $regex: language, $options: 'i' };
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [movies, total] = await Promise.all([
      Movie.find(query)
        .populate('genres', 'name slug')
        .populate('addedBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Movie.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: movies,
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

// ─── GET /api/movies/top-rated (cached 10 min) ────────────────────────────────
export const getTopRated = async (req, res, next) => {
  try {
    const cached = await getCache(CACHE_KEYS.TOP_RATED);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    const movies = await Movie.find({ isPublished: true, totalReviews: { $gt: 0 } })
      .populate('genres', 'name slug')
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(10)
      .lean();

    await setCache(CACHE_KEYS.TOP_RATED, movies, 600);
    res.json({ success: true, data: movies });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/movies/trending (cached 5 min) ──────────────────────────────────
export const getTrending = async (req, res, next) => {
  try {
    const cached = await getCache(CACHE_KEYS.TRENDING);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await Review.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$movie', reviewCount: { $sum: 1 } } },
      { $sort: { reviewCount: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
      { $match: { 'movie.isPublished': true } },
      { $replaceRoot: { newRoot: { $mergeObjects: ['$movie', { recentReviews: '$reviewCount' }] } } },
    ]);

    await setCache(CACHE_KEYS.TRENDING, trending, 300);
    res.json({ success: true, data: trending });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/movies/:id ──────────────────────────────────────────────────────
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('genres', 'name slug')
      .populate('addedBy', 'name avatar')
      .lean();

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const reviews = await Review.find({ movie: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: { ...movie, reviews } });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/movies ─────────────────────────────────────────────────────────
export const createMovie = async (req, res, next) => {
  try {
    const data = { ...req.body, addedBy: req.user._id };

    if (req.cloudinary) {
      data.poster = { url: req.cloudinary.url, public_id: req.cloudinary.public_id };
    }

    // Parse genres if sent as JSON string (form data)
    if (typeof data.genres === 'string') {
      data.genres = JSON.parse(data.genres);
    }
    if (typeof data.cast === 'string') {
      data.cast = JSON.parse(data.cast);
    }
    if (data.releaseYear) {
      data.releaseYear = parseInt(data.releaseYear);
    }

    const movie = await Movie.create(data);
    await movie.populate('genres', 'name slug');

    // Invalidate caches
    await Promise.all([
      deleteCache(CACHE_KEYS.TOP_RATED),
      deleteCache(CACHE_KEYS.TRENDING),
    ]);

    res.status(201).json({ success: true, message: 'Movie created', data: movie });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/movies/:id ──────────────────────────────────────────────────────
export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const updates = { ...req.body };

    if (req.cloudinary) {
      // Delete old poster from Cloudinary
      if (movie.poster?.public_id) {
        await cloudinary.uploader.destroy(movie.poster.public_id).catch(console.error);
      }
      updates.poster = { url: req.cloudinary.url, public_id: req.cloudinary.public_id };
    }

    if (typeof updates.genres === 'string') updates.genres = JSON.parse(updates.genres);
    if (typeof updates.cast === 'string') updates.cast = JSON.parse(updates.cast);
    if (updates.releaseYear) updates.releaseYear = parseInt(updates.releaseYear);

    const updated = await Movie.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('genres', 'name slug');

    await Promise.all([
      deleteCache(CACHE_KEYS.TOP_RATED),
      deleteCache(CACHE_KEYS.TRENDING),
      deleteCache(`movie:${req.params.id}`),
    ]);

    res.json({ success: true, message: 'Movie updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/movies/:id ───────────────────────────────────────────────────
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Delete poster from Cloudinary
    if (movie.poster?.public_id) {
      await cloudinary.uploader.destroy(movie.poster.public_id).catch(console.error);
    }

    await Movie.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ movie: req.params.id });

    await Promise.all([
      deleteCache(CACHE_KEYS.TOP_RATED),
      deleteCache(CACHE_KEYS.TRENDING),
      deleteCachePattern('movies:*'),
    ]);

    res.json({ success: true, message: 'Movie deleted' });
  } catch (err) {
    next(err);
  }
};
