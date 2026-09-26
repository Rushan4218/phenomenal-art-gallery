import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryStorageAdapter } from './storage/cloudinary.storage.js';
import { MediaRepository } from './media.respository.js';
import { StorageProvider } from '../generated/prisma/enums.js';

@Injectable()
export class MediaService {
  constructor(
    private readonly storage: CloudinaryStorageAdapter,
    private readonly mediaRepository: MediaRepository,
  ) {}

  async upload(
    files: {
      buffer: Buffer;
      filename: string;
    }[],
    options?: {
      folder?: string;
    },
  ) {
    const uploaded = await Promise.all(
      files.map((file) => {
        return this.storage.upload(file.buffer, {
          filename: file.filename,
          folder: options?.folder,
        });
      }),
    );

    return Promise.all(
      uploaded.map((media) => {
        return this.mediaRepository.create({
          key: media.key,
          url: media.url,
          provider: StorageProvider.CLOUDINARY,
        });
      }),
    );
  }

  async delete(
    ids: string[],
  ): Promise<{ deleted: string[]; failed: string[] }> {
    const medias = await Promise.all(
      ids.map((id) => this.mediaRepository.findById(id)),
    );

    const missingIds = ids.filter(
      (id) => !medias.find((media) => media?.id === id),
    );

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Media not found for ids: ${missingIds.join(', ')}`,
      );
    }

    const existingMedias = medias.filter(
      (media): media is NonNullable<typeof media> => media !== null,
    );

    const results = await Promise.allSettled(
      existingMedias.map((media) => this.storage.delete(media.key)),
    );

    const successfullyDeletedIds = existingMedias
      .filter((_, index) => results[index].status === 'fulfilled')
      .map((media) => media.id);

    if (successfullyDeletedIds.length > 0) {
      await Promise.all(
        successfullyDeletedIds.map((id) => this.mediaRepository.delete(id)),
      );
    }

    const failedMedia = existingMedias.filter(
      (_, index) => results[index].status === 'rejected',
    );

    return {
      deleted: successfullyDeletedIds,
      failed: failedMedia.map((media) => media.id),
    };
  }
}
