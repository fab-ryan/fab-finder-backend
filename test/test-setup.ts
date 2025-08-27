// Global test setup for E2E tests
import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random available port for testing

// Global test timeout
jest.setTimeout(30000);

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Console log configuration for tests
const originalError = console.error;
const originalWarn = console.warn;

// Suppress expected error logs during testing
console.error = (...args) => {
  if (
    !args.some(
      (arg) =>
        typeof arg === 'string' &&
        (arg.includes("Nest can't resolve dependencies") ||
          arg.includes('UnauthorizedException') ||
          arg.includes('ValidationError')),
    )
  ) {
    originalError(...args);
  }
};

console.warn = (...args) => {
  if (
    !args.some(
      (arg) =>
        typeof arg === 'string' &&
        (arg.includes('deprecated') || arg.includes('experimental')),
    )
  ) {
    originalWarn(...args);
  }
};

// Restore console methods after tests
afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
