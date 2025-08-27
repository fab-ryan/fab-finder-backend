/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../modules/rbac/services/rbac.service';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators/rbac.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions or roles are required, allow access
    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check roles first (more specific)
    if (requiredRoles && requiredRoles.length > 0) {
      for (const role of requiredRoles) {
        const hasRole = await this.rbacService.hasRole(user.id, role);
        if (hasRole) {
          return true;
        }
      }

      // If specific roles are required but user doesn't have any, deny access
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    // Check permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      for (const permission of requiredPermissions) {
        const [resource, action] = permission.split(':');
        const hasPermission = await this.rbacService.hasPermission(
          user.id,
          resource,
          action,
        );

        if (!hasPermission) {
          throw new ForbiddenException(
            `Access denied. Missing permission: ${permission}`,
          );
        }
      }
    }

    return true;
  }
}
