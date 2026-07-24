import { Router } from 'express';
import {
  getStats,
  getUsers,
  toggleBan,
  getFlaggedReviews,
  getAnalytics,
} from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(verifyToken, requireRole('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only management endpoints
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get platform statistics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stats including totalUsers, totalMovies, totalReviews, avgRating
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get paginated user list
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated users
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/ban:
 *   patch:
 *     tags: [Admin]
 *     summary: Toggle user ban status
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User ban status toggled
 */
router.patch('/users/:id/ban', toggleBan);

/**
 * @swagger
 * /api/admin/reviews/flagged:
 *   get:
 *     tags: [Admin]
 *     summary: Get all flagged reviews
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Flagged reviews list
 */
router.get('/reviews/flagged', getFlaggedReviews);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     tags: [Admin]
 *     summary: Get monthly analytics (users, reviews, top movies)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data for charts
 */
router.get('/analytics', getAnalytics);

export default router;
