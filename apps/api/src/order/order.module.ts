import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module.js';
import { OrderService } from './order.service.js';
import { OrderRepository } from './order.repository.js';
import { OrderController } from './order.controller.js';
import { StorefrontOrderController } from './order.storefront.controller.js';

@Module({
  imports: [CartModule],
  controllers: [OrderController, StorefrontOrderController],
  providers: [OrderService, OrderRepository],
})
export class OrderModule {}
