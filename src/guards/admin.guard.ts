import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { RbacService } from '../modules/rbac/services/rbac.service';
import { AuthenticatedRequest } from '../types/auth.types';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private rbacService: RbacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const isAdmin = await this.rbacService.hasRole(user.id, 'admin');

    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
