import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../modules/rbac/services/rbac.service';
import {
  PERMISSION_KEY,
  PermissionOptions,
} from '../decorators/permission.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Guard that implements dynamic permission checking:
 * 1. If no dynamic permission is defined, allows all authenticated users
 * 2. If dynamic permission is defined but doesn't exist in DB, falls back to role check
 * 3. If dynamic permission exists in DB, requires user to have that permission
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const dynamicPermission =
      this.reflector.getAllAndOverride<PermissionOptions>(
        PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );

    // If no dynamic permission decorator, allow access (for public routes or routes with other guards)
    if (!dynamicPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const {
      resource,
      action,
      defaultRoles,
      allowByDefault = true,
    } = dynamicPermission;
    const permissionName = `${resource}:${action}`;

    // Check if this permission exists in the database
    const permissionExists = await this.rbacService.permissionExists(
      resource,
      action,
    );

    if (permissionExists) {
      // Permission is defined in DB - strict check required
      const hasPermission = await this.rbacService.hasPermission(
        user.id,
        resource,
        action,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Access denied. Missing permission: ${permissionName}`,
        );
      }

      return true;
    }

    // Permission doesn't exist in DB - use fallback behavior
    if (!allowByDefault) {
      // If allowByDefault is false and permission doesn't exist, deny access
      throw new ForbiddenException(
        `Access denied. Permission '${permissionName}' is not configured.`,
      );
    }

    // Check default roles if specified
    if (defaultRoles && defaultRoles.length > 0) {
      const requiredRoles =
        this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
          context.getHandler(),
          context.getClass(),
        ]) || defaultRoles;

      // User must have at least one of the default roles
      const userHasRole = await this.checkUserHasAnyRole(
        user.id,
        requiredRoles,
      );

      if (!userHasRole) {
        throw new ForbiddenException(
          `Access denied. Required roles: ${requiredRoles.join(', ')}`,
        );
      }
    }

    // All checks passed or no restrictions - allow access
    return true;
  }

  private async checkUserHasAnyRole(
    userId: string,
    roles: string[],
  ): Promise<boolean> {
    for (const role of roles) {
      const hasRole = await this.rbacService.hasRole(userId, role);
      if (hasRole) {
        return true;
      }
    }
    return false;
  }
}
