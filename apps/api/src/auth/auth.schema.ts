import { z } from 'zod';
import { UserRole } from '../generated/prisma/enums.js';

export const signUpSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email(),
  password: z.string().min(8).max(100),
  role: z.enum(UserRole),
});
export type SignUpType = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.email(),
  password: z.string(),
});
export type SignInType = z.infer<typeof signInSchema>;
