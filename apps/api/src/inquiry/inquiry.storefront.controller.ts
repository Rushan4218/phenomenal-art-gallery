import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import {
  createInquirySchema,
  type CreateInquiryType,
} from './inquiry.schema.js';
import { InquiryService } from './inquiry.service.js';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Storefront Inquiries')
@Controller('storefront/inquiries')
export class InquiryStorefrontController {
  constructor(private readonly inquiryService: InquiryService) {}

  @ApiOperation({ summary: 'Submit an inquiry' })
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
    @Body(new ZodValidationPipe(createInquirySchema))
    data: CreateInquiryType,
  ) {
    const inquiry = await this.inquiryService.createInquiry(data);

    return {
      message: 'Inquiry created successfully',
      inquiry,
    };
  }
}
