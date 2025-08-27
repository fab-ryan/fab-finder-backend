import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserStatusDto,
  UserFilterDto,
} from './dto/user.dto';
import { AdminGuard, PermissionGuard } from '@/guards';
import type { AuthenticatedUser } from '@/types';
import { CurrentUser } from '@/decorators/user.decorator';
import { RequirePermissions } from '@/decorators';

@ApiTags('Users')
@Controller('users')
@UseGuards(PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('user:create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const user = await this.usersService.createUser(
      createUserDto,
      currentUser.id,
    );
    return {
      message: 'User created successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        roles: user.userRoles?.map((ur) => ur.role.name) || [],
      },
    };
  }

  @Get()
  @RequirePermissions('user:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAllUsers(@Query() filterDto: UserFilterDto) {
    const result = await this.usersService.findAllUsers(filterDto);
    return {
      message: 'Users retrieved successfully',
      data: {
        users: result.users.map((user) => ({
          id: user.id,
          email: user.email,
          username: user.username,
          status: user.status,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          roles: user.userRoles?.map((ur) => ur.role.name) || [],
          bannedAt: user.bannedAt,
          bannedReason: user.bannedReason,
          bannedBy: user.bannedBy,
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
    };
  }

  @Get('stats')
  @RequirePermissions('user:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
  })
  async getUserStats() {
    const stats = await this.usersService.getUserStats();
    return {
      message: 'User statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  @RequirePermissions('user:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findUserById(id);
    return {
      message: 'User retrieved successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        isVerified: user.isVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles:
          user.userRoles?.map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            description: ur.role.description,
            permissions:
              ur.role.permissions?.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
              })) || [],
          })) || [],
        bannedAt: user.bannedAt,
        bannedReason: user.bannedReason,
        bannedBy: user.bannedBy,
      },
    };
  }

  @Patch(':id/status')
  @RequirePermissions('user:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user status (disable, enable, ban, unban)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const user = await this.usersService.updateUserStatus(
      id,
      updateStatusDto,
      currentUser.id,
    );
    return {
      message: 'User status updated successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        bannedAt: user.bannedAt,
        bannedReason: user.bannedReason,
        bannedBy: user.bannedBy,
      },
    };
  }

  @Patch(':id/disable')
  @ApiBearerAuth()
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Disable user' })
  @ApiResponse({ status: 200, description: 'User disabled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async disableUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const user = await this.usersService.disableUser(
      id,
      body.reason,
      currentUser.id,
    );
    return {
      message: 'User disabled successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
      },
    };
  }

  @Patch(':id/enable')
  @ApiBearerAuth()
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Enable user' })
  @ApiResponse({ status: 200, description: 'User enabled successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async enableUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.enableUser(id);
    return {
      message: 'User enabled successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
      },
    };
  }

  @Patch(':id/ban')
  @ApiBearerAuth()
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Ban user' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async banUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason: string },
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const user = await this.usersService.banUser(
      id,
      body.reason,
      currentUser.id,
    );
    return {
      message: 'User banned successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        bannedAt: user.bannedAt,
        bannedReason: user.bannedReason,
        bannedBy: user.bannedBy,
      },
    };
  }

  @Patch(':id/unban')
  @ApiBearerAuth()
  @RequirePermissions('user:update')
  @ApiOperation({ summary: 'Unban user' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async unbanUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.unbanUser(id);
    return {
      message: 'User unbanned successfully',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
      },
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.deleteUser(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
