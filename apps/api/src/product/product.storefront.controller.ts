import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  listStorefrontProductsSchema,
  type ListStorefrontProductsType,
} from './product.schema.js';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Storefront Products')
@Controller('products')
export class ProductStorefrontController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Browse active products' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number, defaults to 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Items per page, defaults to 20, maximum 100',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    example: 'medicine buddha',
    description: 'Search active products by name, case-insensitive',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    example: 'thangka-paintings',
    description: 'Filter active products by category slug',
  })
  @Get()
  async findMany(
    @Query(new ZodValidationPipe(listStorefrontProductsSchema))
    query: ListStorefrontProductsType,
  ) {
    const { data, meta } =
      await this.productService.findManyForStorefront(query);
    return {
      message: 'Products retrieved successfully',
      products: data,
      meta,
    };
  }

  @ApiOperation({ summary: 'Get an active product by slug' })
  @ApiParam({
    name: 'slug',
    example: 'medicine-buddha-thangka',
    description: 'The slug of the active product',
    required: true,
  })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.productService.findBySlugForStorefront(slug);
    return {
      message: 'Product retrieved successfully',
      product,
    };
  }
}
