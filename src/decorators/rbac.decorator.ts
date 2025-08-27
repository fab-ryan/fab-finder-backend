import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

// Helper decorator for common permission patterns
export const CanCreate = (resource: string) =>
  RequirePermissions(`${resource}:create`);

export const CanRead = (resource: string) =>
  RequirePermissions(`${resource}:read`);

export const CanUpdate = (resource: string) =>
  RequirePermissions(`${resource}:update`);

export const CanDelete = (resource: string) =>
  RequirePermissions(`${resource}:delete`);

export const CanManage = (resource: string) =>
  RequirePermissions(
    `${resource}:create`,
    `${resource}:read`,
    `${resource}:update`,
    `${resource}:delete`,
  );

export const AdminOnly = () => RequireRoles('admin');
