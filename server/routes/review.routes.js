import { Router } from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  toggleLike,
  getMyReviews,
  flagReview,
} from '../controllers/review.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { reviewLimiter } from '../middleware/rateLimiter.middleware.js';
import { createReviewSchema, updateReviewSchema } from '../schemas/review.schema.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Movie review endpoints
 */

/**
 * @swagger
 * /api/reviews/my-reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get the authenticated user's reviews
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of own reviews
 */
router.get('/my-reviews', verifyToken, getMyReviews);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Submit a review (rate limited 5/hour)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 10 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Review submitted
 *       409:
 *         description: Already reviewed this movie
 */
router.post('/', verifyToken, reviewLimiter, validate(createReviewSchema), createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     summary: Edit own review
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review updated
 *       403:
 *         description: Not authorized
 */
router.put('/:id', verifyToken, validate(updateReviewSchema), updateReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review (owner or admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete('/:id', verifyToken, deleteReview);

/**
 * @swagger
 * /api/reviews/{id}/like:
 *   post:
 *     tags: [Reviews]
 *     summary: Toggle like on a review
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Like toggled
 */
router.post('/:id/like', verifyToken, toggleLike);

/**
 * @swagger
 * /api/reviews/{id}/flag:
 *   patch:
 *     tags: [Reviews]
 *     summary: Flag or unflag a review (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review flagged/unflagged
 */
router.patch('/:id/flag', verifyToken, requireRole('admin'), flagReview);

export default router;
