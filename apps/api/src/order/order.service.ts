import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from './order.repository.js';
import { CreateOrderType, StorefrontOrder } from './order.schema.js';
import { OrderStatus, Prisma } from '../generated/prisma/client.js';
import { CartService } from '../cart/cart.service.js';

// Exact shape of the repository's storefront order selects; the mapper below
// turns it into the StorefrontOrder the API is allowed to expose.
type StorefrontOrderRecord = {
  id: string;
  status: OrderStatus;
  subTotal: { toString(): string };
  shippingAmount: { toString(): string };
  totalAmount: { toString(): string };
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  createdAt: Date;
  orderItems: {
    productId: string | null;
    productName: string;
    quantity: number;
    unitPrice: { toString(): string };
    totalPrice: { toString(): string };
    product: { slug: string } | null;
  }[];
};

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartService: CartService,
  ) {}

  private validateStatusTransition(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
  ) {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Order cannot transition from ${currentStatus} to ${nextStatus}`,
      );
    }
  }

  async findMany() {
    return this.orderRepository.findMany();
  }

  async findById(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByUserIdAndIdForStorefront(userId: string, id: string) {
    const order = await this.orderRepository.findByUserIdAndIdForStorefront(
      userId,
      id,
    );
    if (!order) {
      throw new NotFoundException(
        `Order with ID ${id} not found for user ${userId}`,
      );
    }
    return this.toStorefrontOrder(order);
  }

  async findByUserIdForStorefront(userId: string) {
    const orders = await this.orderRepository.findByUserIdForStorefront(userId);
    return orders.map((order) => this.toStorefrontOrder(order));
  }

  async createOrder(userId: string, data: CreateOrderType) {
    const cart = await this.cartService.getCart(userId);

    const cartItems = new Map(cart.items.map((item) => [item.productId, item]));

    const orderItems = data.items.map((requestedItem) => {
      const cartItem = cartItems.get(requestedItem.productId);
      if (!cartItem) {
        throw new NotFoundException(
          `Product with ID ${requestedItem.productId} not found in cart`,
        );
      }
      // The cart exposes prices as plain strings, so parse them back into
      // Decimals before the money arithmetic (exact decimal, never float).
      const unitPrice = new Prisma.Decimal(cartItem.product.price);
      const totalPrice = unitPrice.mul(requestedItem.quantity);

      return {
        productId: requestedItem.productId,
        productName: cartItem.product.name,
        quantity: requestedItem.quantity,
        unitPrice,
        totalPrice,
      };
    });

    // shipping free for now
    const shippingAmount = new Prisma.Decimal(0);
    const subTotal = orderItems.reduce(
      (total, item) => total.add(item.totalPrice),
      new Prisma.Decimal(0),
    );
    const totalAmount = subTotal.add(shippingAmount);

    const orderCreateData: Prisma.OrderCreateInput = {
      user: {
        connect: { id: userId },
      },
      subTotal,
      totalAmount,
      shippingAmount,
      shippingAddress: data.shippingAddress,
      shippingName: data.shippingName,
      shippingPhone: data.shippingPhone,
      orderItems: {
        create: orderItems.map((item) => ({
          product: { connect: { id: item.productId } },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productName: item.productName,
          totalPrice: item.totalPrice,
        })),
      },
    };

    const order = await this.orderRepository.createOrder(
      userId,
      orderCreateData,
    );
    return this.toStorefrontOrder(order);
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    this.validateStatusTransition(order.status, status);

    return this.orderRepository.updateStatus(id, status);
  }

  async cancelOrder(userId: string, id: string) {
    const order = await this.orderRepository.findByUserIdAndIdForStorefront(
      userId,
      id,
    );
    if (!order) {
      throw new NotFoundException(
        `Order with ID ${id} not found for user ${userId}`,
      );
    }

    this.validateStatusTransition(order.status, OrderStatus.CANCELLED);

    // updateStatus only returns the order scalars; the item snapshots fetched
    // above are unaffected by a status change, so reuse them with the new
    // status instead of re-querying.
    const cancelled = await this.orderRepository.updateStatus(
      id,
      OrderStatus.CANCELLED,
    );
    return this.toStorefrontOrder({ ...order, status: cancelled.status });
  }

  // Every exposed field is picked explicitly: money is stringified, shipping
  // details and status pass through, and items map to their public shape.
  private toStorefrontOrder(order: StorefrontOrderRecord): StorefrontOrder {
    return {
      id: order.id,
      status: order.status,
      subTotal: order.subTotal.toString(),
      shippingAmount: order.shippingAmount.toString(),
      totalAmount: order.totalAmount.toString(),
      shippingName: order.shippingName,
      shippingAddress: order.shippingAddress,
      shippingPhone: order.shippingPhone,
      createdAt: order.createdAt,
      items: order.orderItems.map((item) => ({
        productId: item.productId,
        productSlug: item.product?.slug ?? null,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        totalPrice: item.totalPrice.toString(),
      })),
    };
  }
}
