import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository.js';
import { CreateCategoryType, UpdateCategoryType } from './category.schema.js';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(data: CreateCategoryType) {
    const slug = data.name.trim().toLowerCase().replace(/\s+/g, '-');
    return this.categoryRepository.create({ ...data, slug });
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
    return this.categoryRepository.update(id, { ...data });
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return this.categoryRepository.delete(id);
  }
}
