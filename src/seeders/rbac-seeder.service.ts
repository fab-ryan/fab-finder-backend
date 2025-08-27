import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../modules/rbac/entities/role.entity';
import { Permission } from '../modules/rbac/entities/permission.entity';

@Injectable()
export class RbacSeederService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async seed(): Promise<void> {
    console.log('Starting RBAC seeding...');

    // Define default permissions
    const defaultPermissions = [
      // User management
      { name: 'user:create', description: 'Create new users' },
      { name: 'user:read', description: 'View user information' },
      { name: 'user:update', description: 'Update user information' },
      { name: 'user:delete', description: 'Delete users' },

      // Role management
      { name: 'role:create', description: 'Create new roles' },
      { name: 'role:read', description: 'View roles' },
      { name: 'role:update', description: 'Update roles' },
      { name: 'role:delete', description: 'Delete roles' },

      // Permission management
      { name: 'permission:read', description: 'View permissions' },
      { name: 'permission:assign', description: 'Assign permissions to roles' },
      {
        name: 'permission:revoke',
        description: 'Revoke permissions from roles',
      },

      // Content management
      { name: 'content:create', description: 'Create content' },
      { name: 'content:read', description: 'Read content' },
      { name: 'content:update', description: 'Update content' },
      { name: 'content:delete', description: 'Delete content' },
      { name: 'content:publish', description: 'Publish content' },

      // Analytics
      { name: 'analytics:read', description: 'View analytics' },

      // System
      { name: 'system:admin', description: 'Full system administration' },
    ];

    // Create permissions if they don't exist
    for (const permissionData of defaultPermissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
        console.log(`Created permission: ${permissionData.name}`);
      }
    }

    // Define default roles
    const defaultRoles = [
      {
        name: 'admin',
        description: 'Super administrator with all permissions',
        permissions: defaultPermissions.map((p) => p.name),
        isProtected: true,
      },
      {
        name: 'manager',
        description: 'Manager with user and content management permissions',
        permissions: [
          'user:read',
          'user:update',
          'role:read',
          'content:create',
          'content:read',
          'content:update',
          'content:delete',
          'content:publish',
          'analytics:read',
        ],
        isProtected: false,
      },
      {
        name: 'editor',
        description: 'Content editor',
        permissions: ['content:create', 'content:read', 'content:update'],
        isProtected: false,
      },
      {
        name: 'viewer',
        description: 'Read-only access',
        permissions: ['user:read', 'content:read'],
        isProtected: false,
      },
      {
        name: 'user',
        description: 'Basic user role',
        permissions: ['content:read'],
        isProtected: false,
      },
    ];

    // Create roles with permissions
    for (const roleData of defaultRoles) {
      let existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
        relations: ['permissions'],
      });

      if (!existingRole) {
        // Create new role
        const role = this.roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          isProtected: roleData.isProtected,
        });
        existingRole = await this.roleRepository.save(role);
        console.log(`Created role: ${roleData.name}`);
      }

      // Assign permissions to role
      const permissions = await this.permissionRepository.find({
        where: roleData.permissions.map((name) => ({ name })),
      });

      existingRole.permissions = permissions;
      await this.roleRepository.save(existingRole);
      console.log(
        `Assigned ${permissions.length} permissions to role: ${roleData.name}`,
      );
    }

    console.log('RBAC seeding completed successfully');
  }

  async reset(): Promise<void> {
    console.log('Resetting RBAC data...');

    // Remove all role-permission associations
    await this.roleRepository
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of({})
      .remove({});

    // Delete all roles except protected ones
    await this.roleRepository
      .createQueryBuilder()
      .delete()
      .where('isProtected = :isProtected', { isProtected: false })
      .execute();

    // Delete all permissions
    await this.permissionRepository.clear();

    console.log('RBAC data reset completed');
  }
}
