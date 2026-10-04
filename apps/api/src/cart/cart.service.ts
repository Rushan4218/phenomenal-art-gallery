import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '../generated/prisma/enums.js';
import { ProductService } from '../product/product.service.js';
import { CartRepository } from './cart.repository.js';
import { type StorefrontCart, type StorefrontCartItem } from './cart.schema.js';

// The exact shape the repository's cart selects return. Mirrors
// CartRepository so these mappers fail to compile if the query changes.
type StorefrontCartItemRecord = {
  productId: string;
  quantity: number;
  product: {
    name: string;
    slug: string;
    price: { toString(): string };
  };
};

type StorefrontCartRecord = {
  items: StorefrontCartItemRecord[];
};

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productService: ProductService,
  ) {}

  async getCart(userId: string) {
    const cart = await this.cartRepository.findByUserId(userId);

    // The empty response keeps the same shape as a stored cart.
    if (!cart) {
      return { items: [] };
    }

    return this.toStorefrontCart(cart);
  }

  async addItem(userId: string, productId: string, quantity: number) {
    await this.getActiveProduct(productId);

    this.validateQuantity(quantity);

    const cart =
      (await this.cartRepository.findByUserId(userId)) ??
      (await this.cartRepository.create(userId));

    const existingItem = await this.cartRepository.findItem(cart.id, productId);

    if (existingItem) {
      const updated = await this.cartRepository.updateItemQuantity(
        cart.id,
        productId,
        existingItem.quantity + quantity,
      );
      return this.toStorefrontCartItem(updated);
    }

    const added = await this.cartRepository.addItem(
      cart.id,
      productId,
      quantity,
    );
    return this.toStorefrontCartItem(added);
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

    const updated = await this.cartRepository.updateItemQuantity(
      cart.id,
      productId,
      quantity,
    );
    return this.toStorefrontCartItem(updated);
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

  private toStorefrontCart(cart: StorefrontCartRecord): StorefrontCart {
    return {
      items: cart.items.map((item) => this.toStorefrontCartItem(item)),
    };
  }

  // Every field the customer needs to review the line, picked explicitly so
  // nothing internal (timestamps, raw product rows) can slip into a response.
  private toStorefrontCartItem(
    item: StorefrontCartItemRecord,
  ): StorefrontCartItem {
    return {
      productId: item.productId,
      quantity: item.quantity,
      product: {
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price.toString(),
      },
    };
  }
}
