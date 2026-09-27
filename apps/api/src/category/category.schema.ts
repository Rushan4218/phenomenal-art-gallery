import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().max(250).optional(),
  imageAlt: z.string().trim().min(1).max(100).nullish(),
  mediaId: z.uuid().nullish(),
});

const imageAltRule = {
  message: 'imageAlt is required when mediaId is provided',
  path: ['imageAlt'],
};

const hasImageAltWithMedia = (data: {
  imageAlt?: string | null;
  mediaId?: string | null;
}) => !data.mediaId || Boolean(data.imageAlt);

export const createCategorySchema = categorySchema.refine(
  hasImageAltWithMedia,
  imageAltRule,
);

export const updateCategorySchema = categorySchema
  .partial()
  .refine(hasImageAltWithMedia, imageAltRule);

export type CreateCategoryType = z.infer<typeof createCategorySchema>;
export type UpdateCategoryType = z.infer<typeof updateCategorySchema>;
