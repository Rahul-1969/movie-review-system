import { Router } from 'express';
import {
  getMovies,
  getTopRated,
  getTrending,
  getSearchSuggestions,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movie.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { upload, handleUpload } from '../middleware/upload.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Movie management endpoints
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     tags: [Movies]
 *     summary: Get all movies (paginated, filterable)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: genre
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: language
 *         schema: { type: string }
 *       - in: query
 *         name: minRating
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Paginated movie list
 */
router.get('/', getMovies);

/**
 * @swagger
 * /api/movies/top-rated:
 *   get:
 *     tags: [Movies]
 *     summary: Get top rated movies (Redis cached, TTL 10min)
 *     responses:
 *       200:
 *         description: Top rated movies
 */
router.get('/top-rated', getTopRated);

/**
 * @swagger
 * /api/movies/trending:
 *   get:
 *     tags: [Movies]
 *     summary: Get trending movies (most reviewed in last 7 days, cached 5min)
 *     responses:
 *       200:
 *         description: Trending movies
 */
router.get('/trending', getTrending);

/**
 * @swagger
 * /api/movies/search-suggestions:
 *   get:
 *     tags: [Movies]
 *     summary: Get movie search autocomplete suggestions
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Search suggestions
 */
router.get('/search-suggestions', getSearchSuggestions);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     tags: [Movies]
 *     summary: Get a single movie with reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Movie details with reviews
 *       404:
 *         description: Movie not found
 */
router.get('/:id', getMovieById);

/**
 * @swagger
 * /api/movies:
 *   post:
 *     tags: [Movies]
 *     summary: Create a new movie (admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               poster: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Movie created
 *       403:
 *         description: Admin access required
 */
router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  upload.single('poster'),
  handleUpload('poster'),
  createMovie
);

/**
 * @swagger
 * /api/movies/{id}:
 *   put:
 *     tags: [Movies]
 *     summary: Update a movie (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Movie updated
 */
router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  upload.single('poster'),
  handleUpload('poster'),
  updateMovie
);

/**
 * @swagger
 * /api/movies/{id}:
 *   delete:
 *     tags: [Movies]
 *     summary: Delete a movie (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Movie deleted
 */
router.delete('/:id', verifyToken, requireRole('admin'), deleteMovie);

export default router;
