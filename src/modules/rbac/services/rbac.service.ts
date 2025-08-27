import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, Permission, UserRole } from '../entities';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from '../dto';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  // Role Management
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new BadRequestException('Role with this name already exists');
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
    });

    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findByIds(
        createRoleDto.permissionIds,
      );
      role.permissions = permissions;
    }

    return await this.roleRepository.save(role);
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Protect admin role from modification
    if (role.isProtected && role.name === 'admin') {
      throw new ForbiddenException('Admin role cannot be modified');
    }

    Object.assign(role, updateRoleDto);

    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionRepository.findByIds(
        updateRoleDto.permissionIds,
      );
      role.permissions = permissions;
    }

    return await this.roleRepository.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Protect admin role from deletion
    if (role.isProtected && role.name === 'admin') {
      throw new ForbiddenException('Admin role cannot be deleted');
    }

    // Check if role is assigned to any users
    const userRoleCount = await this.userRoleRepository.count({
      where: { roleId: id },
    });

    if (userRoleCount > 0) {
      throw new BadRequestException(
        'Cannot delete role that is assigned to users',
      );
    }

    await this.roleRepository.remove(role);
  }

  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  // Permission Management
  async createPermission(
    name: string,
    description: string,
    resource: string,
    action: string,
  ): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({
      where: { name },
    });

    if (existingPermission) {
      throw new BadRequestException('Permission with this name already exists');
    }

    const permission = this.permissionRepository.create({
      name,
      description,
      resource,
      action,
    });

    return await this.permissionRepository.save(permission);
  }

  async updatePermission(
    id: string,
    name?: string,
    description?: string,
    resource?: string,
    action?: string,
  ): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (name) permission.name = name;
    if (description) permission.description = description;
    if (resource) permission.resource = resource;
    if (action) permission.action = action;

    return await this.permissionRepository.save(permission);
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepository.remove(permission);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  // User Role Assignment
  async assignRoleToUser(assignRoleDto: AssignRoleDto): Promise<UserRole> {
    const { userId, roleId } = assignRoleDto;

    // Check if role exists
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user already has this role
    const existingUserRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (existingUserRole) {
      throw new BadRequestException('User already has this role');
    }

    const userRole = this.userRoleRepository.create({
      userId,
      roleId,
    });

    return await this.userRoleRepository.save(userRole);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (!userRole) {
      throw new NotFoundException('User role assignment not found');
    }

    await this.userRoleRepository.remove(userRole);
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return await this.userRoleRepository.find({
      where: { userId, isActive: true },
      relations: ['role', 'role.permissions'],
    });
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId);
    const permissions = new Set<string>();

    userRoles.forEach((userRole) => {
      userRole.role.permissions.forEach((permission) => {
        permissions.add(`${permission.resource}:${permission.action}`);
      });
    });

    return Array.from(permissions);
  }

  // Check if user has specific permission
  async hasPermission(
    userId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(`${resource}:${action}`);
  }

  // Check if user has any of the specified roles
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some((userRole) => userRole.role.name === roleName);
  }

  // Bulk operations for permissions
  async addPermissionsToRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isProtected && role.name === 'admin') {
      throw new ForbiddenException('Admin role permissions cannot be modified');
    }

    const newPermissions =
      await this.permissionRepository.findByIds(permissionIds);

    // Add new permissions (avoid duplicates)
    const existingPermissionIds = role.permissions.map((p) => p.id);
    const permissionsToAdd = newPermissions.filter(
      (p) => !existingPermissionIds.includes(p.id),
    );

    role.permissions.push(...permissionsToAdd);

    return await this.roleRepository.save(role);
  }

  async removePermissionsFromRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isProtected && role.name === 'admin') {
      throw new ForbiddenException('Admin role permissions cannot be modified');
    }

    role.permissions = role.permissions.filter(
      (p) => !permissionIds.includes(p.id),
    );

    return await this.roleRepository.save(role);
  }
}
