import { Module } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryRepository } from './category.repository.js';
import { CategoryController } from './category.controller.js';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
