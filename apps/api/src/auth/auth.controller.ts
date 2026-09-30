import {
  EmailVerificationService,
  Public,
  SignInService,
} from '@nestjs/authentication';
import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { CredentialService } from './credential.service.js';
import {
  signInSchema,
  type SignInType,
  signUpSchema,
  type SignUpType,
} from './auth.schema.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly credentialsService: CredentialService,
    private readonly signInService: SignInService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @ApiOperation({ summary: 'Register a new account' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
        },
        password: { type: 'string', format: 'password', example: 'secret123' },
        role: {
          type: 'string',
          enum: ['CUSTOMER', 'ADMIN'],
          example: 'CUSTOMER',
        },
      },
      required: ['name', 'email', 'password', 'role'],
    },
  })
  @Post('sign-up')
  async signUp(@Body(new ZodValidationPipe(signUpSchema)) data: SignUpType) {
    const user = await this.credentialsService.register(data);
    await this.signInService.signIn(user.id, { method: 'password' });

    await this.emailVerificationService.send(user);
    return { message: 'Sign-up successful', user };
  }

  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
        },
        password: { type: 'string', format: 'password', example: 'secret123' },
      },
      required: ['email', 'password'],
    },
  })
  @Post('sign-in')
  async signIn(@Body(new ZodValidationPipe(signInSchema)) data: SignInType) {
    const user = await this.credentialsService.verify(data);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const { session } = await this.signInService.signIn(user.id, {
      method: 'password',
    });
    return {
      message: 'Sign-in successful',
      mfaRequired: session.mfa === 'pending',
    };
  }
}
