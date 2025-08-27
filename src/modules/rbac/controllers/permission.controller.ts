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
import { CreatePermissionDto, UpdatePermissionDto } from '../dto';
import { RbacGuard } from '../../../guards/rbac.guard';
import {
  AdminOnly,
  RequirePermissions,
} from '../../../decorators/rbac.decorator';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(RbacGuard)
export class PermissionController {
  constructor(private readonly rbacService: RbacService) {}

  @Post()
  @AdminOnly()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.rbacService.createPermission(
      createPermissionDto.name,
      createPermissionDto.description || '',
      createPermissionDto.resource,
      createPermissionDto.action,
    );
    return {
      success: true,
      data: permission,
      message: 'Permission created successfully',
    };
  }

  @Get()
  @RequirePermissions('permissions:read')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
  })
  async getAllPermissions() {
    const permissions = await this.rbacService.getAllPermissions();
    return {
      success: true,
      data: permissions,
      message: 'Permissions retrieved successfully',
    };
  }

  @Get(':id')
  @RequirePermissions('permissions:read')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully',
  })
  async getPermissionById(@Param('id') id: string) {
    const permission = await this.rbacService.getPermissionById(id);
    return {
      success: true,
      data: permission,
      message: 'Permission retrieved successfully',
    };
  }

  @Put(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.rbacService.updatePermission(
      id,
      updatePermissionDto.name,
      updatePermissionDto.description,
      updatePermissionDto.resource,
      updatePermissionDto.action,
    );
    return {
      success: true,
      data: permission,
      message: 'Permission updated successfully',
    };
  }

  @Delete(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Delete permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  async deletePermission(@Param('id') id: string) {
    await this.rbacService.deletePermission(id);
    return {
      success: true,
      message: 'Permission deleted successfully',
    };
  }
}
