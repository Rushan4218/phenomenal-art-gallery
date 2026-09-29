import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository.js';
import {
  CreateCategoryType,
  StorefrontCategoryItem,
  UpdateCategoryType,
  ListCategoriesType,
} from './category.schema.js';

type StorefrontCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageAlt: string | null;
  media: { url: string } | null;
};

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(data: CreateCategoryType) {
    const slug = data.name.trim().toLowerCase().replace(/\s+/g, '-');
    const { mediaId, ...fields } = data;
    return this.categoryRepository.create({
      ...fields,
      slug,
      ...(mediaId ? { media: { connect: { id: mediaId } } } : {}),
    });
  }

  async findMany(query: ListCategoriesType) {
    const { data, total } = await this.categoryRepository.findMany(query);

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
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async findStorefront() {
    const categories = await this.categoryRepository.findStorefront();

    return categories.map((category) => this.toStorefrontCategory(category));
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    return category;
  }

  async update(id: string, data: UpdateCategoryType) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    const { mediaId, ...fields } = data;
    let media: { connect: { id: string } } | { disconnect: true } | undefined;
    if (mediaId === null) {
      media = category.mediaId ? { disconnect: true } : undefined;
    } else if (mediaId !== undefined) {
      media = { connect: { id: mediaId } };
    }

    return this.categoryRepository.update(id, {
      ...fields,
      ...(media ? { media } : {}),
      ...(mediaId === null ? { imageAlt: null } : {}),
    });
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return this.categoryRepository.delete(id);
  }

  private toStorefrontCategory(
    category: StorefrontCategoryRecord,
  ): StorefrontCategoryItem {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.media
        ? { url: category.media.url, altText: category.imageAlt }
        : null,
    };
  }
}
