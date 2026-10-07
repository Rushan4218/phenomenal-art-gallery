import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { PaymentStatus } from '../generated/prisma/enums.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  findByOrderId(orderId: string) {
    return this.prisma.payment.findUnique({
      where: { orderId },
    });
  }

  create(data: Prisma.PaymentCreateInput) {
    return this.prisma.payment.create({
      data,
    });
  }

  updateStatus(id: string, status: PaymentStatus) {
    return this.prisma.payment.update({
      where: { id },
      data: { status },
    });
  }
}
