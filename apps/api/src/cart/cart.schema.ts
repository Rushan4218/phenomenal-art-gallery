import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export type AddCartItemType = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemType = z.infer<typeof updateCartItemSchema>;

// What the storefront is allowed to see of a cart: the items a customer
// needs to review an order, and nothing else (no cart/user ids, timestamps
// or full product rows).
export type StorefrontCartItem = {
  productId: string;
  quantity: number;
  product: {
    name: string;
    slug: string;
    price: string;
  };
};

export type StorefrontCart = {
  items: StorefrontCartItem[];
};
