import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { ListInquiriesType } from './inquiry.schema.js';

@Injectable()
export class InquiryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.InquiryCreateInput) {
    return this.prisma.inquiry.create({
      data,
      // Inquiries are only ever created for the public form, so fetch the
      // confirmation fields and nothing admin-managed.
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findMany(query: ListInquiriesType) {
    const { page, limit } = query;

    const [data, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inquiry.count(),
    ]);

    return { data, total };
  }

  findById(id: string) {
    return this.prisma.inquiry.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Prisma.InquiryUpdateInput) {
    return this.prisma.inquiry.update({
      where: { id },
      data,
    });
  }
}
