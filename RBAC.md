# Role-Based Access Control (RBAC) System

## Overview

This RBAC system provides comprehensive role and permission management for the Fab Finder backend. It features:

- ✅ **Protected Admin Role**: Admin role cannot be modified or deleted
- ✅ **Flexible Permission System**: Resource-action based permissions
- ✅ **Seeders**: Automatic setup of roles and permissions
- ✅ **Guards & Decorators**: Easy integration with controllers
- ✅ **REST API**: Full CRUD operations for roles and permissions
- ✅ **Type Safety**: Full TypeScript support

## Quick Start

### 1. Setup RBAC Data

```bash
# Seed roles and permissions
yarn setup:seed-rbac

# Or as part of complete setup
yarn setup:init
```

### 2. Using in Controllers

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RbacGuard, RequirePermissions, AdminOnly } from '@/modules/rbac';

@Controller('posts')
@UseGuards(RbacGuard)
export class PostController {
  @Get()
  @RequirePermissions('posts:read')
  findAll() {
    // Only users with 'posts:read' permission can access
  }

  @Post()
  @RequirePermissions('posts:create')
  create() {
    // Only users with 'posts:create' permission can access
  }

  @Delete(':id')
  @AdminOnly()
  delete() {
    // Only admin users can access
  }
}
```

## Entities

### Role Entity
- `id`: UUID primary key
- `name`: Unique role name (e.g., 'admin', 'manager', 'user')
- `description`: Role description
- `isProtected`: Prevents modification (admin role is protected)
- `isActive`: Soft delete flag
- `permissions`: Many-to-many relationship with permissions

### Permission Entity
- `id`: UUID primary key
- `name`: Unique permission name (e.g., 'users:create')
- `description`: Permission description
- `resource`: Resource name (e.g., 'users', 'posts')
- `action`: Action name (e.g., 'create', 'read', 'update', 'delete')
- `isActive`: Soft delete flag

### UserRole Entity
- `id`: UUID primary key
- `userId`: Foreign key to user
- `roleId`: Foreign key to role
- `isActive`: Assignment active status

## Pre-seeded Roles

### Admin Role (Protected)
- **Name**: `admin`
- **Protected**: Yes (cannot be modified or deleted)
- **Permissions**: All permissions
- **Description**: Super Administrator with all permissions

### Manager Role
- **Name**: `manager`
- **Permissions**: User and content management
- **Description**: Manager with user and content management permissions

### Editor Role
- **Name**: `editor`
- **Permissions**: Content management
- **Description**: Content Editor with content management permissions

### User Role
- **Name**: `user`
- **Permissions**: Basic read permissions
- **Description**: Regular user with basic permissions

### Viewer Role
- **Name**: `viewer`
- **Permissions**: Read-only access
- **Description**: Read-only access to content

## Pre-seeded Permissions

### User Management
- `users:create` - Create users
- `users:read` - Read users
- `users:update` - Update users
- `users:delete` - Delete users

### Role Management
- `roles:create` - Create roles
- `roles:read` - Read roles
- `roles:update` - Update roles
- `roles:delete` - Delete roles

### Permission Management
- `permissions:create` - Create permissions
- `permissions:read` - Read permissions
- `permissions:update` - Update permissions
- `permissions:delete` - Delete permissions

### Content Management
- `posts:create` - Create posts
- `posts:read` - Read posts
- `posts:update` - Update posts
- `posts:delete` - Delete posts

### System Management
- `settings:create` - Create settings
- `settings:read` - Read settings
- `settings:update` - Update settings
- `settings:delete` - Delete settings

### Analytics & Reports
- `reports:read` - Read reports
- `analytics:read` - Read analytics

### System Operations
- `system:backup` - System backup
- `system:restore` - System restore
- `system:maintenance` - System maintenance

## Decorators

### Permission-Based
```typescript
@RequirePermissions('users:create', 'users:update') // Requires ALL permissions
@CanCreate('posts')     // Shorthand for 'posts:create'
@CanRead('users')       // Shorthand for 'users:read'
@CanUpdate('posts')     // Shorthand for 'posts:update'
@CanDelete('users')     // Shorthand for 'users:delete'
@CanManage('posts')     // All CRUD permissions for resource
```

### Role-Based
```typescript
@RequireRoles('admin', 'manager')  // Requires ANY of these roles
@AdminOnly()                       // Shorthand for admin role
```

## API Endpoints

### Roles Management
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create new role (Admin only)
- `PUT /api/roles/:id` - Update role (Admin only)
- `DELETE /api/roles/:id` - Delete role (Admin only)
- `POST /api/roles/assign` - Assign role to user (Admin only)
- `DELETE /api/roles/:roleId/users/:userId` - Remove role from user (Admin only)
- `POST /api/roles/:id/permissions` - Add permissions to role (Admin only)
- `DELETE /api/roles/:id/permissions` - Remove permissions from role (Admin only)

### Permissions Management
- `GET /api/permissions` - Get all permissions
- `GET /api/permissions/:id` - Get permission by ID
- `POST /api/permissions` - Create new permission (Admin only)
- `PUT /api/permissions/:id` - Update permission (Admin only)
- `DELETE /api/permissions/:id` - Delete permission (Admin only)

### User Role Queries
- `GET /api/users/:userId/roles` - Get user roles
- `GET /api/users/:userId/permissions` - Get user permissions
- `POST /api/users/:userId/check-permission/:resource/:action` - Check user permission
- `POST /api/users/:userId/check-role/:roleName` - Check user role

## Usage Examples

### Service Injection
```typescript
@Injectable()
export class UserService {
  constructor(private readonly rbacService: RbacService) {}

