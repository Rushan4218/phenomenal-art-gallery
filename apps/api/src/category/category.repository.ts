import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import {
  CategoryCreateInput,
  CategoryUpdateInput,
} from '../generated/prisma/models.js';
import { ListCategoriesType } from './category.schema.js';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CategoryCreateInput) {
    return this.prisma.category.create({
      data,
      include: { media: true },
    });
  }

  async findMany(query: ListCategoriesType) {
    const { page, limit } = query;

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { media: true },
      }),
      this.prisma.category.count(),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { media: true },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: { media: true },
    });
  }

  async update(id: string, data: CategoryUpdateInput) {
    return this.prisma.category.update({
      where: { id },
      data,
      include: { media: true },
    });
  }

  async delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
