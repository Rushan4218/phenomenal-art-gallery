import { Module } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { ProductRepository } from './product.repository.js';
import { ProductController } from './product.controller.js';
import { ProductStorefrontController } from './product.storefront.controller.js';
import { CategoryModule } from '../category/category.module.js';

@Module({
  imports: [CategoryModule],
  controllers: [ProductController, ProductStorefrontController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
