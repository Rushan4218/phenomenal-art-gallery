import z from 'zod';

export const uploadMediaSchema = z.object({
  purpose: z.enum(['PRODUCT', 'CATEGORY', 'USER_AVATAR', 'GALLERY']),
});

export type UploadMediaType = z.infer<typeof uploadMediaSchema>;

export const deleteMediaSchema = z.object({
  keys: z.array(z.string().trim().min(1)).min(1).max(20),
});

export type DeleteMediaType = z.infer<typeof deleteMediaSchema>;
