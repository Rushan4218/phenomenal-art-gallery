import { InquiryService } from './inquiry.service.js';
import { InquiryRepository } from './inquiry.repository.js';
import { InquiryController } from './inquiry.controller.js';
import { Module } from '@nestjs/common';

@Module({
  providers: [InquiryService, InquiryRepository],
  controllers: [InquiryController],
})
export class InquiryModule {}
