import Notification from '../models/Notification.model.js';

export const createNotification = async ({ recipient, type, actor, review, comment, movie }) => {
  try {
    if (!recipient || !actor) return;
    // Never create a notification where recipient === actor
    if (recipient.toString() === actor.toString()) return;

    await Notification.create({
      recipient,
      type,
      actor,
      review,
      comment,
      movie,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};
