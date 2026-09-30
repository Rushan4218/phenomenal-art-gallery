import { z } from 'zod';
import { UserRole } from '../generated/prisma/enums.js';

export const createUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().trim().max(100),
  password: z.string().min(8).max(100),
  role: z.enum(UserRole).optional(),
});

export type CreateUserType = z.infer<typeof createUserSchema>;
