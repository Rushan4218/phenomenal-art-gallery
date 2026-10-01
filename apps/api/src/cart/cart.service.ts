import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '../generated/prisma/enums.js';
import { ProductService } from '../product/product.service.js';
import { CartRepository } from './cart.repository.js';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productService: ProductService,
  ) {}

  async getCart(userId: string) {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      return {
        items: [],
      };
    }

    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number) {
    await this.getActiveProduct(productId);

    this.validateQuantity(quantity);

    const cart =
      (await this.cartRepository.findByUserId(userId)) ??
      (await this.cartRepository.create(userId));

    const existingItem = await this.cartRepository.findItem(cart.id, productId);

    if (existingItem) {
      return this.cartRepository.updateItemQuantity(
        cart.id,
        productId,
        existingItem.quantity + quantity,
      );
    }

    return this.cartRepository.addItem(cart.id, productId, quantity);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    await this.getActiveProduct(productId);

    this.validateQuantity(quantity);

    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.cartRepository.findItem(cart.id, productId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.cartRepository.updateItemQuantity(cart.id, productId, quantity);
  }

  async removeItem(userId: string, productId: string) {
    await this.getActiveProduct(productId);

    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.cartRepository.findItem(cart.id, productId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.removeItem(cart.id, productId);
  }

  async clear(userId: string) {
    const cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      return;
    }

    await this.cartRepository.clear(cart.id);
  }

  private async getActiveProduct(productId: string) {
    const product = await this.productService.findById(productId);

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException(
        `Product with id ${productId} is not active`,
      );
    }

    return product;
  }

  private validateQuantity(quantity: number) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }
  }
}
