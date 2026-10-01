import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export const productIdParamSchema = z.object({
  productId: z.uuid(),
});

export type AddCartItemType = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemType = z.infer<typeof updateCartItemSchema>;
export type ProductIdParamType = z.infer<typeof productIdParamSchema>;
