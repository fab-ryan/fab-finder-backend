import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ROLES_KEY } from './roles.decorator';

export const PERMISSION_KEY = 'permission';

export interface PermissionOptions {
  /**
   * Resource name (e.g., 'user', 'post', 'order')
   */
  resource: string;

  /**
   * Action name (e.g., 'create', 'read', 'update', 'delete')
   */
  action: string;

  /**
   * Roles that can access this endpoint by default when no permission is defined
   * If empty, all authenticated users with any role can access
   * @default [] - all authenticated users with any role
   */
  defaultRoles?: string[];

  /**
   * If true, allows access to all authenticated users when no permission exists
   * @default true
   */
  allowByDefault?: boolean;
}

/**
 * Dynamic permission decorator that allows role-based access by default,
 * but restricts to specific permissions when they are defined in the database.
 *
 * @example
 * // Allow all authenticated users by default, restrict when 'user:update' permission exists
 * @DynamicPermission({ resource: 'user', action: 'update' })
 *
 * @example
 * // Only allow admin and manager by default, restrict when 'order:create' permission exists
 * @DynamicPermission({ resource: 'order', action: 'create', defaultRoles: ['admin', 'manager'] })
 *
 * @example
 * // Deny by default (require permission to exist)
 * @DynamicPermission({ resource: 'payment', action: 'refund', allowByDefault: false })
 */
export const DynamicPermission = (options: PermissionOptions) => {
  return applyDecorators(
    SetMetadata(PERMISSION_KEY, options),
    // Also set roles for fallback behavior
    options.defaultRoles && options.defaultRoles.length > 0
      ? SetMetadata(ROLES_KEY, options.defaultRoles)
      : SetMetadata(ROLES_KEY, []),
  );
};

/**
 * Helper decorator for dynamic create permission
 * @param resource - The resource name
 * @param defaultRoles - Roles that can access by default
 */
export const DynamicCreate = (resource: string, defaultRoles: string[] = []) =>
  DynamicPermission({ resource, action: 'create', defaultRoles });

/**
 * Helper decorator for dynamic read permission
 * @param resource - The resource name
 * @param defaultRoles - Roles that can access by default
 */
export const DynamicRead = (resource: string, defaultRoles: string[] = []) =>
  DynamicPermission({ resource, action: 'read', defaultRoles });

/**
 * Helper decorator for dynamic update permission
 * @param resource - The resource name
 * @param defaultRoles - Roles that can access by default
 */
export const DynamicUpdate = (resource: string, defaultRoles: string[] = []) =>
  DynamicPermission({ resource, action: 'update', defaultRoles });

/**
 * Helper decorator for dynamic delete permission
 * @param resource - The resource name
 * @param defaultRoles - Roles that can access by default
 */
export const DynamicDelete = (resource: string, defaultRoles: string[] = []) =>
  DynamicPermission({ resource, action: 'delete', defaultRoles });

/**
 * Helper decorator for dynamic manage (all CRUD) permissions
 * NOTE: This applies the same defaultRoles to all actions.
 * For fine-grained control, use individual DynamicCreate, DynamicRead, etc.
 * @param resource - The resource name
 * @param defaultRoles - Roles that can access by default
 */
export const DynamicManage = (resource: string, defaultRoles: string[] = []) =>
  DynamicPermission({
    resource,
    action: 'manage',
    defaultRoles,
  });
