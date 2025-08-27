# Integration Test Suite

This directory contains comprehensive end-to-end (E2E) integration tests for the fab-finder-backend NestJS application.

## Test Structure

### Test Files

- **`app.e2e-spec.ts`** - Main application integration tests
- **`setup.e2e-spec.ts`** - Setup module integration tests
- **`users.e2e-spec.ts`** - Users module integration tests
- **`rbac.e2e-spec.ts`** - RBAC (Role-Based Access Control) module integration tests
- **`app-integration.e2e-spec.ts`** - Cross-module integration tests

### Utility Files

- **`test-utils.ts`** - Common test utilities and helpers
- **`test-setup.ts`** - Global test configuration and setup
- **`jest-e2e.config.ts`** - Jest configuration for E2E tests
- **`jest-e2e.json`** - Original Jest configuration (legacy)

## Test Coverage

### 1. Setup Module (`setup.e2e-spec.ts`)
Tests the application setup and configuration functionality:
- Environment variable management
- .env file creation and validation
- Initial setup process
- Secret generation
- Response format consistency

### 2. Users Module (`users.e2e-spec.ts`)
Tests user management functionality:
- Authentication and authorization requirements
- Input validation for user data
- CRUD operations endpoints
- Response format consistency
- HTTP method support

### 3. RBAC Module (`rbac.e2e-spec.ts`)
Tests role-based access control functionality:
- Role management (CRUD operations)
- Permission management
- User-role assignments
- Authentication requirements
- Input validation

### 4. Application Integration (`app-integration.e2e-spec.ts`)
Tests cross-cutting concerns and application-wide features:
- Global middleware and interceptors
- Response format consistency across all endpoints
- Error handling uniformity
- Security headers
- CORS configuration
- API prefix handling
- Performance and timing

### 5. Main Application (`app.e2e-spec.ts`)
Tests basic application functionality:
- Application startup and configuration
- Global prefix application
- Response interceptor functionality
- Basic endpoint accessibility

## Features Tested

### Response Format Consistency
All tests verify that responses follow the standard `ResponseDto` format:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "timestamp": string,
  "path": string,
  "requestId": string
}
```

### Authentication & Authorization
- Tests verify that protected endpoints require authentication
- Validates that unauthorized requests return appropriate error responses
- Ensures consistent error response format for auth failures

### Input Validation
- Tests validate that invalid input data is properly rejected
- Verifies validation error responses include detailed error information
- Ensures UUID parameter validation works correctly

### HTTP Methods & Endpoints
- Verifies that all expected endpoints exist (don't return 404)
- Tests that appropriate HTTP methods are supported
- Validates response status codes for different scenarios

### Content-Type Handling
- Tests JSON content-type support
- Validates handling of malformed JSON
- Tests rejection of unsupported content types

### Error Handling
- Consistent error response format across all endpoints
- Proper HTTP status codes for different error types
- Detailed validation error messages

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
# or
yarn test:e2e
```

### Run Specific Test Files
```bash
# Run setup tests only
npx jest test/setup.e2e-spec.ts --config test/jest-e2e.json

# Run users tests only
npx jest test/users.e2e-spec.ts --config test/jest-e2e.json

# Run RBAC tests only
npx jest test/rbac.e2e-spec.ts --config test/jest-e2e.json
```

### Run Tests with Coverage
```bash
npm run test:e2e -- --coverage
```

### Run Tests in Watch Mode
```bash
npx jest --config test/jest-e2e.json --watch
```

## Test Environment Setup

### Environment Variables
Tests use the following environment configuration:
- `NODE_ENV=test`
- `PORT=0` (random available port)
- Additional test-specific variables can be set in `.env.test`

### Prerequisites
Before running tests, ensure:
1. All dependencies are installed (`npm install` or `yarn install`)
2. The application can start successfully
3. Any required environment variables are configured

## Test Utilities

### TestUtils Class
Provides common utilities for testing:
- `validateResponseFormat()` - Validates standard response structure
- `validateErrorResponse()` - Validates error response format
- `generateTestUUID()` - Generates valid test UUIDs
- `testEndpointExists()` - Tests endpoint availability
- `testAuthRequired()` - Tests authentication requirements

### MockAuthHelper Class
Utilities for authentication testing (for future use):
- `createMockToken()` - Creates mock JWT tokens
- `createAuthHeader()` - Creates authorization headers

### EnvironmentTestUtils Class
Utilities for environment variable testing:
- `backupEnvironment()` / `restoreEnvironment()` - Env backup/restore
- `setEnvVar()` / `removeEnvVar()` - Environment manipulation

## Test Philosophy

### Integration Testing Approach
These tests focus on:
1. **API Contract Testing** - Ensuring endpoints behave as expected
2. **Cross-Module Integration** - Testing how modules work together
3. **Error Handling Consistency** - Uniform error responses
4. **Response Format Standardization** - Consistent API responses
5. **Security Testing** - Authentication and authorization requirements

### What's Not Covered
These integration tests do NOT cover:
- Unit testing of individual functions/methods
- Database-specific functionality (when database is added)
- External service integrations
- Performance stress testing
- Browser-specific functionality

## Future Enhancements

### When Database is Added
- Add database seeding/cleanup utilities
- Test data persistence and retrieval
- Test transaction handling
- Add database connection testing

### When Authentication is Implemented
- Add authenticated request testing
- Test JWT token validation
- Test role-based access control with real tokens
- Add session management testing

### Additional Test Scenarios
- Rate limiting tests
- File upload/download tests
- WebSocket connections (if added)
- Email functionality tests
- External API integration tests

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Tests use `PORT=0` to find available ports automatically
   - If issues persist, check for running services

2. **Module Resolution Errors**
   - Ensure `tsconfig.json` includes test directory
   - Check import paths are correct

3. **Timeout Issues**
   - Tests have 30-second timeout configured
   - Increase timeout in `jest-e2e.config.ts` if needed

4. **Authentication Errors**
   - Current tests expect 401/403 responses for protected endpoints
   - This is correct behavior until authentication is implemented

### Debug Mode
Run tests with debug output:
```bash
DEBUG=* npm run test:e2e
```

## Contributing

When adding new features:
1. Add corresponding integration tests
2. Follow existing test patterns and utilities
3. Ensure response format consistency
4. Test both success and error scenarios
5. Update this README if needed

For questions or issues with the test suite, please refer to the main project documentation or create an issue in the repository.
