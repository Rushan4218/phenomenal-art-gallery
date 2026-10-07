import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { type User } from '../../generated/prisma/client.js';
import { UserRole } from '../../generated/prisma/enums.js';

/**
 * Restricts a route to signed-in administrators.
 *
 * The global AuthenticationGuard runs before this one and answers an
 * unauthenticated request with a 401, so a request that reaches this guard
 * already carries a user. Everything it does is decide whether that user is
 * an administrator: yes passes, any other authenticated role is refused with
 * a 403.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<{ user: User | null }>();

    if (user?.role === UserRole.ADMIN) {
      return true;
    }

    throw new ForbiddenException('Administrator access required');
  }
}
