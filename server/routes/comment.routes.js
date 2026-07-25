import express from 'express';
import {
  createComment,
  getCommentsByReview,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from '../controllers/comment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { commentLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.get('/review/:reviewId', getCommentsByReview);

// Protected routes
router.use(verifyToken);

router.post('/', commentLimiter, createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.post('/:id/like', toggleCommentLike);

export default router;
