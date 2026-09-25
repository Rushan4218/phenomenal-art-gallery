import { Injectable } from '@nestjs/common';
import { StorageAdapter } from './storage.adapter.js';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CloudinaryStorageAdapter implements StorageAdapter {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async upload(
    file: Buffer,
    options?: { folder?: string; filename?: string },
  ): Promise<{ url: string; key: string }> {
    return new Promise((resolve, reject) => {
      const filename = options?.filename?.replace(/\.[^/.]+$/, '');
      const publicId = `${filename}-${randomUUID()}`;
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options?.folder,
          public_id: publicId,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            reject(
              error ??
                new Error('Cloudinary upload failed: No result returned.'),
            );
          } else {
            resolve({ url: result.secure_url, key: result.public_id });
          }
        },
      );

      uploadStream.end(file);
    });
  }

  async delete(key: string): Promise<void> {
    await cloudinary.uploader.destroy(key, { resource_type: 'image' });
  }
}
