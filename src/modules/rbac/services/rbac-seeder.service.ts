import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, Permission } from '../entities';

@Injectable()
export class RbacSeederService {
  private readonly logger = new Logger(RbacSeederService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async seedRbacData(): Promise<void> {
    this.logger.log('🌱 Starting RBAC seeding...');

    try {
      await this.seedPermissions();
      await this.seedRoles();
      this.logger.log('✅ RBAC seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ RBAC seeding failed:', error);
      throw error;
    }
  }

  private async seedPermissions(): Promise<void> {
    this.logger.log('🔐 Seeding permissions...');

    const permissionsData = [
      // User Management
      {
        name: 'users:create',
        description: 'Create users',
        resource: 'users',
        action: 'create',
      },
      {
        name: 'users:read',
        description: 'Read users',
        resource: 'users',
        action: 'read',
      },
      {
        name: 'users:update',
        description: 'Update users',
        resource: 'users',
        action: 'update',
      },
      {
        name: 'users:delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
      },

      // Role Management
      {
        name: 'roles:create',
        description: 'Create roles',
        resource: 'roles',
        action: 'create',
      },
      {
        name: 'roles:read',
        description: 'Read roles',
        resource: 'roles',
        action: 'read',
      },
      {
        name: 'roles:update',
        description: 'Update roles',
        resource: 'roles',
        action: 'update',
      },
      {
        name: 'roles:delete',
        description: 'Delete roles',
        resource: 'roles',
        action: 'delete',
      },

      // Permission Management
      {
        name: 'permissions:create',
        description: 'Create permissions',
        resource: 'permissions',
        action: 'create',
      },
      {
        name: 'permissions:read',
        description: 'Read permissions',
        resource: 'permissions',
        action: 'read',
      },
      {
        name: 'permissions:update',
        description: 'Update permissions',
        resource: 'permissions',
        action: 'update',
      },
      {
        name: 'permissions:delete',
        description: 'Delete permissions',
        resource: 'permissions',
        action: 'delete',
      },

      // Settings Management
      {
        name: 'settings:create',
        description: 'Create settings',
        resource: 'settings',
        action: 'create',
      },
      {
        name: 'settings:read',
        description: 'Read settings',
        resource: 'settings',
        action: 'read',
      },
      {
        name: 'settings:update',
        description: 'Update settings',
        resource: 'settings',
        action: 'update',
      },
      {
        name: 'settings:delete',
        description: 'Delete settings',
        resource: 'settings',
        action: 'delete',
      },

      // Content Management (Example for your application)
      {
        name: 'posts:create',
        description: 'Create posts',
        resource: 'posts',
        action: 'create',
      },
      {
        name: 'posts:read',
        description: 'Read posts',
        resource: 'posts',
        action: 'read',
      },
      {
        name: 'posts:update',
        description: 'Update posts',
        resource: 'posts',
        action: 'update',
      },
      {
        name: 'posts:delete',
        description: 'Delete posts',
        resource: 'posts',
        action: 'delete',
      },

      // Reports & Analytics
      {
        name: 'reports:read',
        description: 'Read reports',
        resource: 'reports',
        action: 'read',
      },
      {
        name: 'analytics:read',
        description: 'Read analytics',
        resource: 'analytics',
        action: 'read',
      },

      // System Operations
      {
        name: 'system:backup',
        description: 'System backup',
        resource: 'system',
        action: 'backup',
      },
      {
        name: 'system:restore',
        description: 'System restore',
        resource: 'system',
        action: 'restore',
      },
      {
        name: 'system:maintenance',
        description: 'System maintenance',
        resource: 'system',
        action: 'maintenance',
      },
    ];

    for (const permissionData of permissionsData) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
        this.logger.log(`Created permission: ${permissionData.name}`);
      }
    }

    this.logger.log('✅ Permissions seeding completed');
  }

  private async seedRoles(): Promise<void> {
    this.logger.log('👥 Seeding roles...');

    // Get all permissions for admin role
    const allPermissions = await this.permissionRepository.find();

    const rolesData = [
      {
        name: 'admin',
        description: 'Super Administrator with all permissions',
        isProtected: true,
        permissions: allPermissions, // Admin gets all permissions
      },
      {
        name: 'manager',
        description: 'Manager with user and content management permissions',
        isProtected: false,
        permissions: allPermissions.filter((p) =>
          [
            'users:read',
            'users:update',
            'posts:create',
            'posts:read',
            'posts:update',
            'posts:delete',
            'reports:read',
          ].includes(p.name),
        ),
      },
      {
        name: 'editor',
        description: 'Content Editor with content management permissions',
        isProtected: false,
        permissions: allPermissions.filter((p) =>
          ['posts:create', 'posts:read', 'posts:update', 'users:read'].includes(
            p.name,
          ),
        ),
      },
      {
        name: 'user',
        description: 'Regular user with basic permissions',
        isProtected: false,
        permissions: allPermissions.filter((p) =>
          ['posts:read', 'users:read'].includes(p.name),
        ),
      },
      {
        name: 'viewer',
        description: 'Read-only access to content',
        isProtected: false,
        permissions: allPermissions.filter(
          (p) => p.action === 'read' && ['posts', 'users'].includes(p.resource),
        ),
      },
    ];

    for (const roleData of rolesData) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
        relations: ['permissions'],
      });

      if (!existingRole) {
        const role = this.roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          isProtected: roleData.isProtected,
          permissions: roleData.permissions,
        });

        await this.roleRepository.save(role);
        this.logger.log(
          `Created role: ${roleData.name} with ${roleData.permissions.length} permissions`,
        );
      } else {
        // Update existing role permissions (except admin if protected)
        if (!existingRole.isProtected || existingRole.name !== 'admin') {
          existingRole.permissions = roleData.permissions;
          await this.roleRepository.save(existingRole);
          this.logger.log(
            `Updated role: ${roleData.name} with ${roleData.permissions.length} permissions`,
          );
        } else {
          this.logger.log(`Skipped updating protected role: ${roleData.name}`);
        }
      }
    }

    this.logger.log('✅ Roles seeding completed');
  }

  async addCustomPermission(
    name: string,
    description: string,
    resource: string,
    action: string,
  ): Promise<void> {
    const existingPermission = await this.permissionRepository.findOne({
      where: { name },
    });

    if (!existingPermission) {
      const permission = this.permissionRepository.create({
        name,
        description,
        resource,
        action,
      });

      await this.permissionRepository.save(permission);
      this.logger.log(`Added custom permission: ${name}`);
    }
  }

  async createCustomRole(
    name: string,
    description: string,
    permissionNames: string[],
  ): Promise<void> {
    const existingRole = await this.roleRepository.findOne({
      where: { name },
    });

    if (existingRole) {
      this.logger.warn(`Role ${name} already exists`);
      return;
    }

    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.name IN (:...names)', { names: permissionNames })
      .getMany();

    const role = this.roleRepository.create({
      name,
      description,
      isProtected: false,
      permissions,
    });

    await this.roleRepository.save(role);
    this.logger.log(
      `Created custom role: ${name} with ${permissions.length} permissions`,
    );
  }
}
