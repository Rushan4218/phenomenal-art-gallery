import { Module } from '@nestjs/common';
import { CloudinaryStorageAdapter } from './storage/cloudinary.storage.js';
import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import { MediaRepository } from './media.repository.js';

@Module({
  controllers: [MediaController],
  providers: [CloudinaryStorageAdapter, MediaService, MediaRepository],
})
export class MediaModule {}
