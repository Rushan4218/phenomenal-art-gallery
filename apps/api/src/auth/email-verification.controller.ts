import {
  CurrentUser,
  EmailVerificationService,
  Public,
} from '@nestjs/authentication';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
} from '@nestjs/common';
import { type User } from '../generated/prisma/client.js';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth/email')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Verify an email address with a token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJhYmMifQ.signature',
        },
      },
      required: ['token'],
    },
  })
  @Post('verify')
  async verify(@Body('token') token: string) {
    const verified = await this.emailVerificationService.verify(token);
    if (!verified) {
      throw new BadRequestException('Invalid or expired token');
    }
    return { email: verified.email, emailVerified: true };
  }

  @ApiOperation({ summary: 'Resend the email verification message' })
  @Post('verification')
  async resend(@CurrentUser() user: User) {
    if (user.emailVerified) {
      throw new ConflictException('Email is already verified');
    }
    await this.emailVerificationService.send(user);
  }
}
