import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email'),
  password: z.string({ required_error: 'Password is required' }).min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
});
