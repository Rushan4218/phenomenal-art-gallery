import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentRepository } from './payment.repository.js';
import { OrderStatus, PaymentStatus } from '../generated/prisma/enums.js';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async findByOrderId(orderId: string) {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new NotFoundException(`Payment with order ID ${orderId} not found`);
    }
    return payment;
  }

  async markAsPaid(id: string) {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    if (payment.order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        `Payment cannot be marked as paid for a cancelled order`,
      );
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        `Payment cannot transition from ${payment.status} to ${PaymentStatus.PAID}`,
      );
    }
    return this.paymentRepository.updateStatus(id, PaymentStatus.PAID);
  }
}
