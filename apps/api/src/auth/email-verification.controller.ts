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
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { verifyEmailSchema, type VerifyEmailType } from './auth.schema.js';

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
  async verify(
    @Body(new ZodValidationPipe(verifyEmailSchema)) data: VerifyEmailType,
  ) {
    const verified = await this.emailVerificationService.verify(data.token);
    if (!verified) {
      throw new BadRequestException('Invalid or expired token');
    }
    return {
      message: 'Email verified successfully',
      email: verified.email,
      emailVerified: true,
    };
  }

  @ApiOperation({ summary: 'Resend the email verification message' })
  @Post('verification')
  async resend(@CurrentUser() user: User) {
    if (user.emailVerified) {
      throw new ConflictException('Email is already verified');
    }
    await this.emailVerificationService.send(user);
    return { message: 'Verification email sent successfully' };
  }
}
