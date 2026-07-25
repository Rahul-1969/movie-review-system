import { Router } from 'express';
import {
  createList,
  getMyLists,
  getPublicLists,
  getListById,
  updateList,
  deleteList,
  addMovieToList,
  removeMovieFromList,
} from '../controllers/list.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
// Must be BEFORE /:id to avoid route swallowing
router.get('/public', getPublicLists);

// ─── Auth required ────────────────────────────────────────────────────────────
router.get('/my-lists', verifyToken, getMyLists);
router.post('/', verifyToken, createList);

// ─── Single list — optionally authenticated for private list ownership check ──
// Use verifyToken as optional by wrapping with try/next for public lists
router.get('/:id', (req, res, next) => {
  // Try to verify token but don't fail if absent — controller handles the 403
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
}, getListById);

router.put('/:id', verifyToken, updateList);
router.delete('/:id', verifyToken, deleteList);
router.post('/:id/movies/:movieId', verifyToken, addMovieToList);
router.delete('/:id/movies/:movieId', verifyToken, removeMovieFromList);

export default router;
