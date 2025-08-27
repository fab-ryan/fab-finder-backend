import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RbacService } from '../services/rbac.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from '../dto';
import { RbacGuard } from '@/guards/rbac.guard';
import { AdminOnly, RequirePermissions } from '@/decorators/rbac.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(RbacGuard)
export class RoleController {
  constructor(private readonly rbacService: RbacService) {}

  @Post()
  @AdminOnly()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rbacService.createRole(createRoleDto);
    return {
      success: true,
      data: role,
      message: 'Role created successfully',
    };
  }

  @Get()
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async getAllRoles() {
    const roles = await this.rbacService.getAllRoles();
    return {
      success: true,
      data: roles,
      message: 'Roles retrieved successfully',
    };
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  async getRoleById(@Param('id') id: string) {
    const role = await this.rbacService.getRoleById(id);
    return {
      success: true,
      data: role,
      message: 'Role retrieved successfully',
    };
  }

  @Put(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.rbacService.updateRole(id, updateRoleDto);
    return {
      success: true,
      data: role,
      message: 'Role updated successfully',
    };
  }

  @Delete(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  async deleteRole(@Param('id') id: string) {
    await this.rbacService.deleteRole(id);
    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }

  @Post('assign')
  @AdminOnly()
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    const userRole = await this.rbacService.assignRoleToUser(assignRoleDto);
    return {
      success: true,
      data: userRole,
      message: 'Role assigned successfully',
    };
  }

  @Delete(':roleId/users/:userId')
  @AdminOnly()
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  async removeRoleFromUser(
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
  ) {
    await this.rbacService.removeRoleFromUser(userId, roleId);
    return {
      success: true,
      message: 'Role removed successfully',
    };
  }

  @Post(':id/permissions')
  @AdminOnly()
  @ApiOperation({ summary: 'Add permissions to role' })
  @ApiResponse({ status: 200, description: 'Permissions added successfully' })
  async addPermissionsToRole(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[] },
  ) {
    const role = await this.rbacService.addPermissionsToRole(
      id,
      body.permissionIds,
    );
    return {
      success: true,
      data: role,
      message: 'Permissions added successfully',
    };
  }

  @Delete(':id/permissions')
  @AdminOnly()
  @ApiOperation({ summary: 'Remove permissions from role' })
  @ApiResponse({
    status: 200,
    description: 'Permissions removed successfully',
  })
  async removePermissionsFromRole(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[] },
  ) {
    const role = await this.rbacService.removePermissionsFromRole(
      id,
      body.permissionIds,
    );
    return {
      success: true,
      data: role,
      message: 'Permissions removed successfully',
    };
  }
}
