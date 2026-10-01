import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  addCartItemSchema,
  updateCartItemSchema,
  type UpdateCartItemType,
  type AddCartItemType,
} from './cart.schema.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { CurrentUser } from '@nestjs/authentication';
import { type User } from '../generated/prisma/client.js';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Add an item to the cart' })
  @ApiBody({
    schema: {
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
  })
  @Post('items')
  async addItem(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(addCartItemSchema)) data: AddCartItemType,
  ) {
    const item = await this.cartService.addItem(
      user.id,
      data.productId,
      data.quantity,
    );
    return { message: 'Cart Item added successfully', item };
  }

  @ApiOperation({ summary: 'Get the current cart' })
  @Get()
  async getCart(@CurrentUser() user: User) {
    const cart = await this.cartService.getCart(user.id);
    return { message: 'Cart retrieved successfully', cart };
  }

  @ApiOperation({ summary: 'Update the quantity of a cart item' })
  @ApiParam({
    name: 'productId',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the product in the cart',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'integer', minimum: 1, example: 1 },
      },
      required: ['quantity'],
    },
  })
  @Patch('items/:productId')
  async updateItemQuantity(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(updateCartItemSchema)) data: UpdateCartItemType,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    const item = await this.cartService.updateItem(
      user.id,
      productId,
      data.quantity,
    );
    return { message: 'Cart Item updated successfully', item };
  }

  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiParam({
    name: 'productId',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the product in the cart',
    required: true,
  })
  @Delete('items/:productId')
  async removeItem(
    @CurrentUser() user: User,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    await this.cartService.removeItem(user.id, productId);
    return { message: 'Cart Item removed successfully' };
  }

  @ApiOperation({ summary: 'Clear the cart' })
  @Delete()
  async clearCart(@CurrentUser() user: User) {
    await this.cartService.clear(user.id);
    return { message: 'Cart cleared successfully' };
  }
}
