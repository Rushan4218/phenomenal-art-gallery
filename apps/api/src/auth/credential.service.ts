import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { PasswordHasher } from '@nestjs/authentication';
import { type SignUpType, type SignInType } from './auth.schema.js';
import { User } from '../generated/prisma/client.js';

@Injectable()
export class CredentialService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(data: SignUpType): Promise<User> {
    return this.userService.createUser(data);
  }

  async verify(data: SignInType) {
    const user = await this.userService.findCredentials(data.email);

    const valid = await this.passwordHasher.verify(
      data.password,
      user?.passwordHash ?? '',
    );
    if (!valid || !user?.passwordHash) {
      return null;
    }

    // rehash password because it was accessed here while we had the plain text
    if (this.passwordHasher.needsRehash(user.passwordHash)) {
      const newHash = await this.passwordHasher.hash(data.password);
      await this.userService.updatePassword(user.id, newHash);
    }

    return user;
  }
}
