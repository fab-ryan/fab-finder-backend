import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to require specific roles for accessing a route
 * @param roles - Array of role names
 * @example @RequireRoles('admin', 'manager')
 */
export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

/**
 * Decorator for admin-only access
 * @example @AdminOnly()
 */
export const AdminOnly = () => RequireRoles('admin');

/**
 * Decorator for manager and admin access
 * @example @ManagerOrAdmin()
 */
export const ManagerOrAdmin = () => RequireRoles('admin', 'manager');

/**
 * Decorator for editor, manager, and admin access
 * @example @EditorAndAbove()
 */
export const EditorAndAbove = () => RequireRoles('admin', 'manager', 'editor');

/**
 * Decorator for any authenticated user with a role
 * @example @AuthenticatedUser()
 */
export const AuthenticatedUser = () =>
  RequireRoles('admin', 'manager', 'editor', 'user', 'viewer');

/**
 * Decorator for content management roles
 * @example @ContentManager()
 */
export const ContentManager = () => RequireRoles('admin', 'manager', 'editor');

/**
 * Decorator for user management roles
 * @example @UserManager()
 */
export const UserManager = () => RequireRoles('admin', 'manager');
