import { z } from 'zod';

export const createListSchema = z.object({
  name: z
    .string({ required_error: 'List name is required' })
    .min(1, 'Name must be at least 1 character')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().default(''),
  isPublic: z.boolean().optional().default(true),
});

export const updateListSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});
