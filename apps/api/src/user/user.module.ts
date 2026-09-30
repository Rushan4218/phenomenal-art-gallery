import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';

@Module({
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
