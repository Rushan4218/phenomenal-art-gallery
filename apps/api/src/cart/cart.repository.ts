import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { ProductStatus } from '../generated/prisma/enums.js';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      // Only the cart id (callers attach items with it) and the storefront
      // item projection are fetched; inactive products are hidden from the
      // cart instead of failing it, and full product rows are never loaded.
      select: {
        id: true,
        items: {
          where: {
            product: {
              status: ProductStatus.ACTIVE,
            },
          },
          select: {
            productId: true,
            quantity: true,
            product: { select: { name: true, slug: true, price: true } },
          },
        },
      },
    });
  }

  create(userId: string) {
    return this.prisma.cart.create({
      data: {
        user: { connect: { id: userId } },
      },
    });
  }

  findItem(cartId: string, productId: string) {
    return this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  }

  addItem(cartId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.create({
      data: {
        cart: { connect: { id: cartId } },
        product: { connect: { id: productId } },
        quantity,
      },
      select: {
        productId: true,
        quantity: true,
        product: { select: { name: true, slug: true, price: true } },
      },
    });
  }

  updateItemQuantity(cartId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      data: {
        quantity,
      },
      select: {
        productId: true,
        quantity: true,
        product: { select: { name: true, slug: true, price: true } },
      },
    });
  }

  removeItem(cartId: string, productId: string) {
    return this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  }

  clear(cartId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
