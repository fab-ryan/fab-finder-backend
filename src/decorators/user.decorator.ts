import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Decorator to inject the current user from the request
 * @example getCurrentUser(@CurrentUser() user: any)
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);

/**
 * Decorator to inject the current user's ID
 * @example getUserId(@CurrentUserId() userId: string)
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user?.id;
  },
);

/**
 * Decorator to inject the current user's roles
 * @example getUserRoles(@CurrentUserRoles() roles: string[])
 */
export const CurrentUserRoles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user?.roles || [];
  },
);

/**
 * Decorator to inject the current user's permissions
 * @example getUserPermissions(@CurrentUserPermissions() permissions: string[])
 */
export const CurrentUserPermissions = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user?.permissions || [];
  },
);
