import { z } from 'zod';
import { InquiryStatus } from '../generated/prisma/enums.js';
import { paginationQuerySchema } from '../common/schemas/pagination.schema.js';

export const createInquirySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(100),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

export const updateInquirySchema = z.object({
  response: z.string().trim().min(1).max(5000).nullish(),
  status: z.enum(InquiryStatus).optional(),
});

export const listInquiriesSchema = paginationQuerySchema;

export type CreateInquiryType = z.infer<typeof createInquirySchema>;
export type UpdateInquiryType = z.infer<typeof updateInquirySchema>;
export type ListInquiriesType = z.infer<typeof listInquiriesSchema>;
