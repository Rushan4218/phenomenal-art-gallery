import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module.js';
import { SessionAuth } from './session-auth.provider.js';
import { AuthController } from './auth.controller.js';
import { CredentialService } from './credential.service.js';
import { EmailVerificationMailer } from './email-verification.mailer.js';
import { EmailVerificationController } from './email-verification.controller.js';

@Module({
  imports: [UserModule],
  controllers: [AuthController, EmailVerificationController],
  providers: [SessionAuth, CredentialService, EmailVerificationMailer],
})
export class AuthModule {}
