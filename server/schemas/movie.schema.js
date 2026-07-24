import { z } from 'zod';

export const createMovieSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1)
    .max(200),
  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .max(2000),
  releaseYear: z
    .number()
    .int()
    .min(1888)
    .max(new Date().getFullYear() + 5)
    .optional(),
  language: z.string().max(50).optional(),
  genres: z
    .array(z.string())
    .min(1, 'At least one genre is required')
    .optional(),
  cast: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.string().min(1),
      })
    )
    .optional(),
  director: z.string().max(100).optional(),
  trailer: z
    .string()
    .url('Must be a valid URL')
    .regex(/youtube\.com|youtu\.be/, 'Must be a YouTube URL')
    .optional()
    .or(z.literal('')),
  isPublished: z.boolean().optional(),
});

export const updateMovieSchema = createMovieSchema.partial();
