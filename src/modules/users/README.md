# Users Module

The Users module provides comprehensive user management functionality including user creation, status management (disable/enable), user banning/unbanning, and user analytics.

## Features

### User Management
- ✅ Create users with role assignment
- ✅ View users with pagination and filtering
- ✅ Get user statistics
- ✅ Find user by ID or email
- ✅ User status management (active, inactive, banned, suspended)

### User Status Management
- **Active**: User can access the system normally
- **Inactive**: User account is disabled but not banned
- **Banned**: User is banned with reason tracking
- **Suspended**: Temporarily suspended account

### Permissions Required
- `user:create` - Create new users
- `user:read` - View user information and statistics
- `user:update` - Update user status, disable, enable, ban, unban
- `user:delete` - Delete users (Admin only)

## API Endpoints

### User Management
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users with pagination and filtering
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:id` - Get user by ID

### Status Management
- `PATCH /api/users/:id/status` - Update user status
- `PATCH /api/users/:id/disable` - Disable user
- `PATCH /api/users/:id/enable` - Enable user
- `PATCH /api/users/:id/ban` - Ban user with reason
- `PATCH /api/users/:id/unban` - Unban user

### Admin Operations
- `DELETE /api/users/:id` - Delete user (Admin only)

## Request Examples

### Create User
```json
POST /api/users
{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePassword123!",
  "roles": ["user", "editor"]
}
```

### Filter Users
```
GET /api/users?search=john&status=active&role=editor&page=1&limit=10
```

### Ban User
```json
PATCH /api/users/:id/ban
{
  "reason": "Violation of terms of service"
}
```

## CLI Commands

The module includes CLI commands for user management:

```bash
# Create default admin user
yarn users:create-admin

# Create test users with different roles
yarn users:create-test

# Remove test users
yarn users:remove-test

# Show user statistics
yarn users:stats

# List all users
yarn users:list
```

## Response Format

All endpoints return standardized responses:

```json
{
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

For paginated responses:
```json
{
  "message": "Users retrieved successfully",
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

## Security Features

- **Admin Protection**: Admin users cannot be disabled, banned, or deleted
- **Password Hashing**: All passwords are hashed using bcrypt
- **Permission-based Access**: All endpoints require appropriate permissions
- **Audit Trail**: Ban actions include timestamp, reason, and who performed the action

## Default Test Users

When using `yarn users:create-test`, the following test users are created:

- `manager@fab-finder.com` / `test123` (Manager role)
- `editor@fab-finder.com` / `test123` (Editor role)
- `viewer@fab-finder.com` / `test123` (Viewer role)
- `user@fab-finder.com` / `test123` (User role)

## Integration

The Users module integrates with:
- **RBAC Module**: For role and permission management
- **Setup Module**: For initial admin user creation
- **TypeORM**: For database operations
- **Winston**: For logging (via console in seeders)

## Database Schema

### User Entity
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `username` (String, Unique)
- `firstName` (String)
- `lastName` (String)
- `password` (String, Hashed)
- `status` (Enum: active, inactive, banned, suspended)
- `isVerified` (Boolean)
- `lastLoginAt` (DateTime, Nullable)
- `bannedAt` (DateTime, Nullable)
- `bannedReason` (Text, Nullable)
- `bannedBy` (String, Nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

The user entity has relationships with `UserRole` for role assignments.
