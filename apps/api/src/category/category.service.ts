import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository.js';
import { CreateCategoryType, UpdateCategoryType } from './category.schema.js';

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

  async findMany() {
    return this.categoryRepository.findMany();
  }

  async findById(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
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
}
