/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

/**
 * Test utilities for E2E testing
 */
export class TestUtils {
  /**
   * Creates a test request with common headers
   */
  static createRequest(app: INestApplication, method: string, path: string) {
    return request(app.getHttpServer())
      [method](path)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
  }

  /**
   * Validates standard response format from ResponseInterceptor
   */
  static validateResponseFormat(responseBody: any, expectedPath: string) {
    expect(responseBody).toHaveProperty('success');
    expect(responseBody).toHaveProperty('data');
    expect(responseBody).toHaveProperty('message');
    expect(responseBody).toHaveProperty('timestamp');
    expect(responseBody).toHaveProperty('path', expectedPath);
    expect(responseBody).toHaveProperty('requestId');

    expect(typeof responseBody.success).toBe('boolean');
    expect(typeof responseBody.timestamp).toBe('string');
    expect(typeof responseBody.path).toBe('string');
    expect(typeof responseBody.requestId).toBe('string');
  }

  /**
   * Validates error response format
   */
  static validateErrorResponse(responseBody: any, expectedStatus: number) {
    expect(responseBody).toHaveProperty('message');
    expect(responseBody).toHaveProperty('timestamp');
    expect(responseBody).toHaveProperty('path');
    expect(responseBody).toHaveProperty('requestId');

    if (expectedStatus === 400) {
      expect(responseBody).toHaveProperty('errors');
      expect(Array.isArray(responseBody.errors)).toBe(true);
    }
  }

  /**
   * Generates a valid UUID for testing
   */
  static generateTestUUID(): string {
    return '550e8400-e29b-41d4-a716-446655440000';
  }

  /**
   * Generates test user data
   */
  static generateTestUser() {
    return {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
    };
  }

  /**
   * Generates test role data
   */
  static generateTestRole() {
    return {
      name: 'test-role',
      description: 'Test role description',
    };
  }

  /**
   * Generates test permission data
   */
  static generateTestPermission() {
    return {
      name: 'test:permission',
      description: 'Test permission description',
    };
  }

  /**
   * Tests endpoint existence (should not return 404)
   */
  static async testEndpointExists(
    app: INestApplication,
    method: string,
    path: string,
    expectedStatuses: number[] = [200, 400, 401, 403],
  ) {
    const response = await request(app.getHttpServer())[method](path);
    expect(expectedStatuses).toContain(response.status);
    expect(response.status).not.toBe(404);
  }

  /**
   * Tests authentication requirement
   */
  static async testAuthRequired(
    app: INestApplication,
    method: string,
    path: string,
    data?: any,
  ) {
    let req = request(app.getHttpServer())[method](path);

    if (data && ['post', 'put', 'patch'].includes(method)) {
      req = req.send(data);
    }

    const response = await req;
    expect([401, 403]).toContain(response.status);
    TestUtils.validateErrorResponse(response.body, response.status);
  }

  /**
   * Tests validation errors
   */
  static async testValidationError(
    app: INestApplication,
    method: string,
    path: string,
    invalidData: any,
  ) {
    const response = await request(app.getHttpServer())
      [method](path)
      .send(invalidData);

    expect(response.status).toBe(400);
    TestUtils.validateErrorResponse(response.body, 400);
  }

  /**
   * Tests UUID parameter validation
   */
  static async testUUIDValidation(
    app: INestApplication,
    method: string,
    pathTemplate: string,
  ) {
    const invalidPath = pathTemplate.replace(':id', 'invalid-uuid');
    const response = await request(app.getHttpServer())[method](invalidPath);

    expect(response.status).toBe(400);
    TestUtils.validateErrorResponse(response.body, 400);
  }

  /**
   * Tests content type handling
   */
  static async testContentType(
    app: INestApplication,
    path: string,
    data: any,
    contentType: string = 'application/json',
    expectedStatuses: number[] = [200, 400, 401, 403],
  ) {
    const response = await request(app.getHttpServer())
      .post(path)
      .set('Content-Type', contentType)
      .send(contentType === 'application/json' ? JSON.stringify(data) : data);

    expect(expectedStatuses).toContain(response.status);
  }

  /**
   * Waits for a specified amount of time
   */
  static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Creates multiple concurrent requests for testing
   */
  static async createConcurrentRequests(
    app: INestApplication,
    method: string,
    path: string,
    count: number = 5,
  ): Promise<any[]> {
    const requests = Array.from({ length: count }, () =>
      request(app.getHttpServer())[method](path),
    );

    return Promise.all(requests);
  }
}

/**
 * Mock authentication helper
 */
export class MockAuthHelper {
  /**
   * Creates a mock JWT token (for future use when auth is implemented)
   */
  static createMockToken(
    payload: any = { userId: TestUtils.generateTestUUID() },
  ): string {
    // This is a placeholder for when authentication is implemented
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Creates authorization header
   */
  static createAuthHeader(token?: string): string {
    return `Bearer ${token || this.createMockToken()}`;
  }
}

/**
 * Database test utilities (for when database is set up)
 */
export class DatabaseTestUtils {
  /**
   * Clean up test data (placeholder for future database cleanup)
   */
  static cleanupTestData(): void {
    // Placeholder for database cleanup
    console.log('Database cleanup would go here');
  }

  /**
   * Seed test data (placeholder for future database seeding)
   */
  static seedTestData(): void {
    // Placeholder for database seeding
    console.log('Database seeding would go here');
  }
}

/**
 * Environment test utilities
 */
export class EnvironmentTestUtils {
  private static originalEnv: NodeJS.ProcessEnv = {};

  /**
   * Backup current environment variables
   */
  static backupEnvironment(): void {
    this.originalEnv = { ...process.env };
  }

  /**
   * Restore original environment variables
   */
  static restoreEnvironment(): void {
    process.env = { ...this.originalEnv };
  }

  /**
   * Set test environment variable
   */
  static setEnvVar(key: string, value: string): void {
    process.env[key] = value;
  }

  /**
   * Remove environment variable
   */
  static removeEnvVar(key: string): void {
    delete process.env[key];
  }
}
