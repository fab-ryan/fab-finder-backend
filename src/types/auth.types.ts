import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export interface RbacGuardContext {
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAll?: boolean;
  allowOwner?: boolean;
}
