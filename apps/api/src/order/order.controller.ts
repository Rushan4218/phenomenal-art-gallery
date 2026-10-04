import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  updateOrderStatusSchema,
  type UpdateOrderStatusType,
} from './order.schema.js';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Get all orders' })
  @Get()
  async findOrders() {
    const orders = await this.orderService.findMany();

    return {
      message: 'Orders retrieved successfully',
      orders,
    };
  }

  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the order',
    required: true,
  })
  @Get(':id')
  async findOrder(@Param('id', ParseUUIDPipe) id: string) {
    const order = await this.orderService.findById(id);

    return {
      message: 'Order retrieved successfully',
      order,
    };
  }

  @ApiOperation({ summary: 'Update the status of an order' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the order',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
          ],
          example: 'CONFIRMED',
        },
      },
      required: ['status'],
    },
  })
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateOrderStatusSchema))
    data: UpdateOrderStatusType,
  ) {
    const order = await this.orderService.updateStatus(id, data.status);
    return {
      message: 'Order status updated successfully',
      order,
    };
  }
}
