import { Injectable } from '@nestjs/common';
import { User } from '../generated/prisma/client.js';
import {
  AuthenticationRegistry,
  SessionCookieProvider,
  SessionRecord,
} from '@nestjs/authentication';
import { UserService } from '../user/user.service.js';

@Injectable()
export class SessionAuth extends SessionCookieProvider<User> {
  constructor(
    private readonly userService: UserService,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  validate(session: SessionRecord) {
    return this.userService.findById(session.userId);
  }
}
