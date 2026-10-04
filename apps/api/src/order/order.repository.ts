import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { OrderCreateInput } from '../generated/prisma/models.js';
import { OrderStatus } from '../generated/prisma/enums.js';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  findByUserIdForStorefront(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        subTotal: true,
        shippingAmount: true,
        totalAmount: true,
        shippingName: true,
        shippingAddress: true,
        shippingPhone: true,
        createdAt: true,
        orderItems: {
          select: {
            productId: true,
            productName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            // Order items snapshot name/price themselves; only the slug is
            // joined so an item can link to its product page.
            product: { select: { slug: true } },
          },
        },
      },
    });
  }

  findByUserIdAndIdForStorefront(userId: string, id: string) {
    return this.prisma.order.findFirst({
      where: { id, userId },
      select: {
        id: true,
        status: true,
        subTotal: true,
        shippingAmount: true,
        totalAmount: true,
        shippingName: true,
        shippingAddress: true,
        shippingPhone: true,
        createdAt: true,
        orderItems: {
          select: {
            productId: true,
            productName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            product: { select: { slug: true } },
          },
        },
      },
    });
  }

  createOrder(userId: string, data: OrderCreateInput) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data,
        select: {
          id: true,
          status: true,
          subTotal: true,
          shippingAmount: true,
          totalAmount: true,
          shippingName: true,
          shippingAddress: true,
          shippingPhone: true,
          createdAt: true,
          orderItems: {
            select: {
              productId: true,
              productName: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              product: { select: { slug: true } },
            },
          },
        },
      });

      const productIds = order.orderItems
        .map((item) => item.productId)
        .filter((id): id is string => id !== null);

      // also clear ordered items from the user cart
      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId,
          },
          productId: {
            in: productIds,
          },
        },
      });

      return order;
    });
  }

  updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
