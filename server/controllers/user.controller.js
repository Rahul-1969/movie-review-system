import User from '../models/User.model.js';
import Movie from '../models/Movie.model.js';
import cloudinary from '../config/cloudinary.js';

// ─── GET /api/users/profile ───────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updates = {};

    if (name) updates.name = name;

    if (req.cloudinary) {
      // Delete old avatar
      const user = await User.findById(req.user._id);
      if (user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id).catch(console.error);
      }
      updates.avatar = { url: req.cloudinary.url, public_id: req.cloudinary.public_id };
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/users/watchlist/:movieId ───────────────────────────────────────
export const toggleWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const user = await User.findById(req.user._id);
    const alreadyAdded = user.watchlist.some((id) => id.equals(movieId));
    if (alreadyAdded) {
      user.watchlist.pull(movieId);
    } else {
      user.watchlist.push(movieId);
    }

    await user.save();

    res.json({
      success: true,
      message: alreadyAdded ? 'Removed from watchlist' : 'Added to watchlist',
      data: { inWatchlist: !alreadyAdded },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/users/watchlist ─────────────────────────────────────────────────
export const getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'watchlist',
        select: 'title poster averageRating totalReviews releaseYear genres',
        populate: { path: 'genres', select: 'name slug' },
      })
      .lean();

    res.json({ success: true, data: user.watchlist });
  } catch (err) {
    next(err);
  }
};
