import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@nestjs/authentication';

@ApiTags('Storefront Categories')
@Controller('categories')
export class CategoryStorefrontController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Browse all categories' })
  @Public()
  @Get()
  async findMany() {
    const categories = await this.categoryService.findAllForStorefront();
    return {
      message: 'Categories retrieved successfully',
      categories,
    };
  }
}
