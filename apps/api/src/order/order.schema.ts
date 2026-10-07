import { z } from 'zod';
import { OrderStatus } from '../generated/prisma/enums.js';

const orderItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  shippingName: z.string().trim().min(1).max(100),
  shippingAddress: z.string().trim().min(1).max(500),
  shippingPhone: z.string().trim().min(1).max(20),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus),
});

export type CreateOrderType = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusType = z.infer<typeof updateOrderStatusSchema>;

// What the storefront may see of an order. Items keep their name/price
// snapshots (so history survives product edits) and only join the product's
// slug for linking back to its page — never the full product row.
export type StorefrontOrderItem = {
  productId: string | null;
  productSlug: string | null;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type StorefrontOrder = {
  id: string;
  status: OrderStatus;
  subTotal: string;
  shippingAmount: string;
  totalAmount: string;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  createdAt: Date;
  items: StorefrontOrderItem[];
};
