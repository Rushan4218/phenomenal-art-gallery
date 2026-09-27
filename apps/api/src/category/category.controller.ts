import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  createCategorySchema,
  updateCategorySchema,
  type UpdateCategoryType,
  type CreateCategoryType,
} from './category.schema.js';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Electronics' },
        description: { type: 'string', example: 'Devices and gadgets' },
        imageAlt: { type: 'string', example: 'Traditional Thangka painting' },
        mediaId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
      required: ['name'],
    },
  })
  @Post()
  async create(
    @Body(new ZodValidationPipe(createCategorySchema)) data: CreateCategoryType,
  ) {
    const category = await this.categoryService.create(data);
    return {
      message: 'Category created successfully',
      category,
    };
  }

  @ApiOperation({ summary: 'Get all categories' })
  @Get()
  async findMany() {
    const categories = await this.categoryService.findMany();
    return {
      message: 'Categories retrieved successfully',
      categories,
    };
  }

  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category',
    required: true,
  })
  @Get(':id')
  async findById(@Param('id') id: string) {
    const category = await this.categoryService.findById(id);
    return {
      message: 'Category retrieved successfully',
      category,
    };
  }

  @ApiOperation({ summary: 'Get a category by slug' })
  @ApiParam({
    name: 'slug',
    example: 'electronics',
    description: 'The slug of the category',
    required: true,
  })
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoryService.findBySlug(slug);
    return {
      message: 'Category retrieved successfully',
      category,
    };
  }

  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category to update',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Electronics' },
        description: { type: 'string', example: 'Updated description' },
        imageAlt: {
          type: 'string',
          nullable: true,
          example: 'Traditional Thangka painting',
        },
        mediaId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCategorySchema))
    data: UpdateCategoryType,
  ) {
    const category = await this.categoryService.update(id, data);
    return {
      message: 'Category updated successfully',
      category,
    };
  }

  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category to delete',
    required: true,
  })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.categoryService.delete(id);
    return {
      message: 'Category deleted successfully',
    };
  }
}
