import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for accessing a route
 * @param permissions - Array of permissions in format 'resource:action'
 * @example @RequirePermissions('users:create', 'users:update')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to require permission to create a resource
 * @param resource - The resource name
 * @example @CanCreate('users')
 */
export const CanCreate = (resource: string) =>
  RequirePermissions(`${resource}:create`);

/**
 * Decorator to require permission to read a resource
 * @param resource - The resource name
 * @example @CanRead('users')
 */
export const CanRead = (resource: string) =>
  RequirePermissions(`${resource}:read`);

/**
 * Decorator to require permission to update a resource
 * @param resource - The resource name
 * @example @CanUpdate('users')
 */
export const CanUpdate = (resource: string) =>
  RequirePermissions(`${resource}:update`);

/**
 * Decorator to require permission to delete a resource
 * @param resource - The resource name
 * @example @CanDelete('users')
 */
export const CanDelete = (resource: string) =>
  RequirePermissions(`${resource}:delete`);

/**
 * Decorator to require all CRUD permissions for a resource
 * @param resource - The resource name
 * @example @CanManage('users')
 */
export const CanManage = (resource: string) =>
  RequirePermissions(
    `${resource}:create`,
    `${resource}:read`,
    `${resource}:update`,
    `${resource}:delete`,
  );

/**
 * Decorator for operations that require specific business logic permissions
 * @param permissions - Array of business-specific permissions
 * @example @RequireBusinessPermission('users:approve', 'users:suspend')
 */
export const RequireBusinessPermission = (...permissions: string[]) =>
  RequirePermissions(...permissions);
