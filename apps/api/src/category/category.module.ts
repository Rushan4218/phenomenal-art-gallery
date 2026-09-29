import { Module } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryRepository } from './category.repository.js';
import { CategoryController } from './category.controller.js';
import { CategoryStorefrontController } from './category.storefront.controller.js';

@Module({
  controllers: [CategoryController, CategoryStorefrontController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryModule {}
