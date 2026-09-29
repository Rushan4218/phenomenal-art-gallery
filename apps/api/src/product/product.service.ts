import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from './product.repository.js';
import { CategoryService } from '../category/category.service.js';
import {
  CreateProductType,
  ListProductsType,
  ListStorefrontProductsType,
  ProductImageType,
  StorefrontProductDetail,
  StorefrontProductListItem,
  UpdateProductType,
} from './product.schema.js';

type StorefrontProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: { toString(): string };
  category: { name: string; slug: string };
  images: { altText: string; media: { url: string } }[];
};

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
  ) {}

  async create(data: CreateProductType) {
    await this.categoryService.findById(data.categoryId);
    const slug = data.name.trim().toLowerCase().replace(/\s+/g, '-');
    return this.productRepository.create({
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      category: { connect: { id: data.categoryId } },
      images: data.images
        ? {
            createMany: {
              data: this.withDefaultSortOrder(data.images).map((image) => ({
                mediaId: image.mediaId,
                altText: image.altText,
                sortOrder: image.sortOrder,
              })),
            },
          }
        : undefined,
    });
  }

  async findMany(query: ListProductsType) {
    const { data, total } = await this.productRepository.findMany(query);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findById(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async findStorefront(query: ListStorefrontProductsType) {
    const { data, total } = await this.productRepository.findStorefront(query);

    return {
      data: data.map((product) => this.toStorefrontListItem(product)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findStorefrontBySlug(slug: string) {
    const product = await this.productRepository.findStorefrontBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return this.toStorefrontProductDetail(product);
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }

  async update(id: string, data: UpdateProductType) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const { categoryId, images, ...fields } = data;
    if (categoryId) {
      await this.categoryService.findById(categoryId);
    }

    return this.productRepository.update(
      id,
      {
        ...fields,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
      images && images.length > 0
        ? this.withDefaultSortOrder(images)
        : undefined,
    );
  }

  async delete(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return this.productRepository.delete(id);
  }

  private toStorefrontListItem(
    product: Omit<StorefrontProductRecord, 'description'>,
  ): StorefrontProductListItem {
    const image = product.images[0];

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price.toString(),
      category: {
        name: product.category.name,
        slug: product.category.slug,
      },
      image: image ? { url: image.media.url, altText: image.altText } : null,
    };
  }

  private toStorefrontProductDetail(
    product: StorefrontProductRecord,
  ): StorefrontProductDetail {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      category: {
        name: product.category.name,
        slug: product.category.slug,
      },
      images: product.images.map((image) => ({
        url: image.media.url,
        altText: image.altText,
      })),
    };
  }

  private withDefaultSortOrder(images: ProductImageType[]) {
    const sortedImages = [...images].sort((a, b) => {
      if (a.sortOrder === undefined && b.sortOrder === undefined) {
        return 0;
      }

      if (a.sortOrder === undefined) {
        return 1;
      }

      if (b.sortOrder === undefined) {
        return -1;
      }

      return a.sortOrder - b.sortOrder;
    });

    return sortedImages.map((image, index) => ({
      ...image,
      sortOrder: index,
    }));
  }
}
