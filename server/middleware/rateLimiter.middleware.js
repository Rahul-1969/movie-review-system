import rateLimit from 'express-rate-limit';

/**
 * Auth rate limiter: 10 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many auth attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Review submission rate limiter: 5 reviews per hour per user
 * Must be used after verifyToken so req.user is available
 */
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'Review limit reached. You can submit up to 5 reviews per hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter: 200 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Comment submission rate limiter: 20 comments per hour per user
 * Must be used after verifyToken so req.user is available
 */
export const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'Comment limit reached. You can submit up to 20 comments per hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
