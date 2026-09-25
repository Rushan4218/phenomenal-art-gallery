import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import {
  CategoryCreateInput,
  CategoryUpdateInput,
} from '../generated/prisma/models.js';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CategoryCreateInput) {
    return this.prisma.category.create({ data });
  }

  async findMany() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  async update(id: string, data: CategoryUpdateInput) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
