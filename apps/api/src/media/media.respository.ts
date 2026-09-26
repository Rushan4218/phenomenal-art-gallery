import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { MediaCreateInput } from '../generated/prisma/models.js';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: MediaCreateInput) {
    return this.prisma.media.create({ data });
  }

  findById(id: string) {
    return this.prisma.media.findUnique({ where: { id } });
  }

  findByStorageObject(key: string) {
    return this.prisma.media.findUnique({
      where: {
        key,
      },
    });
  }
  delete(id: string) {
    return this.prisma.media.delete({ where: { id } });
  }
}
