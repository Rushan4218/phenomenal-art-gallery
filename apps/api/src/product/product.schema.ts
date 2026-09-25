import { z } from 'zod';
import { ProductStatus, StorageProvider } from '../generated/prisma/enums.js';

export const productImageSchema = z.object({
  url: z.url(),
  altText: z.string().trim().max(100),
  sortOrder: z.number().int().nonnegative().optional(),
  key: z.string().trim().max(100),
  provider: z.enum(StorageProvider),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(5000).optional(),
  price: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      'price must be a valid decimal number with up to 2 decimal places',
    )
    .refine((val) => parseFloat(val) > 0, {
      message: 'price must be a positive number',
    }),
  categoryId: z.uuid(),
  images: z.array(productImageSchema).max(20).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(ProductStatus).optional(),
});

export type CreateProductType = z.infer<typeof createProductSchema>;
export type UpdateProductType = z.infer<typeof updateProductSchema>;
export type ProductImageType = z.infer<typeof productImageSchema>;
