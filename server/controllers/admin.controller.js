import User from '../models/User.model.js';
import Movie from '../models/Movie.model.js';
import Review from '../models/Review.model.js';

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
export const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalMovies, totalReviews, ratingAgg] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Movie.countDocuments(),
      Review.countDocuments(),
      Movie.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$averageRating' } } },
      ]),
    ]);

    const avgRating = ratingAgg[0]?.avgRating
      ? Math.round(ratingAgg[0].avgRating * 10) / 10
      : 0;

    res.json({
      success: true,
      data: { totalUsers, totalMovies, totalReviews, avgRating },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-refreshToken -passwordResetToken -passwordResetExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
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

// ─── PATCH /api/admin/users/:id/ban ──────────────────────────────────────────
export const toggleBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot ban an admin' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'suspended'}`,
      data: { isActive: user.isActive },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/reviews/flagged ───────────────────────────────────────────
export const getFlaggedReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ isFlagged: true })
        .populate('user', 'name email avatar')
        .populate('movie', 'title poster')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments({ isFlagged: true }),
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

// ─── GET /api/admin/analytics ─────────────────────────────────────────────────
export const getAnalytics = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [monthlyUsers, monthlyReviews, topMovies] = await Promise.all([
      // New users per month (last 6 months)
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'user' } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Reviews per month (last 6 months)
      Review.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Top 5 most reviewed movies
      Movie.find()
        .select('title poster averageRating totalReviews')
        .sort({ totalReviews: -1 })
        .limit(5)
        .lean(),
    ]);

    res.json({
      success: true,
      data: { monthlyUsers, monthlyReviews, topMovies },
    });
  } catch (err) {
    next(err);
  }
};
