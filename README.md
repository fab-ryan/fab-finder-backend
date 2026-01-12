# Fab Finder Backend

A robust, production-ready NestJS backend service with comprehensive authentication, role-based access control (RBAC), and monitoring capabilities.

## 🚀 Features

### Core Features
- 🔐 **JWT Authentication** - Secure token-based authentication with refresh tokens
- 👤 **User Management** - Complete user lifecycle management with advanced filtering
- 🔑 **OAuth Integration** - Google OAuth 2.0 authentication
- 🔒 **RBAC System** - Flexible role-based access control with permissions
- 📊 **Prometheus Metrics** - Built-in monitoring and metrics collection
- 📝 **Comprehensive Logging** - Structured JSON logging with Winston
- 📖 **API Documentation** - Auto-generated Swagger/OpenAPI documentation
- 🐳 **Docker Support** - Fully containerized with Docker and Docker Compose
- 🧪 **Testing Suite** - Unit tests and E2E tests with high coverage

### Security Features
- Password reset with OTP verification
- Protected admin role (cannot be deleted/modified)
- Request context tracking with unique request IDs
- Global exception handling and validation
- Bearer token authentication
- Session management

### Developer Experience
- Automated setup scripts for environment configuration
- Database seeding for development
- Hot-reload development mode
- TypeScript with strict type checking
- ESLint and Prettier for code quality
- Compodoc documentation generation

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Yarn package manager
- Docker and Docker Compose (optional)

## 🛠️ Installation

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
yarn install

# Run automated setup (creates .env, generates secrets, validates config)
yarn setup:init

# Seed RBAC data (roles and permissions)
yarn setup:seed-rbac

# Start development server
yarn start:dev
```

### Manual Setup

```bash
# Install dependencies
yarn install

# Create environment file
yarn setup:env

# Generate JWT secrets
yarn setup secrets

# Validate configuration
yarn setup:validate

# Check setup status
yarn setup:status
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (or use `yarn setup:env`):

```env
# Application
PORT=3000
PREFIX=api

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=fab_finder
DB_SYNCHRONIZE=true

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (optional)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email
MAIL_PASS=your-password

# Backend Domain
BACKEND_DOMAIN=http://localhost:3000
```

See [SETUP.md](SETUP.md) for detailed configuration guide.

## 🚀 Running the Application

### Development

```bash
# Development mode with hot-reload
yarn start:dev

# Debug mode
yarn start:debug
```

### Production

```bash
# Build the application
yarn build

# Start production server
yarn start:prod
```

### Docker

```bash
# Development with Docker
yarn docker:dev

# Production with Docker
yarn docker:build
yarn docker:up

# Stop containers
yarn docker:down
```

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:3000/docs
```

### Main Endpoints

#### Authentication (`/api/auth`)
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/forget-password` - Request password reset
- `POST /auth/verify-otp/:token` - Verify OTP
- `POST /auth/reset-password/:token` - Reset password
- `GET /auth/sessions` - Get user sessions

#### Users (`/api/users`)
- `GET /users` - List users with filtering and pagination
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PATCH /users/:id/status` - Update user status

#### Roles (`/api/roles`)
- `GET /roles` - List all roles
- `GET /roles/:id` - Get role by ID
- `POST /roles` - Create new role
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role (except admin)

#### Permissions (`/api/permissions`)
- `GET /permissions` - List all permissions
- `GET /permissions/:id` - Get permission by ID
- `POST /permissions` - Create permission
- `PATCH /permissions/:id` - Update permission
- `DELETE /permissions/:id` - Delete permission

#### User Roles (`/api/users/:userId/roles`)
- `POST /users/:userId/roles` - Assign role to user
- `DELETE /users/:userId/roles/:roleId` - Remove role from user

#### Metrics (`/api/metrics`)
- `GET /metrics` - Prometheus metrics endpoint

#### Setup (`/api/setup`)
- `POST /setup/initialize` - Initialize application setup
- `GET /setup/status` - Get setup status
- `POST /setup/validate` - Validate environment

## 🧪 Testing

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov

# CI E2E tests
yarn test:e2e:ci
```

Test reports are generated in the `test/` directory.

## 🔑 RBAC System

The application features a comprehensive Role-Based Access Control system. See [RBAC.md](RBAC.md) for detailed documentation.

### Quick Usage

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RbacGuard, RequirePermissions, AdminOnly } from '@/modules/rbac';

@Controller('posts')
@UseGuards(RbacGuard)
export class PostController {
  @Get()
  @RequirePermissions('posts:read')
  findAll() {
    // Only users with 'posts:read' permission
  }

