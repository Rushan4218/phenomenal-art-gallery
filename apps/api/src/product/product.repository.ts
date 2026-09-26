import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import {
  ProductCreateInput,
  ProductUpdateInput,
} from '../generated/prisma/models.js';
import { ProductImageType } from './product.schema.js';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: {
        images: { include: { media: true } },
        category: true,
        productTags: { include: { tag: true } },
      },
    });
  }

  async findMany() {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: {
        images: { include: { media: true } },
        category: true,
        productTags: { include: { tag: true } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { include: { media: true } },
        category: true,
        productTags: { include: { tag: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          include: { media: true },
        },
        category: true,
        productTags: { include: { tag: true } },
      },
    });
  }

  async update(
    id: string,
    data: ProductUpdateInput,
    images?: ProductImageType[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      if (images && images.length > 0) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((image) => ({ ...image, productId: id })),
        });
      }
      return tx.product.findUnique({
        where: { id },
        include: {
          images: { include: { media: true } },
          category: true,
          productTags: { include: { tag: true } },
        },
      });
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
