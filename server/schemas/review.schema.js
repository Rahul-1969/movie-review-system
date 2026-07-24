import { z } from 'zod';

export const createReviewSchema = z.object({
  movieId: z.string({ required_error: 'Movie ID is required' }).min(1),
  rating: z
    .number({ required_error: 'Rating is required' })
    .int()
    .min(1, 'Rating must be at least 1')
    .max(10, 'Rating cannot exceed 10'),
  comment: z
    .string({ required_error: 'Comment is required' })
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(10).optional(),
  comment: z.string().min(10).max(1000).optional(),
});
