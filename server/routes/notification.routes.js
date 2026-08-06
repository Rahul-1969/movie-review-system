import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from '../controllers/notification.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/read', deleteAllRead);
router.delete('/:id', deleteNotification);

export default router;
