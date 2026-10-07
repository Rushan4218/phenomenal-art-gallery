import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { type User } from '../generated/prisma/client.js';
import { createOrderSchema, type CreateOrderType } from './order.schema.js';
import { OrderService } from './order.service.js';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Storefront Orders')
@Controller('storefront/orders')
export class StorefrontOrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Place an order from the current cart' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              productId: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              quantity: { type: 'integer', minimum: 1, example: 1 },
            },
            required: ['productId', 'quantity'],
          },
        },
        shippingName: { type: 'string', maxLength: 100, example: 'John Doe' },
        shippingAddress: {
          type: 'string',
          maxLength: 500,
          example: 'Bhaktapur, Nepal',
        },
        shippingPhone: {
          type: 'string',
          maxLength: 20,
          example: '+9779800000000',
        },
      },
      required: ['items', 'shippingName', 'shippingAddress', 'shippingPhone'],
    },
  })
  @Post()
  async createOrder(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(createOrderSchema))
    data: CreateOrderType,
  ) {
    const order = await this.orderService.createOrder(user.id, data);

    return {
      message: 'Order created successfully',
      order,
    };
  }

  @ApiOperation({ summary: 'Get the orders of the current customer' })
  @Get()
  async findOrders(@CurrentUser() user: User) {
    const orders = await this.orderService.findByUserIdForStorefront(user.id);

    return {
      message: 'Orders retrieved successfully',
      orders,
    };
  }

  @ApiOperation({ summary: 'Get an order of the current customer' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the order',
    required: true,
  })
  @Get(':id')
  async findOrder(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const order = await this.orderService.findByUserIdAndIdForStorefront(
      user.id,
      id,
    );
    return {
      message: 'Order retrieved successfully',
      order,
    };
  }

  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the order',
    required: true,
  })
  @Patch(':id/cancel')
  async cancelOrder(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const order = await this.orderService.cancelOrder(user.id, id);

    return {
      message: 'Order cancelled successfully',
      order,
    };
  }
}
