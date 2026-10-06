import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { PaymentRepository } from './payment.repository.js';
import { PaymentController } from './payment.controller.js';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository],
  exports: [PaymentService],
})
export class PaymentModule {}
