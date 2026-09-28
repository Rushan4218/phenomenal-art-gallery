import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InquiryService } from './inquiry.service.js';
import { ApiBody, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  createInquirySchema,
  listInquiriesSchema,
  updateInquirySchema,
  type UpdateInquiryType,
  type CreateInquiryType,
  type ListInquiriesType,
} from './inquiry.schema.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';

@Controller('inquiries')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @ApiOperation({ summary: 'Create a new inquiry' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
        },
        phone: { type: 'string', example: '+1234567890' },
        subject: { type: 'string', example: 'Product Inquiry' },
        message: {
          type: 'string',
          example: 'I would like to know more about your products.',
        },
      },
      required: ['name', 'email', 'subject', 'message'],
    },
  })
  @Post()
  async createInquiry(
    @Body(new ZodValidationPipe(createInquirySchema)) data: CreateInquiryType,
  ) {
    const inquiry = await this.inquiryService.createInquiry(data);
    return {
      message: 'Inquiry created successfully',
      inquiry,
    };
  }

  @ApiOperation({ summary: 'Get all inquiries' })
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
  @Get()
  async findMany(
    @Query(new ZodValidationPipe(listInquiriesSchema))
    query: ListInquiriesType,
  ) {
    const { data, meta } = await this.inquiryService.findMany(query);
    return {
      message: 'Inquiries retrieved successfully',
      data,
      meta,
    };
  }

  @ApiOperation({ summary: 'Get an inquiry by ID' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the inquiry to retrieve',
    required: true,
  })
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const inquiry = await this.inquiryService.findById(id);
    return {
      message: 'Inquiry retrieved successfully',
      inquiry,
    };
  }

  @ApiOperation({ summary: 'Update an inquiry by ID' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the inquiry to update',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        response: { type: 'string', example: 'Thank you for your inquiry.' },
        status: {
          type: 'string',
          enum: ['PENDING', 'RESPONDED', 'CLOSED'],
          example: 'RESPONDED',
        },
      },
    },
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateInquirySchema)) data: UpdateInquiryType,
  ) {
    const inquiry = await this.inquiryService.update(id, data);
    return {
      message: 'Inquiry updated successfully',
      inquiry,
    };
  }
}
