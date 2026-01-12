import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RbacService } from '../services/rbac.service';
import { PermissionGuard } from '../../../guards/permission.guard';
import { DynamicRead } from '../../../decorators/permission.decorator';

@ApiTags('User Roles')
@Controller('users')
@UseGuards(PermissionGuard)
export class UserRoleController {
  constructor(private readonly rbacService: RbacService) {}

  @Get(':userId/roles')
  @DynamicRead('users', ['admin'])
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponse({
    status: 200,
    description: 'User roles retrieved successfully',
  })
  async getUserRoles(@Param('userId') userId: string) {
    const userRoles = await this.rbacService.getUserRoles(userId);
    return {
      success: true,
      data: userRoles,
      message: 'User roles retrieved successfully',
    };
  }

  @Get(':userId/permissions')
  @DynamicRead('users', ['admin'])
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({
    status: 200,
    description: 'User permissions retrieved successfully',
  })
  async getUserPermissions(@Param('userId') userId: string) {
    const permissions = await this.rbacService.getUserPermissions(userId);
    return {
      success: true,
      data: permissions,
      message: 'User permissions retrieved successfully',
    };
  }

  @Post(':userId/check-permission/:resource/:action')
  @DynamicRead('users', ['admin'])
  @ApiOperation({ summary: 'Check if user has specific permission' })
  @ApiResponse({ status: 200, description: 'Permission check completed' })
  async checkUserPermission(
    @Param('userId') userId: string,
    @Param('resource') resource: string,
    @Param('action') action: string,
  ) {
    const hasPermission = await this.rbacService.hasPermission(
      userId,
      resource,
      action,
    );
    return {
      success: true,
      data: { hasPermission },
      message: 'Permission check completed',
    };
  }

  @Post(':userId/check-role/:roleName')
  @DynamicRead('users', ['admin'])
  @ApiOperation({ summary: 'Check if user has specific role' })
  @ApiResponse({ status: 200, description: 'Role check completed' })
  async checkUserRole(
    @Param('userId') userId: string,
    @Param('roleName') roleName: string,
  ) {
    const hasRole = await this.rbacService.hasRole(userId, roleName);
    return {
      success: true,
      data: { hasRole },
      message: 'Role check completed',
    };
  }
}
