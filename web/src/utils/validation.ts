import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

// Transaction validation
export const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  category_id: z.string().uuid().optional(),
});

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  type: z.enum(['INCOME', 'EXPENSE']),
});

// Password change validation
export const passwordChangeSchema = z.object({
  current_password: passwordSchema,
  new_password: passwordSchema,
}).refine((data) => data.new_password !== data.current_password, {
  message: "New password must be different from the current one",
  path: ["new_password"],
});