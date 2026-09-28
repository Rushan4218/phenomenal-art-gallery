import { Injectable, NotFoundException } from '@nestjs/common';
import { InquiryRepository } from './inquiry.repository.js';
import {
  CreateInquiryType,
  ListInquiriesType,
  UpdateInquiryType,
} from './inquiry.schema.js';
import { InquiryStatus } from '../generated/prisma/enums.js';

@Injectable()
export class InquiryService {
  constructor(private readonly inquiryRepository: InquiryRepository) {}

  async findMany(query: ListInquiriesType) {
    const { data, total } = await this.inquiryRepository.findMany(query);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findById(id: string) {
    const inquiry = await this.inquiryRepository.findById(id);
    if (!inquiry) {
      throw new NotFoundException(`Inquiry with id ${id} not found`);
    }
    return inquiry;
  }

  async update(id: string, data: UpdateInquiryType) {
    const inquiry = await this.inquiryRepository.findById(id);
    if (!inquiry) {
      throw new NotFoundException(`Inquiry with id ${id} not found`);
    }

    const { status, response } = data;
    let finalStatus = status;

    if (status === undefined && response !== undefined) {
      finalStatus = InquiryStatus.RESPONDED;
    }

    const updateData = {
      ...data,
      ...(response !== undefined && response !== null
        ? { respondedAt: new Date() }
        : {}),
      ...(finalStatus !== undefined ? { status: finalStatus } : {}),
    };

    return this.inquiryRepository.update(id, updateData);
  }

  async createInquiry(data: CreateInquiryType) {
    return this.inquiryRepository.create(data);
  }
}
