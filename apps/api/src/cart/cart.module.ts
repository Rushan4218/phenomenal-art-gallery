import { Module } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { CartRepository } from './cart.repository.js';
import { CartController } from './cart.controller.js';
import { ProductModule } from '../product/product.module.js';

@Module({
  imports: [ProductModule],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartModule {}
