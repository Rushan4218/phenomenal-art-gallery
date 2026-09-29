import { z } from 'zod';
import { ProductStatus } from '../generated/prisma/enums.js';
import { paginationQuerySchema } from '../common/schemas/pagination.schema.js';

export const productImageSchema = z.object({
  mediaId: z.uuid(),
  altText: z.string().trim().max(100),
  sortOrder: z.number().int().nonnegative().optional(),
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

export const listProductsSchema = paginationQuerySchema.extend({
  categoryId: z.uuid().optional(),
  status: z.enum(ProductStatus).optional(),
});

export const listStorefrontProductsSchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(100).optional(),
  category: z.string().trim().min(1).max(100).optional(),
});

export type CreateProductType = z.infer<typeof createProductSchema>;
export type UpdateProductType = z.infer<typeof updateProductSchema>;
export type ProductImageType = z.infer<typeof productImageSchema>;
export type ListProductsType = z.infer<typeof listProductsSchema>;
export type ListStorefrontProductsType = z.infer<
  typeof listStorefrontProductsSchema
>;

export type StorefrontProductImage = {
  url: string;
  altText: string;
};

export type StorefrontProductListItem = {
  id: string;
  name: string;
  slug: string;
  price: string;
  category: { name: string; slug: string };
  image: StorefrontProductImage | null;
};

export type StorefrontProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  category: { name: string; slug: string };
  images: StorefrontProductImage[];
};
