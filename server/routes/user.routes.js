import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  toggleWatchlist,
  getWatchlist,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { upload, handleUpload } from '../middleware/upload.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and watchlist
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get own profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', verifyToken, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update profile and/or avatar
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put(
  '/profile',
  verifyToken,
  upload.single('avatar'),
  handleUpload('avatar'),
  updateProfile
);

/**
 * @swagger
 * /api/users/watchlist/{movieId}:
 *   post:
 *     tags: [Users]
 *     summary: Toggle movie in watchlist
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Watchlist updated
 */
router.post('/watchlist/:movieId', verifyToken, toggleWatchlist);

/**
 * @swagger
 * /api/users/watchlist:
 *   get:
 *     tags: [Users]
 *     summary: Get user's watchlist
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Watchlist movies
 */
router.get('/watchlist', verifyToken, getWatchlist);

export default router;
