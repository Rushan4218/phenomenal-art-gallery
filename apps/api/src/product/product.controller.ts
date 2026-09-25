import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductService } from './product.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductType,
  type UpdateProductType,
} from './product.schema.js';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Medicine Buddha Thangka' },
        description: {
          type: 'string',
          example: 'Hand-painted thangka on cotton canvas',
        },
        price: { type: 'string', example: '250.00' },
        categoryId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string', example: 'https://cdn.example/1.jpg' },
              altText: { type: 'string', example: 'Medicine Buddha' },
              sortOrder: { type: 'integer', example: 0 },
              key: { type: 'string', example: 'products/1.jpg' },
              provider: {
                type: 'string',
                enum: ['CLOUDINARY', 'S3'],
                example: 'CLOUDINARY',
              },
            },
            required: ['url', 'altText', 'key', 'provider'],
          },
        },
      },
      required: ['name', 'price', 'categoryId'],
    },
  })
  @Post()
  async create(
    @Body(new ZodValidationPipe(createProductSchema))
    data: CreateProductType,
  ) {
    const product = await this.productService.create(data);
    return {
      message: 'Product created successfully',
      product,
    };
  }

  @ApiOperation({ summary: 'Get all products' })
  @Get()
  async findMany() {
    const products = await this.productService.findMany();
    return {
      message: 'Products retrieved successfully',
      products,
    };
  }

  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiParam({
    name: 'slug',
    example: 'medicine-buddha-thangka',
    description: 'The slug of the product',
    required: true,
  })
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.productService.findBySlug(slug);
    return {
      message: 'Product retrieved successfully',
      product,
    };
  }

  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the product',
    required: true,
  })
  @Get(':id')
  async findById(@Param('id') id: string) {
    const product = await this.productService.findById(id);
    return {
      message: 'Product retrieved successfully',
      product,
    };
  }

  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the product to update',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Thangka' },
        description: { type: 'string', example: 'Updated description' },
        price: { type: 'string', example: '300.00' },
        status: {
          type: 'string',
          enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
          example: 'ACTIVE',
        },
        categoryId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string', example: 'https://cdn.example/1.jpg' },
              altText: { type: 'string', example: 'Updated Thangka' },
              sortOrder: { type: 'integer', example: 0 },
              key: { type: 'string', example: 'products/1.jpg' },
              provider: {
                type: 'string',
                enum: ['CLOUDINARY', 'S3'],
                example: 'CLOUDINARY',
              },
            },
            required: ['url', 'altText', 'key', 'provider'],
          },
        },
      },
    },
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema))
    data: UpdateProductType,
  ) {
    const product = await this.productService.update(id, data);
    return {
      message: 'Product updated successfully',
      product,
    };
  }

  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the product to delete',
    required: true,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.productService.delete(id);
    return {
      message: 'Product deleted successfully',
    };
  }
}
