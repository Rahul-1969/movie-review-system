import List from '../models/List.model.js';
import Movie from '../models/Movie.model.js';
import { createListSchema, updateListSchema } from '../schemas/list.schema.js';

const MOVIE_POPULATE = 'title poster averageRating releaseYear totalReviews';

// ─── POST /api/lists ───────────────────────────────────────────────────────────
export const createList = async (req, res, next) => {
  try {
    const parsed = createListSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    const list = await List.create({ ...parsed.data, user: req.user._id });
    res.status(201).json({ success: true, message: 'List created', data: list });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/lists/my-lists ───────────────────────────────────────────────────
export const getMyLists = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [lists, total] = await Promise.all([
      List.find({ user: req.user._id })
        .populate(MOVIE_POPULATE.split(' ').map(f => ({ path: 'movies', select: MOVIE_POPULATE })).slice(0, 1)[0])
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      List.countDocuments({ user: req.user._id }),
    ]);

    // Populate movies (first 4 for cover collage)
    const listsWithMovies = await List.find({ user: req.user._id })
      .populate({ path: 'movies', select: MOVIE_POPULATE, options: { limit: 4 } })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: listsWithMovies,
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

// ─── GET /api/lists/public ─────────────────────────────────────────────────────
export const getPublicLists = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [lists, total] = await Promise.all([
      List.find({ isPublic: true })
        .populate({ path: 'user', select: 'name avatar' })
        .populate({ path: 'movies', select: MOVIE_POPULATE })
        .sort({ 'movies.length': -1, updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      List.countDocuments({ isPublic: true }),
    ]);

    res.json({
      success: true,
      data: lists,
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

// ─── GET /api/lists/:id ────────────────────────────────────────────────────────
export const getListById = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id)
      .populate({ path: 'user', select: 'name avatar' })
      .populate({ path: 'movies', select: 'title poster averageRating releaseYear totalReviews genres', populate: { path: 'genres', select: 'name slug' } })
      .lean();

    if (!list) {
      return res.status(404).json({ success: false, message: 'List not found' });
    }

    // Private list — only owner can view
    if (!list.isPublic) {
      const userId = req.user?._id?.toString();
      if (!userId || list.user._id.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'This list is private' });
      }
    }

    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/lists/:id ────────────────────────────────────────────────────────
export const updateList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ success: false, message: 'List not found' });
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const parsed = updateListSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
    }

    Object.assign(list, parsed.data);
    await list.save();

    res.json({ success: true, message: 'List updated', data: list });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/lists/:id ─────────────────────────────────────────────────────
export const deleteList = async (req, res, next) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ success: false, message: 'List not found' });
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await List.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'List deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/lists/:id/movies/:movieId ──────────────────────────────────────
export const addMovieToList = async (req, res, next) => {
  try {
    const { id, movieId } = req.params;
    const list = await List.findById(id);
    if (!list) return res.status(404).json({ success: false, message: 'List not found' });
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    if (list.movies.some(m => m.toString() === movieId)) {
      return res.status(400).json({ success: false, message: 'Movie already in list' });
    }

    list.movies.push(movieId);
    await list.save();

    res.json({ success: true, message: 'Movie added to list', data: { movieId } });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/lists/:id/movies/:movieId ─────────────────────────────────────
export const removeMovieFromList = async (req, res, next) => {
  try {
    const { id, movieId } = req.params;
    const list = await List.findById(id);
    if (!list) return res.status(404).json({ success: false, message: 'List not found' });
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    list.movies.pull(movieId);
    await list.save();

    res.json({ success: true, message: 'Movie removed from list', data: { movieId } });
  } catch (err) {
    next(err);
  }
};
