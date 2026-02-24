import { z } from 'zod';

export const articleSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(150, "Title cannot exceed 150 characters"),
    content: z.string().min(50, "Content must be at least 50 characters"),
    category: z.string().min(1, "Category is required"),
    status: z.enum(['Draft', 'Published']).optional(),
  })
});

export const articleQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number).default(1),
    size: z.string().regex(/^\d+$/).optional().transform(Number).default(10),
    category: z.string().optional(),
    author: z.string().optional(),
    q: z.string().optional()
  })
});