import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RbacService } from '../modules/rbac/services/rbac.service';
import { AuthenticatedRequest } from '../types/auth.types';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private rbacService: RbacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const params = request.params as Record<string, string>;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user is admin (admins can access anything)
    const isAdmin = await this.rbacService.hasRole(user.id, 'admin');
    if (isAdmin) {
      return true;
    }

    // Check if the user is trying to access their own resource
    const resourceUserId = params.userId || params.id;

    if (resourceUserId && user.id === resourceUserId) {
      return true;
    }

    throw new ForbiddenException(
      'Access denied. You can only access your own resources.',
    );
  }
}