  async createUser(userId: string, userData: any) {
    // Check if current user can create users
    const canCreate = await this.rbacService.hasPermission(
      userId, 
      'users', 
      'create'
    );
    
    if (!canCreate) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Create user logic...
  }
}
```

### Custom Role Creation
```typescript
// Via seeder service
await rbacSeederService.createCustomRole(
  'moderator',
  'Content moderator',
  ['posts:read', 'posts:update', 'users:read']
);

// Via RBAC service
const role = await rbacService.createRole({
  name: 'customer-support',
  description: 'Customer support representative',
  permissionIds: [permission1.id, permission2.id]
});
```

### Permission Checking
```typescript
// Check single permission
const canEdit = await rbacService.hasPermission(userId, 'posts', 'update');

// Check role
const isAdmin = await rbacService.hasRole(userId, 'admin');

// Get all user permissions
const permissions = await rbacService.getUserPermissions(userId);
```

## Security Features

### Admin Role Protection
- Admin role has `isProtected: true`
- Cannot be updated or deleted
- Always maintains all permissions
- Special validation in service layer

### Permission Validation
- Permissions follow `resource:action` format
- Resource and action validation
- Duplicate permission prevention
- Soft deletion for audit trails

### Role Assignment Security
- User role assignments are tracked
- Active/inactive status for temporary access
- Audit trail via timestamps

## Best Practices

### 1. Use Resource-Based Permissions
```typescript
// Good: Specific resource and action
@RequirePermissions('users:create')

// Avoid: Generic permissions
@RequirePermissions('admin_access')
```

### 2. Combine Guards with Decorators
```typescript
@Controller('users')
@UseGuards(RbacGuard)  // Apply to entire controller
export class UserController {
  @Get()
  @RequirePermissions('users:read')
  findAll() {}
}
```

### 3. Use Helper Decorators
```typescript
// Use helper decorators for readability
@CanCreate('posts')  // Instead of @RequirePermissions('posts:create')
@AdminOnly()         // Instead of @RequireRoles('admin')
```

### 4. Permission Naming Convention
```
Format: {resource}:{action}
Examples:
- users:create
- posts:read
- settings:update
- reports:delete
```

## CLI Commands

```bash
# Seed RBAC data
yarn setup:seed-rbac

# Complete setup (includes RBAC)
yarn setup:init

# Check setup status
yarn setup:status
```

## TypeScript Types

```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  isProtected: boolean;
  isActive: boolean;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Extending the System

### Adding New Permissions
```typescript
// Via seeder
await rbacSeederService.addCustomPermission(
  'invoices:approve',
  'Approve invoices',
  'invoices',
  'approve'
);

// Via service
await rbacService.createPermission(
  'invoices:approve',
  'Approve invoices',
  'invoices',
  'approve'
);
```

### Creating Custom Roles
```typescript
await rbacSeederService.createCustomRole(
  'accountant',
  'Financial accountant',
  ['invoices:read', 'invoices:approve', 'reports:read']
);
```

This RBAC system provides a solid foundation for managing access control in your application while maintaining security and flexibility.