  @Delete(':id')
  @AdminOnly()
  delete() {
    // Only admin users
  }
}
```

### Default Roles & Permissions

```bash
# Seed RBAC data
yarn setup:seed-rbac
```

This creates default roles (admin, user, moderator) and permissions.

## 👥 User Management

### Create Admin User

```bash
# Create admin user
yarn users:create-admin

# Create test users
yarn users:create-test

# List all users
yarn users:list

# View user statistics
yarn users:stats

# Remove test users
yarn users:remove-test
```

## 📊 Monitoring

### Prometheus Integration

Start Prometheus and Grafana:

```bash
# Start Prometheus
yarn start:prometheus

# Stop Prometheus
yarn stop:prometheus

# Or use Docker Compose
docker-compose -f docker-compose.prometheus.yml up
```

Access Grafana dashboard:
```
http://localhost:3001
```

Default credentials: `admin / admin`

Import the provided dashboard from `grafana-dashboard.json`.

### Available Metrics

- HTTP request duration
- HTTP request count by status code
- Active requests
- Database connection pool metrics
- Custom business metrics

## 📝 Logging

Logs are written to the `logs/` directory in JSON format:

- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- `logs/requests.log` - Request/response logs

All logs include:
- Timestamp
- Request ID
- Log level
- Context
- Message
- Additional metadata

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── common/              # Shared modules, interceptors, filters
│   │   ├── filters/         # Exception filters
│   │   ├── interceptors/    # Response & logging interceptors
│   │   ├── middlewares/     # Request context middleware
│   │   └── response/        # Response DTO & helpers
│   ├── configs/             # Configuration files
│   ├── decorators/          # Custom decorators
│   ├── enums/               # Enumerations
│   ├── guards/              # Auth & RBAC guards
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication module
│   │   ├── rbac/            # RBAC module
│   │   ├── users/           # Users module
│   │   ├── setup/           # Setup module
│   │   └── prometheus/      # Monitoring module
│   ├── seeders/             # Database seeders
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry point
├── test/                    # E2E tests
├── scripts/                 # Utility scripts
├── logs/                    # Application logs
├── documentation/           # Generated documentation
├── docker-compose.yml       # Production Docker setup
├── docker-compose.dev.yml   # Development Docker setup
├── Dockerfile               # Production Dockerfile
├── Dockerfile.dev           # Development Dockerfile
└── README.md                # This file
```

## 📦 Scripts Reference

### Development
- `yarn start` - Start application
- `yarn start:dev` - Start with hot-reload
- `yarn start:debug` - Start in debug mode
- `yarn dev` - Alias for start:dev

### Building
- `yarn build` - Build for production
- `yarn start:prod` - Run production build

### Testing
- `yarn test` - Run unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:cov` - Generate coverage report
- `yarn test:e2e` - Run E2E tests

### Code Quality
- `yarn lint` - Lint and fix code
- `yarn format` - Format code with Prettier

### Setup & Management
- `yarn setup:init` - Complete initial setup
- `yarn setup:env` - Create .env file
- `yarn setup:validate` - Validate configuration
- `yarn setup:status` - Show setup status
- `yarn setup:seed-rbac` - Seed RBAC data

### User Management
- `yarn users:create-admin` - Create admin user
- `yarn users:create-test` - Create test users
- `yarn users:list` - List all users
- `yarn users:stats` - User statistics
- `yarn users:remove-test` - Remove test users

### Docker
- `yarn docker:build` - Build Docker image
- `yarn docker:up` - Start containers
- `yarn docker:down` - Stop containers
- `yarn docker:dev` - Start dev containers

### Documentation
- `yarn documentation` - Generate Compodoc documentation

### Monitoring
- `yarn start:prometheus` - Start Prometheus
- `yarn stop:prometheus` - Stop Prometheus

## 🔒 Security Best Practices

- JWT tokens are securely generated and validated
- Passwords are hashed using bcrypt
- SQL injection protection via TypeORM
- XSS protection through validation pipes
- CORS enabled with configurable origins
- Rate limiting (can be configured)
- Helmet security headers (can be added)
- Request validation with class-validator

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 🙋 Support

For issues, questions, or contributions, please refer to the documentation:
- [RBAC.md](RBAC.md) - Role-Based Access Control documentation
- [SETUP.md](SETUP.md) - Setup and configuration guide
- API Documentation - Available at `/docs` when server is running

## 🔗 Related Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Swagger/OpenAPI](https://swagger.io)
- [Prometheus](https://prometheus.io)
- [Winston Logger](https://github.com/winstonjs/winston)
