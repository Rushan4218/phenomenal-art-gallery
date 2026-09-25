import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().max(250).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryType = z.infer<typeof createCategorySchema>;
export type UpdateCategoryType = z.infer<typeof updateCategorySchema>;
