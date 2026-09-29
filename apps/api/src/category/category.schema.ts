import { z } from 'zod';
import { paginationQuerySchema } from '../common/schemas/pagination.schema.js';

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

export const listCategoriesSchema = paginationQuerySchema;

export type CreateCategoryType = z.infer<typeof createCategorySchema>;
export type UpdateCategoryType = z.infer<typeof updateCategorySchema>;
export type ListCategoriesType = z.infer<typeof listCategoriesSchema>;

export type StorefrontCategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: { url: string; altText: string | null } | null;
};
