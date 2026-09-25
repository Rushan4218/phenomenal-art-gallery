import { Module } from '@nestjs/common';
import { CloudinaryStorageAdapter } from './storage/cloudinary.storage.js';
import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';

@Module({
  controllers: [MediaController],
  providers: [CloudinaryStorageAdapter, MediaService],
  exports: [MediaService],
})
export class MediaModule {}
