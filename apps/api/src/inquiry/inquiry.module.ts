import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service.js';
import { InquiryRepository } from './inquiry.repository.js';
import { InquiryController } from './inquiry.controller.js';

@Module({
  providers: [InquiryService, InquiryRepository],
  controllers: [InquiryController],
})
export class InquiryModule {}
