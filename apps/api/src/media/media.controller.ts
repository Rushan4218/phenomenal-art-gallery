import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service.js';
import {
  deleteMediaSchema,
  uploadMediaSchema,
  type UploadMediaType,
  type DeleteMediaType,
} from './media.schema.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { mediaFolders } from './media.constant.js';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({ summary: 'Upload media files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        purpose: {
          type: 'string',
          enum: ['PRODUCT', 'CATEGORY', 'USER_AVATAR', 'GALLERY'],
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['purpose', 'files'],
    },
  })
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 20))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body(new ZodValidationPipe(uploadMediaSchema)) body: UploadMediaType,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const filesToUpload = files.map((file) => ({
      buffer: file.buffer,
      filename: file.originalname,
    }));

    const media = await this.mediaService.upload(filesToUpload, {
      folder: mediaFolders[body.purpose],
    });

    return {
      message: 'Files uploaded successfully',
      media,
    };
  }

  @ApiOperation({ summary: 'Delete media files' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        keys: {
          type: 'array',
          items: { type: 'string' },
          example: ['products/1.jpg', 'categories/2.jpg'],
        },
      },
      required: ['keys'],
    },
  })
  @Delete()
  async delete(
    @Body(new ZodValidationPipe(deleteMediaSchema)) body: DeleteMediaType,
  ) {
    await this.mediaService.delete(body.keys);

    return {
      message: 'Media files deleted successfully',
    };
  }
}
