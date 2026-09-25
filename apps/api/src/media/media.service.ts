import { Injectable } from '@nestjs/common';
import { CloudinaryStorageAdapter } from './storage/cloudinary.storage.js';

@Injectable()
export class MediaService {
  constructor(private readonly storage: CloudinaryStorageAdapter) {}

  async upload(
    files: {
      buffer: Buffer;
      filename: string;
    }[],
    options?: {
      folder?: string;
    },
  ): Promise<{ url: string; key: string }[]> {
    return Promise.all(
      files.map((file) => {
        return this.storage.upload(file.buffer, {
          filename: file.filename,
          folder: options?.folder,
        });
      }),
    );
  }

  async delete(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.storage.delete(key)));
  }
}
